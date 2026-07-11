import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import { preApprovals } from "@/lib/mp";
import {
  billingEnabled,
  autoRecurringFor,
  nextPeriodEnd,
  trialEnd,
  PLANS,
} from "@/lib/billing";

// Assinar o Pro (mensal ou anual, com 14 dias de trial).
export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  let cycle = "monthly";
  try {
    const body = await req.json();
    if (body?.cycle === "annual") cycle = "annual";
  } catch {}

  await dbConnect();

  if (!billingEnabled) {
    // Modo dev: ativa o Pro na hora, sem cobrança, já dentro do trial.
    await User.updateOne(
      { _id: session.id },
      {
        plan: "pro",
        planCycle: cycle,
        planTrialEnd: trialEnd(),
        planCurrentPeriodEnd: nextPeriodEnd(cycle),
      }
    );
    return NextResponse.json({ url: "/dashboard/plan?dev=1" });
  }

  // Cobrança real: cria a assinatura recorrente no Mercado Pago. O plano só
  // vira "pro" quando o webhook confirmar (status authorized). O fotógrafo é
  // redirecionado ao init_point para autorizar a cobrança no cartão.
  const user = await User.findById(session.id).select("email");
  const appUrl = process.env.APP_URL || new URL(req.url).origin;
  try {
    const sub = await preApprovals().create({
      body: {
        reason: `Clikou Pro (${PLANS[cycle].label})`,
        external_reference: session.id,
        payer_email: user.email,
        back_url: `${appUrl}/dashboard/plan?sub=ok&cycle=${cycle}`,
        // Cada assinatura carrega sua URL de notificação — dispensa configurar
        // webhook no painel do MP. O handler trata os tópicos de assinatura.
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
        auto_recurring: autoRecurringFor(cycle),
        status: "pending",
      },
    });
    await User.updateOne(
      { _id: session.id },
      { planCycle: cycle, mpPreapprovalId: sub.id }
    );
    return NextResponse.json({ url: sub.init_point });
  } catch (e) {
    console.error("PreApproval create:", e.message);
    return NextResponse.json(
      { error: "Não foi possível iniciar a assinatura. Tente de novo." },
      { status: 502 }
    );
  }
}

// Cancelar o Pro (volta a grátis).
export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findById(session.id).select("mpPreapprovalId");

  if (billingEnabled && user?.mpPreapprovalId) {
    try {
      await preApprovals().update({
        id: user.mpPreapprovalId,
        body: { status: "cancelled" },
      });
    } catch (e) {
      console.error("PreApproval cancel:", e.message);
    }
  }

  await User.updateOne(
    { _id: session.id },
    {
      plan: "free",
      $unset: { planCurrentPeriodEnd: "", planTrialEnd: "", mpPreapprovalId: "" },
    }
  );
  return NextResponse.json({ ok: true });
}
