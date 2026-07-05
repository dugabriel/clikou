import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";

// Captcha próprio, sem serviço externo: uma continha simples cuja resposta
// vai hasheada num token assinado — o cliente devolve token + resposta.
const key = process.env.AUTH_SECRET || "dev-secret-change-in-production";
const secret = new TextEncoder().encode(key);

const NUMBER_WORDS = [
  "zero", "um", "dois", "três", "quatro",
  "cinco", "seis", "sete", "oito", "nove",
];

// Tokens já usados (anti-replay); por instância, suficiente contra spam bobo.
const used = new Map(); // jti -> expiresAt (ms)
function pruneUsed() {
  const now = Date.now();
  for (const [jti, exp] of used) if (exp < now) used.delete(jti);
}

function hashAnswer(answer) {
  return crypto
    .createHash("sha256")
    .update(`captcha:${key}:${String(answer).trim()}`)
    .digest("hex");
}

export async function generateChallenge() {
  const a = 1 + Math.floor(Math.random() * 9);
  const b = 1 + Math.floor(Math.random() * 9);
  const token = await new SignJWT({ purpose: "captcha", h: hashAnswer(a + b) })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(crypto.randomUUID())
    .setExpirationTime("15m")
    .sign(secret);
  // Mistura número por extenso e algarismo pra dificultar parse automático.
  return { question: `Quanto é ${NUMBER_WORDS[a]} + ${b}?`, token };
}

export async function verifyChallenge(token, answer) {
  if (!token || answer == null || answer === "") return false;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.purpose !== "captcha") return false;
    if (used.has(payload.jti)) return false;
    if (payload.h !== hashAnswer(answer)) return false;
    pruneUsed();
    used.set(payload.jti, payload.exp * 1000);
    return true;
  } catch {
    return false;
  }
}
