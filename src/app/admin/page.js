import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Pedido from "@/models/Pedido";
import Saque from "@/models/Saque";
import "@/models/Usuario";
import { formatarPreco } from "@/lib/moeda";

export const dynamic = "force-dynamic";

export const metadata = { title: "Administração — Clikou" };

function Metrica({ titulo, valor, destaque = false }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-400">{titulo}</p>
      <p
        className={`mt-1 text-2xl font-bold ${destaque ? "text-yellow-400" : ""}`}
      >
        {valor}
      </p>
    </div>
  );
}

export default async function AdminInicio() {
  await dbConnect();

  const [vendas, saquesPendentes, ultimasVendas] = await Promise.all([
    Pedido.aggregate([
      { $match: { status: "pago" } },
      {
        $group: {
          _id: null,
          totalCentavos: { $sum: "$totalCentavos" },
          comissaoCentavos: { $sum: "$comissaoCentavos" },
          quantidade: { $sum: 1 },
        },
      },
    ]).then((r) => r[0]),
    Saque.aggregate([
      { $match: { status: "pendente" } },
      {
        $group: {
          _id: null,
          totalCentavos: { $sum: "$valorCentavos" },
          quantidade: { $sum: 1 },
        },
      },
    ]).then((r) => r[0]),
    Pedido.find({ status: "pago" })
      .sort({ updatedAt: -1 })
      .limit(20)
      .populate("cliente", "nome email")
      .lean(),
  ]);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metrica
          titulo="Vendas pagas"
          valor={vendas?.quantidade ?? 0}
        />
        <Metrica
          titulo="Faturamento bruto"
          valor={formatarPreco(vendas?.totalCentavos ?? 0)}
        />
        <Metrica
          titulo="Comissão da plataforma"
          valor={formatarPreco(vendas?.comissaoCentavos ?? 0)}
          destaque
        />
        <Link href="/admin/saques" className="group">
          <Metrica
            titulo={`Saques pendentes (${saquesPendentes?.quantidade ?? 0})`}
            valor={formatarPreco(saquesPendentes?.totalCentavos ?? 0)}
          />
        </Link>
      </div>

      <h2 className="mt-10 mb-3 font-semibold">Últimas vendas</h2>
      {ultimasVendas.length === 0 ? (
        <p className="py-10 text-center text-zinc-500">Nenhuma venda ainda.</p>
      ) : (
        <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
          {ultimasVendas.map((p) => (
            <div
              key={p._id.toString()}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">
                  {p.itens.length} foto{p.itens.length > 1 ? "s" : ""} —{" "}
                  {p.cliente?.nome || "cliente removido"}
                </p>
                <p className="text-zinc-500">
                  {new Date(p.updatedAt).toLocaleString("pt-BR")} ·{" "}
                  {p.cliente?.email}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatarPreco(p.totalCentavos)}</p>
                <p className="text-zinc-500">
                  comissão {formatarPreco(p.comissaoCentavos)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
