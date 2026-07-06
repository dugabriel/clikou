import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import {
  readPasswordResetToken,
  passwordFingerprint,
  createSession,
} from "@/lib/auth";

const INVALID =
  "Link inválido, expirado ou já usado. Peça uma nova redefinição.";

export async function POST(req) {
  const { token, password } = await req.json();

  if (!password || password.length < 6) {
    return NextResponse.json(
      { error: "A senha precisa ter pelo menos 6 caracteres." },
      { status: 400 }
    );
  }

  const payload = await readPasswordResetToken(token || "");
  if (!payload) {
    return NextResponse.json({ error: INVALID }, { status: 400 });
  }

  await dbConnect();
  const user = await User.findById(payload.id);
  // A impressão digital confere com o hash atual? Se a senha já mudou
  // depois que o link foi emitido, ele não vale mais (uso único).
  if (!user || passwordFingerprint(user.passwordHash) !== payload.ph) {
    return NextResponse.json({ error: INVALID }, { status: 400 });
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  // Chegar ao link prova posse do e-mail — aproveita e confirma a conta.
  user.emailVerified = true;
  await user.save();

  await createSession(user);
  return NextResponse.json({ ok: true });
}
