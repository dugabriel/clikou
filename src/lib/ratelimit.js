import { dbConnect } from "@/lib/db";
import RateLimit from "@/models/RateLimit";

// Guardrail anti-spam: limita quantas vezes uma ação pode acontecer por janela
// de tempo (janela fixa). O contador vive no Mongo, então o limite vale mesmo
// com várias instâncias no Cloud Run — contador em memória não valeria.
//
//   const hit = await rateLimit("lead-ip", clientIp(req), { limit: 5, windowMs: 600_000 });
//   if (!hit.ok) return NextResponse.json({ error: ... }, { status: 429 });
export async function rateLimit(action, id, { limit, windowMs }) {
  await dbConnect();
  const bucket = Math.floor(Date.now() / windowMs);
  const windowEndMs = (bucket + 1) * windowMs;
  const key = `${action}:${id}:${bucket}`;
  let doc;
  try {
    doc = await incr(key, windowEndMs);
  } catch (e) {
    // Duas requisições podem criar o mesmo balde ao mesmo tempo (E11000);
    // na segunda tentativa o balde já existe e o $inc resolve.
    if (e.code === 11000) doc = await incr(key, windowEndMs);
    else throw e;
  }
  if (doc.count > limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((windowEndMs - Date.now()) / 1000)),
    };
  }
  return { ok: true };
}

function incr(key, windowEndMs) {
  return RateLimit.findOneAndUpdate(
    { key },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(windowEndMs) } },
    { upsert: true, new: true }
  );
}

// IP real do cliente. No Cloud Run o Google Front End ANEXA o IP da conexão
// ao fim do x-forwarded-for — o último item é o confiável. Pegar o primeiro
// deixaria o atacante driblar o limite enviando o próprio header com IPs
// inventados.
export function clientIp(req) {
  const fwd = req.headers.get("x-forwarded-for") || "";
  const parts = fwd.split(",").map((s) => s.trim()).filter(Boolean);
  return parts[parts.length - 1] || "unknown";
}
