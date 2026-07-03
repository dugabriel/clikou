import { dbConnect } from "@/lib/db";
import Usuario from "@/models/Usuario";
import Saque from "@/models/Saque";
import { obterSessao } from "@/lib/auth";
import { formatarPreco } from "@/lib/moeda";
import FormSaque from "@/components/FormSaque";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sacar — Clikou" };

export default async function PaginaSaque() {
  const sessao = await obterSessao();
  await dbConnect();

  const [usuario, saques] = await Promise.all([
    Usuario.findById(sessao.id).select("saldoCentavos chavePix").lean(),
    Saque.find({ fotografo: sessao.id }).sort({ createdAt: -1 }).lean(),
  ]);

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-center">
        <p className="text-sm text-zinc-400">Saldo disponível</p>
        <p className="mt-1 text-3xl font-bold text-yellow-400">
          {formatarPreco(usuario?.saldoCentavos || 0)}
        </p>
      </div>

      <FormSaque chavePixSalva={usuario?.chavePix || ""} />

      {saques.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 font-semibold">Histórico de saques</h3>
          <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
            {saques.map((s) => (
              <div
                key={s._id.toString()}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{formatarPreco(s.valorCentavos)}</p>
                  <p className="text-zinc-500">
                    {new Date(s.createdAt).toLocaleDateString("pt-BR")} · Pix:{" "}
                    {s.chavePix}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    s.status === "pago"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : s.status === "pendente"
                        ? "bg-yellow-500/15 text-yellow-400"
                        : "bg-red-500/15 text-red-400"
                  }`}
                >
                  {s.status === "pago"
                    ? "Pago"
                    : s.status === "pendente"
                      ? "Em análise"
                      : "Recusado"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
