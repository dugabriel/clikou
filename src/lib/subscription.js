import User from "@/models/User";
import { preApprovals } from "@/lib/mp";
import { nextPeriodEnd } from "@/lib/billing";

// Reconcilia o plano do fotógrafo com o estado da assinatura no Mercado Pago.
// Fonte da verdade do webhook: busca o PreApproval e liga/desliga o Pro pelo
// status. Idempotente. O usuário é achado por external_reference (id do User).
export async function syncSubscription(preapprovalId) {
  if (!preapprovalId) return null;

  const sub = await preApprovals().get({ id: preapprovalId });
  const userId = sub.external_reference;
  if (!userId) return null;

  // "authorized" = assinatura ativa (inclui o período de trial). Demais
  // estados (cancelled, paused, pending) tiram o Pro.
  if (sub.status === "authorized") {
    // next_payment_date marca o fim do ciclo atual; fallback pelo ciclo.
    const periodEnd = sub.next_payment_date
      ? new Date(sub.next_payment_date)
      : nextPeriodEnd();
    await User.updateOne(
      { _id: userId },
      {
        plan: "pro",
        mpPreapprovalId: preapprovalId,
        planCurrentPeriodEnd: periodEnd,
      }
    );
  } else {
    await User.updateOne(
      { _id: userId },
      { plan: "free", $unset: { planCurrentPeriodEnd: "" } }
    );
  }
  return sub.status;
}
