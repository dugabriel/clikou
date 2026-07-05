import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { createSession, createVerificationToken } from "@/lib/auth";
import { emailEnabled, sendVerificationEmail } from "@/lib/email";

export async function POST(req) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Informe e-mail e senha." }, { status: 400 });
  }

  await dbConnect();
  const user = await User.findOne({ email: email.toLowerCase() });
  if (user && !user.passwordHash) {
    return NextResponse.json(
      { error: "Essa conta entra com o Google. Use o botão \"Continuar com Google\"." },
      { status: 401 }
    );
  }
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json(
      { error: "E-mail ou senha incorretos." },
      { status: 401 }
    );
  }

  // Conta criada por senha que ainda não confirmou o e-mail.
  if (user.emailVerified === false) {
    if (!emailEnabled) {
      // Envio de e-mail desativado (dev): libera a conta.
      user.emailVerified = true;
      await user.save();
    } else {
      // Reenvia o link no máximo a cada 60s pra não virar spam.
      const canResend =
        !user.verificationSentAt ||
        Date.now() - user.verificationSentAt.getTime() > 60_000;
      if (canResend) {
        const appUrl = process.env.APP_URL || new URL(req.url).origin;
        const token = await createVerificationToken(user._id);
        await sendVerificationEmail(user.email, user.name, token, appUrl);
        user.verificationSentAt = new Date();
        await user.save();
      }
      return NextResponse.json(
        {
          error: `Confirme seu e-mail para entrar. Enviamos o link para ${user.email} — confira também o spam.`,
        },
        { status: 403 }
      );
    }
  }

  await createSession(user);
  return NextResponse.json({ ok: true });
}
