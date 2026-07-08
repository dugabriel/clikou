import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Withdrawal from "@/models/Withdrawal";
import { getSession } from "@/lib/auth";
import { formatPrice } from "@/lib/currency";
import { splitEnabled } from "@/lib/mp";
import WithdrawalForm from "@/components/WithdrawalForm";
import MpConnect from "@/components/MpConnect";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sacar — Clikou" };

export default async function WithdrawalPage({ searchParams }) {
  const session = await getSession();
  const { mp } = await searchParams;
  await dbConnect();

  const [user, withdrawals] = await Promise.all([
    User.findById(session.id).select("balanceCents pixKey mpUserId").lean(),
    Withdrawal.find({ photographer: session.id }).sort({ createdAt: -1 }).lean(),
  ]);

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="mb-6 font-display text-2xl font-bold tracking-tight">
        Carteira
      </h2>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-center">
        <p className="text-sm text-zinc-400">Saldo disponível</p>
        <p className="mt-1 text-3xl font-bold text-yellow-400">
          {formatPrice(user?.balanceCents || 0)}
        </p>
      </div>

      {splitEnabled && <MpConnect connected={!!user?.mpUserId} result={mp} />}

      <WithdrawalForm savedPixKey={user?.pixKey || ""} />

      {withdrawals.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 font-semibold">Histórico de saques</h3>
          <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
            {withdrawals.map((w) => (
              <div
                key={w._id.toString()}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{formatPrice(w.amountCents)}</p>
                  <p className="text-zinc-500">
                    {new Date(w.createdAt).toLocaleDateString("pt-BR")} · Pix:{" "}
                    {w.pixKey}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    w.status === "paid"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : w.status === "pending"
                        ? "bg-yellow-500/15 text-yellow-400"
                        : "bg-red-500/15 text-red-400"
                  }`}
                >
                  {w.status === "paid"
                    ? "Pago"
                    : w.status === "pending"
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
