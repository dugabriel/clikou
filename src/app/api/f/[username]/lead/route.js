import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Lead from "@/models/Lead";
import { isPro } from "@/lib/plan";
import { containsForbiddenWord } from "@/lib/moderation";
import { emailEnabled, sendLeadEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/ratelimit";

// Guardrails anti-spam: o formulário é público (sem login nem captcha), então
// limita por IP e também por fotógrafo — proteger a caixa de entrada dele é o
// objetivo, venha o spam de um IP só ou de uma botnet.
const IP_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 }; // 5 envios / 10 min por IP
const PHOTOGRAPHER_LIMIT = { limit: 30, windowMs: 24 * 60 * 60 * 1000 }; // 30 / dia

// Recebe um pedido de orçamento do perfil público (recurso Pro).
export async function POST(req, ctx) {
  const { username } = await ctx.params;
  const { name, contact, message, website } = await req.json();

  // Honeypot: campo invisível que só robô preenche.
  if (website) return NextResponse.json({ ok: true });

  const ipHit = await rateLimit("lead-ip", clientIp(req), IP_LIMIT);
  if (!ipHit.ok) {
    return NextResponse.json(
      {
        error: `Muitos pedidos em pouco tempo. Espere ${Math.ceil(
          ipHit.retryAfterSeconds / 60
        )} min e tente de novo.`,
      },
      { status: 429 }
    );
  }

  const cleanName = String(name || "").trim().slice(0, 80);
  const cleanContact = String(contact || "").trim().slice(0, 120);
  const cleanMessage = String(message || "").trim().slice(0, 1000);
  if (!cleanName || !cleanContact) {
    return NextResponse.json(
      { error: "Preencha seu nome e um contato." },
      { status: 400 }
    );
  }
  if (containsForbiddenWord(cleanName, cleanMessage)) {
    return NextResponse.json(
      { error: "Sua mensagem contém palavras não permitidas." },
      { status: 400 }
    );
  }

  await dbConnect();
  const photographer = await User.findOne({ username }).select(
    "name email plan planCurrentPeriodEnd"
  );
  if (!photographer || !isPro(photographer)) {
    return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });
  }

  const targetHit = await rateLimit(
    "lead-photographer",
    photographer._id.toString(),
    PHOTOGRAPHER_LIMIT
  );
  if (!targetHit.ok) {
    return NextResponse.json(
      { error: "Esse fotógrafo recebeu muitos pedidos hoje. Tente amanhã." },
      { status: 429 }
    );
  }

  const lead = await Lead.create({
    photographer: photographer._id,
    name: cleanName,
    contact: cleanContact,
    message: cleanMessage,
  });

  if (emailEnabled) {
    const appUrl = process.env.APP_URL || new URL(req.url).origin;
    try {
      await sendLeadEmail({
        to: photographer.email,
        name: photographer.name,
        lead,
        appUrl,
      });
    } catch (e) {
      console.error("E-mail de lead:", e.message);
    }
  }

  return NextResponse.json({ ok: true });
}
