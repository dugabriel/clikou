import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { COMMISSION_PERCENT } from "@/lib/mp";
import { isPro } from "@/lib/plan";
import { formatPrice } from "@/lib/currency";
import { accentInsensitiveRegex } from "@/lib/search";
import CommissionForm from "@/components/CommissionForm";
import PartnerProToggle from "@/components/PartnerProToggle";

export const dynamic = "force-dynamic";

export const metadata = { title: "Fotógrafos — Administração — Clikou" };

const PAGE_SIZE = 20;

const PLAN_FILTERS = [
  { value: "", label: "Todos" },
  { value: "assinatura", label: "Pro · assinatura" },
  { value: "parceria", label: "Pro · parceria" },
  { value: "gratis", label: "Grátis" },
];

const SORTS = [
  { value: "", label: "Mais vendas" },
  { value: "recentes", label: "Recentes" },
  { value: "saldo", label: "Maior saldo" },
];

export default async function AdminPhotographers({ searchParams }) {
  await requireAdmin();

  const { q, plano, ordem, page: rawPage } = await searchParams;
  const page = Math.max(1, parseInt(rawPage, 10) || 1);
  const activePlan = PLAN_FILTERS.some((p) => p.value === plano) ? plano : "";
  const activeSort = SORTS.some((s) => s.value === ordem) ? ordem : "";

  await dbConnect();

  // Filtros combináveis via $and (busca e plano podem ambos usar $or).
  const clauses = [];
  if (q) {
    const regex = accentInsensitiveRegex(q);
    clauses.push({ $or: [{ name: regex }, { email: regex }, { username: regex }] });
  }
  const now = new Date();
  if (activePlan === "assinatura") {
    // Pagante de verdade: assinatura com ciclo vigente.
    clauses.push({ plan: "pro", planCurrentPeriodEnd: { $gt: now } });
  } else if (activePlan === "parceria") {
    // Pro sem vencimento = concedido por parceria (ver isPro em lib/plan).
    clauses.push({ plan: "pro", planCurrentPeriodEnd: null });
  } else if (activePlan === "gratis") {
    // Plano free ou Pro vencido (que isPro já trata como free).
    clauses.push({
      $or: [{ plan: { $ne: "pro" } }, { planCurrentPeriodEnd: { $lte: now } }],
    });
  }
  const filter = clauses.length ? { $and: clauses } : {};

  // Ordenar por vendas exige o total vendido de todo mundo; então a
  // paginação é em duas etapas: ids ordenados em memória (leves), depois
  // só os documentos da página.
  const [candidates, sales] = await Promise.all([
    User.find(filter).select("balanceCents createdAt").lean(),
    Order.aggregate([
      { $match: { status: "paid" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.photographer",
          soldCents: { $sum: "$items.priceCents" },
          photosSold: { $sum: 1 },
        },
      },
    ]),
  ]);

  const salesBy = new Map(sales.map((s) => [s._id?.toString(), s]));
  const soldOf = (u) => salesBy.get(u._id.toString())?.soldCents || 0;

  const sorted = candidates.sort((a, b) => {
    if (activeSort === "recentes") return new Date(b.createdAt) - new Date(a.createdAt);
    if (activeSort === "saldo") return b.balanceCents - a.balanceCents;
    return soldOf(b) - soldOf(a) || b.balanceCents - a.balanceCents;
  });

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageIds = sorted
    .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    .map((u) => u._id);

  const docs = await User.find({ _id: { $in: pageIds } })
    .select(
      "name email balanceCents commissionPercent username plan planCurrentPeriodEnd createdAt"
    )
    .lean();
  const byId = new Map(docs.map((d) => [d._id.toString(), d]));
  const rows = pageIds
    .map((id) => byId.get(id.toString()))
    .filter(Boolean)
    .map((u) => ({ ...u, sales: salesBy.get(u._id.toString()) }));

  // Links preservando busca, filtro e ordenação.
  const hrefWith = (overrides) => {
    const merged = {
      q: q || "",
      plano: activePlan,
      ordem: activeSort,
      page: "",
      ...overrides,
    };
    const params = new URLSearchParams();
    if (merged.q) params.set("q", merged.q);
    if (merged.plano) params.set("plano", merged.plano);
    if (merged.ordem) params.set("ordem", merged.ordem);
    if (merged.page > 1) params.set("page", String(merged.page));
    const query = params.toString();
    return query ? `/admin/photographers?${query}` : "/admin/photographers";
  };

  return (
    <div>
      <p className="mb-4 text-sm text-zinc-500">
        Taxa padrão da plataforma: <strong>{COMMISSION_PERCENT}%</strong>. Defina
        uma taxa individual para sobrescrevê-la; deixe em branco para voltar ao
        padrão.
      </p>

      <form className="mb-4 flex flex-wrap gap-2">
        {activePlan && <input type="hidden" name="plano" value={activePlan} />}
        {activeSort && <input type="hidden" name="ordem" value={activeSort} />}
        <input
          name="q"
          defaultValue={q || ""}
          placeholder="Buscar por nome, e-mail ou usuário…"
          className="w-72 rounded-full border border-white/10 bg-zinc-900/70 px-5 py-2 text-sm placeholder:text-zinc-600 outline-none transition focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/15"
        />
        <button className="rounded-full bg-zinc-800 px-5 py-2 text-sm font-medium transition hover:bg-zinc-700">
          Buscar
        </button>
      </form>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex max-w-full gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PLAN_FILTERS.map((p) => {
            const active = activePlan === p.value;
            return (
              <Link
                key={p.value || "all"}
                href={hrefWith({ plano: p.value })}
                className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition ${
                  active
                    ? "border-yellow-400 bg-yellow-400 font-semibold text-zinc-950"
                    : "border-white/10 bg-zinc-900/70 font-medium text-zinc-400 hover:border-yellow-400/40 hover:text-white"
                }`}
              >
                {p.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span className="mr-1 text-zinc-500">Ordenar:</span>
          {SORTS.map((s) => {
            const active = activeSort === s.value;
            return (
              <Link
                key={s.value || "vendas"}
                href={hrefWith({ ordem: s.value })}
                className={`rounded-full px-3 py-1 transition ${
                  active
                    ? "bg-zinc-800 font-semibold text-white"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                {s.label}
              </Link>
            );
          })}
        </div>
      </div>

      <p className="mb-3 text-sm text-zinc-500">
        {total === 0
          ? "Nenhum fotógrafo encontrado."
          : `${total} fotógrafo${total > 1 ? "s" : ""}`}
      </p>

      {rows.length > 0 && (
        <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
          {rows.map((u) => (
            <div
              key={u._id.toString()}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">
                  {u.name}
                  {u.username && (
                    <a
                      href={`/f/${u.username}`}
                      className="ml-2 text-xs text-zinc-500 hover:text-yellow-400"
                    >
                      /f/{u.username}
                    </a>
                  )}
                </p>
                <p className="text-zinc-500">
                  {u.email} · desde{" "}
                  {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-medium">
                    {formatPrice(u.sales?.soldCents || 0)}
                    <span className="ml-1 text-xs font-normal text-zinc-500">
                      vendido ({u.sales?.photosSold || 0} fotos)
                    </span>
                  </p>
                  <p className="text-zinc-500">
                    saldo {formatPrice(u.balanceCents)}
                  </p>
                </div>
                <CommissionForm
                  userId={u._id.toString()}
                  currentRate={u.commissionPercent}
                  defaultRate={COMMISSION_PERCENT}
                />
                <PartnerProToggle
                  userId={u._id.toString()}
                  status={
                    // Pro com vencimento = assinatura; sem vencimento = parceria;
                    // vencido ou plano free = livre para virar parceria.
                    isPro(u)
                      ? u.planCurrentPeriodEnd
                        ? "paid"
                        : "partner"
                      : "free"
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-4 text-sm">
          {page > 1 && (
            <Link
              href={hrefWith({ page: page - 1 })}
              className="rounded-full border border-zinc-700 px-5 py-2 font-medium transition hover:border-zinc-500"
            >
              ← Anterior
            </Link>
          )}
          <span className="text-zinc-500">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={hrefWith({ page: page + 1 })}
              className="rounded-full border border-zinc-700 px-5 py-2 font-medium transition hover:border-zinc-500"
            >
              Próxima →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
