import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { createSession, createVerificationToken } from "@/lib/auth";
import { verifyChallenge } from "@/lib/captcha";
import { emailEnabled, sendVerificationEmail } from "@/lib/email";

export async function POST(req) {
  const { name, email, password, captcha, captchaToken, website } =
    await req.json();

  // Honeypot: campo invisível que só robô preenche.
  if (website) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  if (!(await verifyChallenge(captchaToken, captcha))) {
    return NextResponse.json(
      { error: "Resposta da verificação anti-spam incorreta. Tente de novo.", captcha: true },
      { status: 400 }
    );
  }
  const { containsForbiddenWord } = await import("@/lib/moderation");
  if (containsForbiddenWord(name)) {
    return NextResponse.json(
      { error: "Esse nome contém palavras não permitidas." },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "A senha precisa ter pelo menos 6 caracteres." },
      { status: 400 }
    );
  }

  await dbConnect();
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return NextResponse.json(
      { error: "Já existe uma conta com esse e-mail." },
      { status: 409 }
    );
  }

  const user = await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    // Com envio de e-mail ativo, a conta nasce pendente de confirmação.
    ...(emailEnabled
      ? { emailVerified: false, verificationSentAt: new Date() }
      : {}),
  });

  if (emailEnabled) {
    const appUrl = process.env.APP_URL || new URL(req.url).origin;
    const token = await createVerificationToken(user._id);
    // sendVerificationEmail retorna false se o provedor recusar (ex.: limite
    // de conta trial no MailerSend). Avisa o cliente em vez de fingir sucesso.
    const emailSent = await sendVerificationEmail(
      user.email,
      user.name,
      token,
      appUrl
    );
    return NextResponse.json({ ok: true, verify: true, emailSent });
  }

  await createSession(user);
  return NextResponse.json({ ok: true });
}
