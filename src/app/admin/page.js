import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import Withdrawal from "@/models/Withdrawal";
import "@/models/User";
import { formatPrice } from "@/lib/currency";

export const dynamic = "force-dynamic";

export const metadata = { title: "Administração — Clikou" };

function Metric({ title, value, highlight = false }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-400">{title}</p>
      <p
        className={`mt-1 text-2xl font-bold ${highlight ? "text-yellow-400" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

export default async function AdminHome() {
  await requireAdmin();
  await dbConnect();

  const [sales, pendingWithdrawals, latestSales] = await Promise.all([
    Order.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: null,
          totalCents: { $sum: "$totalCents" },
          commissionCents: { $sum: "$commissionCents" },
          count: { $sum: 1 },
        },
      },
    ]).then((r) => r[0]),
    Withdrawal.aggregate([
      { $match: { status: "pending" } },
      {
        $group: {
          _id: null,
          totalCents: { $sum: "$amountCents" },
          count: { $sum: 1 },
        },
      },
    ]).then((r) => r[0]),
    Order.find({ status: "paid" })
      .sort({ updatedAt: -1 })
      .limit(20)
      .populate("customer", "name email")
      .lean(),
  ]);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="Vendas pagas" value={sales?.count ?? 0} />
        <Metric
          title="Faturamento bruto"
          value={formatPrice(sales?.totalCents ?? 0)}
        />
        <Metric
          title="Comissão da plataforma"
          value={formatPrice(sales?.commissionCents ?? 0)}
          highlight
        />
        <Link href="/admin/withdrawals" className="group">
          <Metric
            title={`Saques pendentes (${pendingWithdrawals?.count ?? 0})`}
            value={formatPrice(pendingWithdrawals?.totalCents ?? 0)}
          />
        </Link>
      </div>

      <h2 className="mt-10 mb-3 font-semibold">Últimas vendas</h2>
      {latestSales.length === 0 ? (
        <p className="py-10 text-center text-zinc-500">Nenhuma venda ainda.</p>
      ) : (
        <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
          {latestSales.map((o) => (
            <div
              key={o._id.toString()}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">
                  {o.items.length} foto{o.items.length > 1 ? "s" : ""} —{" "}
                  {o.customer?.name || "cliente removido"}
                </p>
                <p className="text-zinc-500">
                  {new Date(o.updatedAt).toLocaleString("pt-BR")} ·{" "}
                  {o.customer?.email}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatPrice(o.totalCents)}</p>
                <p className="text-zinc-500">
                  comissão {formatPrice(o.commissionCents)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
