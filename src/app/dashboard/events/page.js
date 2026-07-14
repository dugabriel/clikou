import Link from "next/link";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import Event from "@/models/Event";
import Photo from "@/models/Photo";
import { getSession } from "@/lib/auth";
import { formatPrice } from "@/lib/currency";

export const dynamic = "force-dynamic";

// Lista dos eventos à venda do fotógrafo — a aba "Eventos" do painel.
export default async function EventsDashboardPage() {
  const session = await getSession();
  await dbConnect();

  const myId = new mongoose.Types.ObjectId(session.id);
  const events = await Event.find({ photographer: myId })
    .sort({ createdAt: -1 })
    .lean();

  const counts = await Photo.aggregate([
    { $match: { photographer: myId } },
    { $group: { _id: "$event", total: { $sum: 1 } } },
  ]);
  const photosByEvent = Object.fromEntries(
    counts.map((c) => [c._id.toString(), c.total])
  );

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Eventos
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">
            Fotos à venda em página pública com busca por selfie — a prova sai
            com marca d&apos;água e o cliente compra a foto limpa.
          </p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-yellow-300"
        >
          + Novo evento
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 px-5 py-10 text-center text-sm text-zinc-500">
          Nenhum evento ainda. Crie o primeiro e suba suas fotos à venda.
        </p>
      ) : (
        <div className="mt-8 divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
          {events.map((e) => (
            <Link
              key={e._id.toString()}
              href={`/dashboard/events/${e._id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-zinc-800/50"
            >
              <div>
                <p className="font-semibold">{e.title}</p>
                <p className="text-sm text-zinc-400">
                  {photosByEvent[e._id.toString()] || 0} fotos ·{" "}
                  {e.promo ? (
                    <span className="text-yellow-400">divulgação — grátis</span>
                  ) : (
                    <>preço padrão {formatPrice(e.defaultPriceCents)}</>
                  )}
                </p>
              </div>
              <span className="text-sm text-yellow-400">Gerenciar →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
