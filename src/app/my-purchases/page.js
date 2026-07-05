import Link from "next/link";
import { redirect } from "next/navigation";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import "@/models/Photo";
import "@/models/Event";
import { getSession } from "@/lib/auth";
import { formatPrice } from "@/lib/currency";
import { DownloadIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

export const metadata = { title: "Minhas compras — Clikou" };

export default async function MyPurchases() {
  const session = await getSession();
  if (!session) redirect("/login?next=/my-purchases");

  await dbConnect();
  const orders = await Order.find({ customer: session.id })
    .sort({ createdAt: -1 })
    .populate({
      path: "items.photo",
      select: "event",
      populate: { path: "event", select: "title" },
    })
    .lean();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">Minhas compras</h1>

      {orders.length === 0 && (
        <p className="py-20 text-center text-zinc-500">
          Você ainda não comprou fotos.{" "}
          <Link href="/events" className="text-yellow-400 hover:underline">
            Ver eventos
          </Link>
        </p>
      )}

      <div className="mt-8 space-y-6">
        {orders.map((o) => (
          <div
            key={o._id.toString()}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {o.items[0]?.photo?.event?.title || "Evento"} —{" "}
                  {o.items.length} foto{o.items.length > 1 ? "s" : ""}
                </p>
                <p className="text-sm text-zinc-400">
                  {new Date(o.createdAt).toLocaleString("pt-BR")} ·{" "}
                  {formatPrice(o.totalCents)}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  o.status === "paid"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : o.status === "pending"
                      ? "bg-yellow-500/15 text-yellow-400"
                      : "bg-zinc-700/40 text-zinc-400"
                }`}
              >
                {o.status === "paid"
                  ? "Pago"
                  : o.status === "pending"
                    ? "Aguardando pagamento"
                    : "Cancelado"}
              </span>
            </div>

            {o.status === "paid" && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {o.items.map((item) => {
                  const photoId = (item.photo?._id || item.photo)?.toString();
                  return (
                    <a
                      key={photoId}
                      href={`/api/photos/${photoId}/download`}
                      className="group relative overflow-hidden rounded-lg border border-zinc-800"
                      title="Baixar em alta resolução"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/photos/${photoId}/preview`}
                        alt="Foto comprada"
                        className="aspect-square w-full object-cover"
                      />
                      <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/60 text-xs font-semibold opacity-0 transition group-hover:opacity-100">
                        <DownloadIcon size={16} /> Baixar
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
