import { dbConnect } from "@/lib/db";
import Usuario from "@/models/Usuario";
import Pedido from "@/models/Pedido";
import { COMISSAO_PORCENTO } from "@/lib/mp";
import { formatarPreco } from "@/lib/moeda";
import FormTaxa from "@/components/FormTaxa";

export const dynamic = "force-dynamic";

export const metadata = { title: "Fotógrafos — Administração — Clikou" };

export default async function AdminFotografos() {
  await dbConnect();

  const [usuarios, vendas] = await Promise.all([
    Usuario.find()
      .select("nome email saldoCentavos comissaoPorcento usuario")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean(),
    Pedido.aggregate([
      { $match: { status: "pago" } },
      { $unwind: "$itens" },
      {
        $group: {
          _id: "$itens.fotografo",
          vendidoCentavos: { $sum: "$itens.precoCentavos" },
          fotosVendidas: { $sum: 1 },
        },
      },
    ]),
  ]);

  const vendasPor = new Map(vendas.map((v) => [v._id.toString(), v]));
  const linhas = usuarios
    .map((u) => ({ ...u, vendas: vendasPor.get(u._id.toString()) }))
    .sort(
      (a, b) =>
        (b.vendas?.vendidoCentavos || 0) - (a.vendas?.vendidoCentavos || 0) ||
        b.saldoCentavos - a.saldoCentavos
    );

  return (
    <div>
      <p className="mb-4 text-sm text-zinc-500">
        Taxa padrão da plataforma: <strong>{COMISSAO_PORCENTO}%</strong>. Defina
        uma taxa individual para sobrescrevê-la; deixe em branco para voltar ao
        padrão.
      </p>

      <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
        {linhas.map((u) => (
          <div
            key={u._id.toString()}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium">
                {u.nome}
                {u.usuario && (
                  <a
                    href={`/f/${u.usuario}`}
                    className="ml-2 text-xs text-zinc-500 hover:text-yellow-400"
                  >
                    /f/{u.usuario}
                  </a>
                )}
              </p>
              <p className="text-zinc-500">{u.email}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="font-medium">
                  {formatarPreco(u.vendas?.vendidoCentavos || 0)}
                  <span className="ml-1 text-xs font-normal text-zinc-500">
                    vendido ({u.vendas?.fotosVendidas || 0} fotos)
                  </span>
                </p>
                <p className="text-zinc-500">
                  saldo {formatarPreco(u.saldoCentavos)}
                </p>
              </div>
              <FormTaxa
                usuarioId={u._id.toString()}
                taxaAtual={u.comissaoPorcento}
                taxaPadrao={COMISSAO_PORCENTO}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
