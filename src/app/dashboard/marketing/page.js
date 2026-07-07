import Link from "next/link";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Lead from "@/models/Lead";
import { getSession } from "@/lib/auth";
import { isPro } from "@/lib/plan";

export const dynamic = "force-dynamic";

export const metadata = { title: "Divulgação — Clikou" };

export default async function MarketingPage() {
  const session = await getSession();
  await dbConnect();
  const user = await User.findById(session.id)
    .select("plan planCurrentPeriodEnd stats")
    .lean();

  if (!isPro(user)) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Divulgação
        </h1>
        <p className="mt-3 text-zinc-400">
          Veja quantas pessoas visitam seu perfil, quem clica nos seus contatos
          e receba pedidos de orçamento — tudo no plano Pro.
        </p>
        <Link
          href="/dashboard/plan"
          className="mt-6 inline-block rounded-full bg-yellow-400 px-6 py-3 font-semibold text-zinc-950 transition hover:bg-yellow-300"
        >
          Conhecer o Pro
        </Link>
      </div>
    );
  }

  const leads = await Lead.find({ photographer: session.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const s = user.stats || {};
  const contatos = (s.waClicks || 0) + (s.igClicks || 0) + (s.siteClicks || 0);
  const cards = [
    ["Visitas ao perfil", s.profileViews || 0],
    ["Cliques em contato", contatos],
    ["Pedidos de orçamento", leads.length],
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Divulgação
      </h1>
      <p className="mt-2 text-zinc-400">
        Como sua página está performando e os contatos que ela gerou.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <p className="text-sm text-zinc-400">{label}</p>
            <p className="mt-1 text-3xl font-bold text-yellow-400">{value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-bold">Pedidos de orçamento</h2>
      {leads.length === 0 ? (
        <p className="py-12 text-center text-zinc-500">
          Nenhum pedido ainda. Compartilhe o link da sua página para começar a
          receber contatos.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
          {leads.map((l) => (
            <div key={l._id.toString()} className="px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">{l.name}</p>
                <p className="text-sm text-yellow-400">{l.contact}</p>
              </div>
              {l.message && (
                <p className="mt-1 text-sm text-zinc-400">{l.message}</p>
              )}
              <p className="mt-1 text-xs text-zinc-600">
                {new Date(l.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
