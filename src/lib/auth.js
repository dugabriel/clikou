import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

// Token de redefinição de senha. Carrega uma impressão digital do hash
// atual: trocada a senha, todos os links antigos invalidam sozinhos
// (uso único na prática, sem precisar guardar estado).
export function passwordFingerprint(passwordHash) {
  return crypto
    .createHash("sha256")
    .update(`reset:${passwordHash || ""}`)
    .digest("hex")
    .slice(0, 16);
}

export async function createPasswordResetToken(user) {
  return new SignJWT({
    id: user._id.toString(),
    purpose: "reset-password",
    ph: passwordFingerprint(user.passwordHash),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);
}

export async function readPasswordResetToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.purpose === "reset-password"
      ? { id: payload.id, ph: payload.ph }
      : null;
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

// Desbloqueio de uma galeria de entrega protegida por PIN. Guardado num
// cookie por galeria; o cliente não tem conta, só prova que acertou o PIN.
export async function createGalleryAccessToken(galleryId) {
  return new SignJWT({ gid: galleryId.toString(), purpose: "gallery-access" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);
}

export async function readGalleryAccessToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.purpose === "gallery-access" ? payload.gid : null;
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

// Toda página /admin chama isto no próprio page.js — o layout sozinho não
// basta: com partial rendering o layout não re-renderiza a cada navegação,
// então a checagem precisa ficar junto de quem busca os dados.
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (!isAdmin(session)) redirect("/");
  return session;
}
