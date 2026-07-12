import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getSession, isAdmin } from "@/lib/auth";

export async function PATCH(req, { params }) {
  const session = await getSession();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  await dbConnect();
  const user = await User.findById(id).select(
    "commissionPercent plan planCurrentPeriodEnd planTrialEnd"
  );
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  if ("commissionPercent" in body) {
    const { commissionPercent } = body;
    // Vazio/null volta a usar a taxa padrão da plataforma.
    let rate = null;
    if (commissionPercent !== null && commissionPercent !== "") {
      rate = Number(String(commissionPercent).replace(",", "."));
      if (Number.isNaN(rate) || rate < 0 || rate > 100) {
        return NextResponse.json(
          { error: "Taxa deve ser um número entre 0 e 100." },
          { status: 400 }
        );
      }
    }
    user.commissionPercent = rate;
  }

  // Pro por parceria: plan "pro" SEM planCurrentPeriodEnd (isPro trata a
  // ausência de vencimento como válido). Assinatura paga (com vencimento
  // futuro) não é tocada por aqui — isso é assunto do Mercado Pago.
  if (typeof body.partnerPro === "boolean") {
    const paid =
      user.plan === "pro" &&
      user.planCurrentPeriodEnd &&
      new Date(user.planCurrentPeriodEnd).getTime() > Date.now();
    if (paid) {
      return NextResponse.json(
        { error: "Este fotógrafo tem assinatura paga — gerencie pelo Mercado Pago." },
        { status: 400 }
      );
    }
    if (body.partnerPro) {
      user.plan = "pro";
      user.planCurrentPeriodEnd = undefined;
      user.planTrialEnd = undefined;
    } else {
      user.plan = "free";
      user.planCurrentPeriodEnd = undefined;
    }
  }

  await user.save();
  return NextResponse.json({
    ok: true,
    commissionPercent: user.commissionPercent,
    plan: user.plan,
  });
}
