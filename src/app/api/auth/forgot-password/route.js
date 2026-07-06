import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { createPasswordResetToken } from "@/lib/auth";
import { verifyChallenge } from "@/lib/captcha";
import { emailEnabled, sendPasswordResetEmail } from "@/lib/email";

const COOLDOWN_MS = 60 * 1000;

export async function POST(req) {
  const { email, captcha, captchaToken, website } = await req.json();

  // Honeypot: campo invisível que só robô preenche.
  if (website) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: "Informe seu e-mail." }, { status: 400 });
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
