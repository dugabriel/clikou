import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const segredo = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-segredo-troque-em-producao"
);
const COOKIE = "clikou_sessao";

export async function criarSessao(usuario) {
  const token = await new SignJWT({
    id: usuario._id.toString(),
    nome: usuario.nome,
    email: usuario.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(segredo);

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function obterSessao() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, segredo);
    return payload; // { id, nome, email }
  } catch {
    return null;
  }
}

export async function encerrarSessao() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

// Token de uso único (por prazo) para confirmar o e-mail da conta.
export async function criarTokenVerificacao(usuarioId) {
  return new SignJWT({ id: usuarioId.toString(), uso: "verificar-email" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("48h")
    .sign(segredo);
}

export async function lerTokenVerificacao(token) {
  try {
    const { payload } = await jwtVerify(token, segredo);
    return payload.uso === "verificar-email" ? payload.id : null;
  } catch {
    return null;
  }
}

// Admins são definidos por e-mail em ADMIN_EMAILS (separados por vírgula).
const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function ehAdmin(sessao) {
  return !!sessao?.email && adminEmails.includes(sessao.email.toLowerCase());
}
