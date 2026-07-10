import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { createPasswordResetToken } from "@/lib/auth";
import { verifyChallenge } from "@/lib/captcha";
import { emailEnabled, sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/ratelimit";

const COOLDOWN_MS = 60 * 1000;

// Guardrails anti-spam além do cooldown: limite por IP e teto diário por
// conta alvo (o cooldown sozinho ainda deixaria bombardear 1 e-mail/min).
const IP_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 }; // 5 pedidos / 15 min por IP
const EMAIL_DAILY_LIMIT = { limit: 5, windowMs: 24 * 60 * 60 * 1000 }; // 5 e-mails / dia

export async function POST(req) {
  const { email, captcha, captchaToken, website } = await req.json();

  // Honeypot: campo invisível que só robô preenche.
  if (website) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: "Informe seu e-mail." }, { status: 400 });
  }
  const ipHit = await rateLimit("forgot-ip", clientIp(req), IP_LIMIT);
  if (!ipHit.ok) {
    return NextResponse.json(
      {
        error: `Muitas tentativas em pouco tempo. Espere ${Math.ceil(
          ipHit.retryAfterSeconds / 60
        )} min e tente de novo.`,
      },
      { status: 429 }
    );
  }
  if (!(await verifyChallenge(captchaToken, captcha))) {
    return NextResponse.json(
      { error: "Resposta da verificação anti-spam incorreta. Tente de novo.", captcha: true },
      { status: 400 }
    );
  }

  // Daqui em diante a resposta é sempre a mesma, exista a conta ou não —
  // evita descobrir e-mails cadastrados por tentativa.
  const generic = NextResponse.json({ ok: true });
  if (!emailEnabled) return generic; // modo dev: sem envio

  await dbConnect();
  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user) return generic;

  // Cooldown por conta contra spam de e-mails.
  if (user.resetSentAt && Date.now() - user.resetSentAt.getTime() < COOLDOWN_MS) {
    return generic;
  }

  // Teto diário por conta alvo: barra bombardeio lento vindo de IPs variados.
  const emailHit = await rateLimit("reset-email", user.email, EMAIL_DAILY_LIMIT);
  if (!emailHit.ok) return generic;

  try {
    const appUrl = process.env.APP_URL || new URL(req.url).origin;
    const token = await createPasswordResetToken(user);
    await sendPasswordResetEmail(user.email, user.name, token, appUrl);
    user.resetSentAt = new Date();
    await user.save();
  } catch (e) {
    console.error("E-mail de redefinição:", e.message);
  }
  return generic;
}
