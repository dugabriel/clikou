import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { createSession } from "@/lib/auth";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

// Rota única: sem ?code inicia o fluxo, com ?code é o callback do Google
// (o redirect URI cadastrado no console é APP_URL/auth/google).
export async function GET(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const jar = await cookies();
  const appUrl = process.env.APP_URL || url.origin;
  const redirectUri = `${appUrl}/auth/google`;

  if (!code) {
    const state = {
      n: crypto.randomBytes(16).toString("hex"),
      next: url.searchParams.get("next") || "",
    };
    jar.set("google_oauth", JSON.stringify(state), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state: state.n,
      prompt: "select_account",
    });
    return NextResponse.redirect(`${AUTH_URL}?${params}`);
  }

  // ----- Callback -----
  let state = null;
  try {
    state = JSON.parse(jar.get("google_oauth")?.value || "");
  } catch {}
  jar.delete("google_oauth");

  const loginError = NextResponse.redirect(new URL("/login?error=google", appUrl));
  if (!state || state.n !== url.searchParams.get("state")) return loginError;

  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
  const tokens = await tokenRes.json();
  if (!tokens.access_token) {
    console.error("Google OAuth: falha ao trocar código", tokens);
    return loginError;
  }

  const profileRes = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = await profileRes.json(); // { sub, email, name, picture }
  if (!profile.email) return loginError;

  await dbConnect();
  let user = await User.findOne({ email: profile.email.toLowerCase() });
  if (!user) {
    user = await User.create({
      name: profile.name || profile.email.split("@")[0],
      email: profile.email,
      googleId: profile.sub,
      avatarUrl: profile.picture || "",
    });
  } else if (!user.googleId) {
    // Conta criada por e-mail/senha: vincula o Google a ela.
    // O Google comprovou a posse do e-mail, então a conta fica confirmada.
    user.googleId = profile.sub;
    user.emailVerified = true;
    if (!user.avatarUrl) user.avatarUrl = profile.picture || "";
    await user.save();
  }

  await createSession(user);
  return NextResponse.redirect(new URL(state.next || "/events", appUrl));
}
