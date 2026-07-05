import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Withdrawal from "@/models/Withdrawal";
import { getSession } from "@/lib/auth";
import { toCents } from "@/lib/currency";

const MIN_WITHDRAWAL_CENTS = 2000; // R$ 20,00

export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const { amount, pixKey } = await req.json();
  const amountCents = toCents(amount);
  if (amountCents === null || amountCents < MIN_WITHDRAWAL_CENTS) {
    return NextResponse.json(
      { error: "Valor mínimo de saque: R$ 20,00." },
      { status: 400 }
    );
  }
  if (!pixKey) {
    return NextResponse.json({ error: "Informe sua chave Pix." }, { status: 400 });
  }

  await dbConnect();
  // Debita só se houver saldo suficiente (operação atômica).
  const user = await User.findOneAndUpdate(
    { _id: session.id, balanceCents: { $gte: amountCents } },
    { $inc: { balanceCents: -amountCents }, pixKey },
    { new: true }
  );
  if (!user) {
    return NextResponse.json({ error: "Saldo insuficiente." }, { status: 400 });
  }

  await Withdrawal.create({
    photographer: session.id,
    amountCents,
    pixKey,
  });

  return NextResponse.json({ ok: true, balanceCents: user.balanceCents });
}
