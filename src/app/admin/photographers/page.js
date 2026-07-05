import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { COMMISSION_PERCENT } from "@/lib/mp";
import { formatPrice } from "@/lib/currency";
import CommissionForm from "@/components/CommissionForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Fotógrafos — Administração — Clikou" };

export default async function AdminPhotographers() {
  await dbConnect();

  const [users, sales] = await Promise.all([
    User.find()
      .select("name email balanceCents commissionPercent username")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean(),
    Order.aggregate([
      { $match: { status: "paid" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.photographer",
          soldCents: { $sum: "$items.priceCents" },
          photosSold: { $sum: 1 },
        },
      },
    ]),
  ]);

  const salesBy = new Map(sales.map((s) => [s._id.toString(), s]));
  const rows = users
    .map((u) => ({ ...u, sales: salesBy.get(u._id.toString()) }))
    .sort(
      (a, b) =>
        (b.sales?.soldCents || 0) - (a.sales?.soldCents || 0) ||
        b.balanceCents - a.balanceCents
    );

  return (
    <div>
      <p className="mb-4 text-sm text-zinc-500">
        Taxa padrão da plataforma: <strong>{COMMISSION_PERCENT}%</strong>. Defina
        uma taxa individual para sobrescrevê-la; deixe em branco para voltar ao
        padrão.
      </p>

      <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
        {rows.map((u) => (
          <div
            key={u._id.toString()}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium">
                {u.name}
                {u.username && (
                  <a
                    href={`/f/${u.username}`}
                    className="ml-2 text-xs text-zinc-500 hover:text-yellow-400"
                  >
                    /f/{u.username}
                  </a>
                )}
              </p>
              <p className="text-zinc-500">{u.email}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="font-medium">
                  {formatPrice(u.sales?.soldCents || 0)}
                  <span className="ml-1 text-xs font-normal text-zinc-500">
                    vendido ({u.sales?.photosSold || 0} fotos)
                  </span>
                </p>
                <p className="text-zinc-500">
                  saldo {formatPrice(u.balanceCents)}
                </p>
              </div>
              <CommissionForm
                userId={u._id.toString()}
                currentRate={u.commissionPercent}
                defaultRate={COMMISSION_PERCENT}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
