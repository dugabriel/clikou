// Assinatura Pro. Enquanto billingEnabled é falso, o app opera em "modo dev":
// assinar/cancelar mexem no plano na hora, sem cobrança real — mesmo padrão
// do mpEnabled no checkout. Com SUBSCRIPTIONS_ENABLED=1 e MP_ACCESS_TOKEN, a
// cobrança recorrente real do Mercado Pago (PreApproval) entra em cena.
export const billingEnabled =
  !!(process.env.MP_SUBSCRIPTION_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN) &&
  process.env.SUBSCRIPTIONS_ENABLED === "1";

export const TRIAL_DAYS = 14;

// Ciclos de cobrança. frequency_type sempre "months": mensal cobra a cada
// 1 mês; anual a cada 12 (com ~2 meses de desconto embutido no valor).
export const PLANS = {
  monthly: { amountCents: 4900, frequency: 1, periodDays: 30, label: "R$ 49/mês" },
  annual: { amountCents: 49000, frequency: 12, periodDays: 365, label: "R$ 490/ano" },
};

export function planFor(cycle) {
  return PLANS[cycle] || PLANS.monthly;
}

export function nextPeriodEnd(cycle = "monthly", from = Date.now()) {
  return new Date(from + planFor(cycle).periodDays * 24 * 60 * 60 * 1000);
}

export function trialEnd(from = Date.now()) {
  return new Date(from + TRIAL_DAYS * 24 * 60 * 60 * 1000);
}

export function isInTrial(user) {
  return (
    !!user?.planTrialEnd &&
    new Date(user.planTrialEnd).getTime() > Date.now()
  );
}

// Corpo do auto_recurring do PreApproval para o ciclo, com 14 dias de trial.
export function autoRecurringFor(cycle) {
  const plan = planFor(cycle);
  return {
    frequency: plan.frequency,
    frequency_type: "months",
    transaction_amount: plan.amountCents / 100,
    currency_id: "BRL",
    free_trial: { frequency: TRIAL_DAYS, frequency_type: "days" },
  };
}
