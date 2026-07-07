// Planos do fotógrafo. Grátis vende com comissão e tem portfólio raso;
// Pro (R$ 49/mês) tem comissão zero e portfólio organizado por coleções.
import { COMMISSION_PERCENT } from "@/lib/mp";

export const PRO_PRICE_CENTS = 4900;

export const PLAN_LIMITS = {
  free: { collections: 1, photosPerCollection: 8, namedCollections: false },
  pro: { collections: 20, photosPerCollection: 100, namedCollections: true },
};

// Assinante Pro com ciclo vigente. Sem planCurrentPeriodEnd (ativado no
// modo dev) também vale, para não travar o fluxo enquanto o MP real não entra.
export function isPro(user) {
  if (user?.plan !== "pro") return false;
  const end = user.planCurrentPeriodEnd;
  return !end || new Date(end).getTime() > Date.now();
}

export function planLimits(user) {
  return isPro(user) ? PLAN_LIMITS.pro : PLAN_LIMITS.free;
}

// Comissão efetiva da venda: Pro é sempre zero; grátis usa a taxa individual
// do fotógrafo (se houver) ou a padrão da plataforma.
export function effectiveCommissionPercent(user) {
  if (isPro(user)) return 0;
  return user?.commissionPercent ?? COMMISSION_PERCENT;
}

// Coleções para exibir/editar, normalizadas (ids como string).
export function normalizedCollections(user) {
  return (user?.collections || []).map((c) => ({
    _id: c._id?.toString?.() || String(c._id || ""),
    name: c.name || "",
    photos: c.photos || [],
  }));
}
