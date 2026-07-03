import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { dbConnect } from "@/lib/db";
import Usuario from "@/models/Usuario";
import { criarSessao } from "@/lib/auth";

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
    const estado = {
      n: crypto.randomBytes(16).toString("hex"),
      voltar: url.searchParams.get("voltar") || "",
    };
    jar.set("google_oauth", JSON.stringify(estado), {
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
      state: estado.n,
      prompt: "select_account",
    });
    return NextResponse.redirect(`${AUTH_URL}?${params}`);
  }

  // ----- Callback -----
  let estado = null;
  try {
    estado = JSON.parse(jar.get("google_oauth")?.value || "");
  } catch {}
  jar.delete("google_oauth");

  const erroLogin = NextResponse.redirect(new URL("/login?erro=google", appUrl));
  if (!estado || estado.n !== url.searchParams.get("state")) return erroLogin;

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
    return erroLogin;
  }

  const perfilRes = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const perfil = await perfilRes.json(); // { sub, email, name, picture }
  if (!perfil.email) return erroLogin;

  await dbConnect();
  let usuario = await Usuario.findOne({ email: perfil.email.toLowerCase() });
  if (!usuario) {
    usuario = await Usuario.create({
      nome: perfil.name || perfil.email.split("@")[0],
      email: perfil.email,
      googleId: perfil.sub,
      avatarUrl: perfil.picture || "",
    });
  } else if (!usuario.googleId) {
    // Conta criada por e-mail/senha: vincula o Google a ela.
    // O Google comprovou a posse do e-mail, então a conta fica confirmada.
    usuario.googleId = perfil.sub;
    usuario.emailVerificado = true;
    if (!usuario.avatarUrl) usuario.avatarUrl = perfil.picture || "";
    await usuario.save();
  }

  await criarSessao(usuario);
  return NextResponse.redirect(new URL(estado.voltar || "/eventos", appUrl));
}
