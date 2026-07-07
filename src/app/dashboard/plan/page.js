import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import { isPro, PLAN_LIMITS } from "@/lib/plan";
import { COMMISSION_PERCENT } from "@/lib/mp";
import { PLANS, TRIAL_DAYS, isInTrial } from "@/lib/billing";
import PlanActions from "@/components/PlanActions";
import { CheckIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

export const metadata = { title: "Plano — Clikou" };

const PRO_PERKS = [
  "Comissão zero: fique com 100% de cada venda",
  "Portfólio por coleções (Casamentos, Corridas, Ensaios…)",
  `Até ${PLAN_LIMITS.pro.collections} coleções, ${PLAN_LIMITS.pro.photosPerCollection} fotos cada`,
  "Página com a sua cara: cor e capa, sem marca clikou",
  "Métricas de visitas e cliques nos seus contatos",
  "Formulário de orçamento para receber contatos de trabalho",
];

export default async function PlanPage() {
  const session = await getSession();
  await dbConnect();
  const user = await User.findById(session.id)
    .select("plan planCurrentPeriodEnd planCycle planTrialEnd")
    .lean();
  const pro = isPro(user);

  const fmt = (d) => new Date(d).toLocaleDateString("pt-BR");
  const renew = user.planCurrentPeriodEnd ? fmt(user.planCurrentPeriodEnd) : null;
  const inTrial = isInTrial(user);
  const cycleLabel =
    user.planCycle === "annual" ? PLANS.annual.label : PLANS.monthly.label;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Seu plano
      </h1>
      <p className="mt-2 text-zinc-400">
        {pro
          ? "Você é Pro — vende sem comissão, com página profissional e ferramentas de divulgação."
          : `Hoje você é do plano grátis: paga ${COMMISSION_PERCENT}% de comissão em cada venda.`}
      </p>

      <div
        className={`mt-8 rounded-3xl border p-8 ${
          pro
            ? "border-yellow-400/40 bg-yellow-400/5"
            : "border-zinc-800 bg-zinc-900/60"
        }`}
      >
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-yellow-400">
              Clikou Pro
            </p>
            <p className="font-display mt-1 text-4xl font-bold">
              R$ 49
              <span className="text-lg font-normal text-zinc-400">/mês</span>
            </p>
            {!pro && (
              <p className="mt-1 text-sm text-zinc-400">
                ou R$ 490/ano · {TRIAL_DAYS} dias grátis para testar
              </p>
            )}
          </div>
          {pro && (
            <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-zinc-950">
              {inTrial ? "EM TESTE" : "ATIVO"}
            </span>
          )}
        </div>

        <ul className="mt-6 space-y-3">
          {PRO_PERKS.map((perk) => (
            <li key={perk} className="flex items-start gap-3 text-sm text-zinc-200">
              <CheckIcon size={18} className="mt-0.5 shrink-0 text-yellow-400" />
              {perk}
            </li>
          ))}
        </ul>

        {pro && (
          <p className="mt-6 text-sm text-zinc-400">
            Plano {cycleLabel}.{" "}
            {inTrial
              ? `Teste grátis até ${fmt(user.planTrialEnd)}.`
              : renew && (
                  <>
                    Próxima renovação em{" "}
                    <span className="text-zinc-200">{renew}</span>.
                  </>
                )}
          </p>
        )}

        <PlanActions pro={pro} />
      </div>

      <p className="mt-4 text-center text-xs text-zinc-600">
        A qualquer momento você pode cancelar e voltar ao plano grátis.
      </p>
    </div>
  );
}
