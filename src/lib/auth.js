import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-in-production"
);
const COOKIE = "clikou_session";

export async function createSession(user) {
  const token = await new SignJWT({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function getSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload; // { id, name, email }
  } catch {
    return null;
  }
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

// Token de uso único (por prazo) para confirmar o e-mail da conta.
export async function createVerificationToken(userId) {
  return new SignJWT({ id: userId.toString(), purpose: "verify-email" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("48h")
    .sign(secret);
}

export async function readVerificationToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.purpose === "verify-email" ? payload.id : null;
  } catch {
    return null;
  }
}

// State do OAuth do Mercado Pago: prova no callback que o fluxo começou
// aqui, logado como este usuário (anti-CSRF).
export async function createMpStateToken(userId) {
  return new SignJWT({ id: userId.toString(), purpose: "mp-oauth" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);
}

export async function readMpStateToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.purpose === "mp-oauth" ? payload.id : null;
  } catch {
    return null;
  }
}

// Admins são definidos por e-mail em ADMIN_EMAILS (separados por vírgula).
const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdmin(session) {
  return !!session?.email && adminEmails.includes(session.email.toLowerCase());
}
