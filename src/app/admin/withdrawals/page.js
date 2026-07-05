import { dbConnect } from "@/lib/db";
import Withdrawal from "@/models/Withdrawal";
import "@/models/User";
import { formatPrice } from "@/lib/currency";
import WithdrawalActions from "@/components/WithdrawalActions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Saques — Administração — Clikou" };

function WithdrawalRow({ withdrawal, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
      <div>
        <p className="font-medium">
          {formatPrice(withdrawal.amountCents)} —{" "}
          {withdrawal.photographer?.name || "conta removida"}
        </p>
        <p className="text-zinc-500">
          {new Date(withdrawal.createdAt).toLocaleString("pt-BR")} ·{" "}
          {withdrawal.photographer?.email} · Pix: {withdrawal.pixKey}
        </p>
      </div>
      {children}
    </div>
  );
}

export default async function AdminWithdrawals() {
  await dbConnect();

  const [pending, processed] = await Promise.all([
    Withdrawal.find({ status: "pending" })
      .sort({ createdAt: 1 })
      .populate("photographer", "name email")
      .lean(),
    Withdrawal.find({ status: { $ne: "pending" } })
      .sort({ updatedAt: -1 })
      .limit(30)
      .populate("photographer", "name email")
      .lean(),
  ]);

  return (
    <div>
      <h2 className="mb-3 font-semibold">
        Pendentes ({pending.length})
      </h2>
      {pending.length === 0 ? (
        <p className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-8 text-center text-zinc-500">
          Nenhum saque aguardando pagamento.
        </p>
      ) : (
        <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
          {pending.map((w) => (
            <WithdrawalRow key={w._id.toString()} withdrawal={w}>
              <WithdrawalActions withdrawalId={w._id.toString()} />
            </WithdrawalRow>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-zinc-500">
        Pague pelo seu banco usando a chave Pix e então marque como pago.
        Recusar devolve o valor à carteira do fotógrafo.
      </p>

      {processed.length > 0 && (
        <>
          <h2 className="mt-10 mb-3 font-semibold">Processados</h2>
          <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
            {processed.map((w) => (
              <WithdrawalRow key={w._id.toString()} withdrawal={w}>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    w.status === "paid"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400"
                  }`}
                >
                  {w.status === "paid" ? "Pago" : "Recusado"}
                </span>
              </WithdrawalRow>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
