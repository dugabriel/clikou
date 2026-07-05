import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Withdrawal from "@/models/Withdrawal";
import User from "@/models/User";
import { getSession, isAdmin } from "@/lib/auth";
import {
  emailEnabled,
  sendWithdrawalPaidEmail,
  sendWithdrawalRejectedEmail,
} from "@/lib/email";

export async function PATCH(req, { params }) {
  const session = await getSession();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }

  const { id } = await params;
  const { action } = await req.json();
  if (!["pay", "reject"].includes(action)) {
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }

  await dbConnect();
  // Só transiciona a partir de "pending" (evita pagar/estornar duas vezes).
  const withdrawal = await Withdrawal.findOneAndUpdate(
    { _id: id, status: "pending" },
    { status: action === "pay" ? "paid" : "rejected" },
    { new: true }
  );
  if (!withdrawal) {
    return NextResponse.json(
      { error: "Saque não encontrado ou já processado." },
      { status: 404 }
    );
  }

  // Recusou: devolve o valor (debitado na solicitação) à carteira.
  if (action === "reject") {
    await User.updateOne(
      { _id: withdrawal.photographer },
      { $inc: { balanceCents: withdrawal.amountCents } }
    );
  }

  // Avisa o fotógrafo por e-mail; falha no envio não desfaz o saque.
  if (emailEnabled) {
    try {
      const photographer = await User.findById(withdrawal.photographer)
        .select("name email")
        .lean();
      if (photographer) {
        const payload = {
          to: photographer.email,
          name: photographer.name,
          amountCents: withdrawal.amountCents,
        };
        if (action === "pay") {
          await sendWithdrawalPaidEmail({ ...payload, pixKey: withdrawal.pixKey });
        } else {
          await sendWithdrawalRejectedEmail(payload);
        }
      }
    } catch (e) {
      console.error("E-mail de saque:", e.message);
    }
  }

  return NextResponse.json({ ok: true, status: withdrawal.status });
}
