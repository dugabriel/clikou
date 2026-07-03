import Link from "next/link";
import { redirect } from "next/navigation";
import { dbConnect } from "@/lib/db";
import Pedido from "@/models/Pedido";
import "@/models/Foto";
import "@/models/Evento";
import { obterSessao } from "@/lib/auth";
import { formatarPreco } from "@/lib/moeda";
import { IconeDownload } from "@/components/Icones";

export const dynamic = "force-dynamic";

export const metadata = { title: "Minhas compras — Clikou" };

export default async function MinhasCompras() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/login?voltar=/minhas-compras");

  await dbConnect();
  const pedidos = await Pedido.find({ cliente: sessao.id })
    .sort({ createdAt: -1 })
    .populate({
      path: "itens.foto",
      select: "evento",
      populate: { path: "evento", select: "titulo" },
    })
    .lean();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">Minhas compras</h1>

      {pedidos.length === 0 && (
        <p className="py-20 text-center text-zinc-500">
          Você ainda não comprou fotos.{" "}
          <Link href="/eventos" className="text-yellow-400 hover:underline">
            Ver eventos
          </Link>
        </p>
      )}

      <div className="mt-8 space-y-6">
        {pedidos.map((p) => (
          <div
            key={p._id.toString()}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {p.itens[0]?.foto?.evento?.titulo || "Evento"} —{" "}
                  {p.itens.length} foto{p.itens.length > 1 ? "s" : ""}
                </p>
                <p className="text-sm text-zinc-400">
                  {new Date(p.createdAt).toLocaleString("pt-BR")} ·{" "}
                  {formatarPreco(p.totalCentavos)}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  p.status === "pago"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : p.status === "pendente"
                      ? "bg-yellow-500/15 text-yellow-400"
                      : "bg-zinc-700/40 text-zinc-400"
                }`}
              >
                {p.status === "pago"
                  ? "Pago"
                  : p.status === "pendente"
                    ? "Aguardando pagamento"
                    : "Cancelado"}
              </span>
            </div>

            {p.status === "pago" && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {p.itens.map((item) => {
                  const fotoId = (item.foto?._id || item.foto)?.toString();
                  return (
                    <a
                      key={fotoId}
                      href={`/api/fotos/${fotoId}/download`}
                      className="group relative overflow-hidden rounded-lg border border-zinc-800"
                      title="Baixar em alta resolução"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/fotos/${fotoId}/preview`}
                        alt="Foto comprada"
                        className="aspect-square w-full object-cover"
                      />
                      <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/60 text-xs font-semibold opacity-0 transition group-hover:opacity-100">
                        <IconeDownload tamanho={16} /> Baixar
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
