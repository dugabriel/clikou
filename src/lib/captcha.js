import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";

// Captcha próprio, sem serviço externo: uma continha simples cuja resposta
// vai hasheada num token assinado — o cliente devolve token + resposta.
const chave = process.env.AUTH_SECRET || "dev-segredo-troque-em-producao";
const segredo = new TextEncoder().encode(chave);

const NUMEROS = [
  "zero", "um", "dois", "três", "quatro",
  "cinco", "seis", "sete", "oito", "nove",
];

// Tokens já usados (anti-replay); por instância, suficiente contra spam bobo.
const usados = new Map(); // jti -> expiraEm (ms)
function limparUsados() {
  const agora = Date.now();
  for (const [jti, exp] of usados) if (exp < agora) usados.delete(jti);
}

function hashResposta(resposta) {
  return crypto
    .createHash("sha256")
    .update(`captcha:${chave}:${String(resposta).trim()}`)
    .digest("hex");
}

export async function gerarDesafio() {
  const a = 1 + Math.floor(Math.random() * 9);
  const b = 1 + Math.floor(Math.random() * 9);
  const token = await new SignJWT({ uso: "captcha", h: hashResposta(a + b) })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(crypto.randomUUID())
    .setExpirationTime("15m")
    .sign(segredo);
  // Mistura número por extenso e algarismo pra dificultar parse automático.
  return { pergunta: `Quanto é ${NUMEROS[a]} + ${b}?`, token };
}

export async function conferirDesafio(token, resposta) {
  if (!token || resposta == null || resposta === "") return false;
  try {
    const { payload } = await jwtVerify(token, segredo);
    if (payload.uso !== "captcha") return false;
    if (usados.has(payload.jti)) return false;
    if (payload.h !== hashResposta(resposta)) return false;
    limparUsados();
    usados.set(payload.jti, payload.exp * 1000);
    return true;
  } catch {
    return false;
  }
}
