import { dbConnect } from "@/lib/db";
import Saque from "@/models/Saque";
import "@/models/Usuario";
import { formatarPreco } from "@/lib/moeda";
import AcoesSaque from "@/components/AcoesSaque";

export const dynamic = "force-dynamic";

export const metadata = { title: "Saques — Administração — Clikou" };

function LinhaSaque({ saque, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
      <div>
        <p className="font-medium">
          {formatarPreco(saque.valorCentavos)} —{" "}
          {saque.fotografo?.nome || "conta removida"}
        </p>
        <p className="text-zinc-500">
          {new Date(saque.createdAt).toLocaleString("pt-BR")} ·{" "}
          {saque.fotografo?.email} · Pix: {saque.chavePix}
        </p>
      </div>
      {children}
    </div>
  );
}

export default async function AdminSaques() {
  await dbConnect();

  const [pendentes, processados] = await Promise.all([
    Saque.find({ status: "pendente" })
      .sort({ createdAt: 1 })
      .populate("fotografo", "nome email")
      .lean(),
    Saque.find({ status: { $ne: "pendente" } })
      .sort({ updatedAt: -1 })
      .limit(30)
      .populate("fotografo", "nome email")
      .lean(),
  ]);

  return (
    <div>
      <h2 className="mb-3 font-semibold">
        Pendentes ({pendentes.length})
      </h2>
      {pendentes.length === 0 ? (
        <p className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-8 text-center text-zinc-500">
          Nenhum saque aguardando pagamento.
        </p>
      ) : (
        <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
          {pendentes.map((s) => (
            <LinhaSaque key={s._id.toString()} saque={s}>
              <AcoesSaque saqueId={s._id.toString()} />
            </LinhaSaque>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-zinc-500">
        Pague pelo seu banco usando a chave Pix e então marque como pago.
        Recusar devolve o valor à carteira do fotógrafo.
      </p>

      {processados.length > 0 && (
        <>
          <h2 className="mt-10 mb-3 font-semibold">Processados</h2>
          <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
            {processados.map((s) => (
              <LinhaSaque key={s._id.toString()} saque={s}>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    s.status === "pago"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400"
                  }`}
                >
                  {s.status === "pago" ? "Pago" : "Recusado"}
                </span>
              </LinhaSaque>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
