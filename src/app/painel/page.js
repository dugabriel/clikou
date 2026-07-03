import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Usuario from "@/models/Usuario";
import Evento from "@/models/Evento";
import Foto from "@/models/Foto";
import Pedido from "@/models/Pedido";
import { obterSessao } from "@/lib/auth";
import { formatarPreco } from "@/lib/moeda";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export default async function Painel() {
  const sessao = await obterSessao();
  await dbConnect();

  const meuId = new mongoose.Types.ObjectId(sessao.id);
  const [usuario, eventos, vendas] = await Promise.all([
    Usuario.findById(meuId).select("saldoCentavos").lean(),
    Evento.find({ fotografo: meuId }).sort({ createdAt: -1 }).lean(),
    Pedido.aggregate([
      { $match: { status: "pago" } },
      { $unwind: "$itens" },
      { $match: { "itens.fotografo": meuId } },
      {
        $group: {
          _id: null,
          fotosVendidas: { $sum: 1 },
          totalBrutoCentavos: { $sum: "$itens.precoCentavos" },
        },
      },
    ]),
  ]);

  const contagens = await Foto.aggregate([
    { $match: { fotografo: meuId } },
    { $group: { _id: "$evento", total: { $sum: 1 } } },
  ]);
  const fotosPorEvento = Object.fromEntries(
    contagens.map((c) => [c._id.toString(), c.total])
  );

  const resumo = vendas[0] || { fotosVendidas: 0, totalBrutoCentavos: 0 };

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Saldo disponível", formatarPreco(usuario?.saldoCentavos || 0)],
          ["Fotos vendidas", resumo.fotosVendidas],
          ["Total bruto vendido", formatarPreco(resumo.totalBrutoCentavos)],
        ].map(([rotulo, valor]) => (
          <div
            key={rotulo}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <p className="text-sm text-zinc-400">{rotulo}</p>
            <p className="mt-1 text-2xl font-bold text-yellow-400">{valor}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl font-bold">Meus eventos</h2>
        <Link
          href="/painel/eventos/novo"
          className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-yellow-300"
        >
          + Novo evento
        </Link>
      </div>

      {eventos.length === 0 ? (
        <p className="py-16 text-center text-zinc-500">
          Você ainda não criou nenhum evento. Crie o primeiro e suba suas
          fotos!
        </p>
      ) : (
        <div className="mt-4 divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
          {eventos.map((e) => (
            <Link
              key={e._id.toString()}
              href={`/painel/eventos/${e._id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-zinc-800/50"
            >
              <div>
                <p className="font-semibold">{e.titulo}</p>
                <p className="text-sm text-zinc-400">
                  {fotosPorEvento[e._id.toString()] || 0} fotos · preço padrão{" "}
                  {formatarPreco(e.precoPadraoCentavos)}
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
