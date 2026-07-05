import Order from "@/models/Order";
import User from "@/models/User";
import { COMMISSION_PERCENT } from "@/lib/mp";

// Marca o pedido como pago e credita a parte de cada fotógrafo na carteira.
// Idempotente: se o pedido já está pago, não credita de novo.
export async function approveOrder(orderId, mpPaymentId = null) {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, status: "pending" },
    { status: "paid", ...(mpPaymentId ? { mpPaymentId } : {}) },
    { new: true }
  );
  if (!order) return null;

  // Taxa individual do fotógrafo, se definida; senão a padrão da plataforma.
  const photographerIds = [
    ...new Set(order.items.map((i) => i.photographer.toString())),
  ];
  const photographers = await User.find({ _id: { $in: photographerIds } })
    .select("commissionPercent")
    .lean();
  const rates = new Map(
    photographers.map((p) => [
      p._id.toString(),
      p.commissionPercent ?? COMMISSION_PERCENT,
    ])
  );

  let totalCommission = 0;
  const credits = new Map();
  for (const item of order.items) {
    const percent = rates.get(item.photographer.toString()) ?? COMMISSION_PERCENT;
    const commission = Math.round((item.priceCents * percent) / 100);
    totalCommission += commission;
    const id = item.photographer.toString();
    credits.set(id, (credits.get(id) || 0) + item.priceCents - commission);
  }

  for (const [photographerId, amount] of credits) {
    await User.updateOne(
      { _id: photographerId },
      { $inc: { balanceCents: amount } }
    );
  }

  order.commissionCents = totalCommission;
  await order.save();
  return order;
}

// Confere se o usuário comprou (pedido pago) a foto.
export async function hasPurchased(userId, photoId) {
  const order = await Order.findOne({
    customer: userId,
    status: "paid",
    "items.photo": photoId,
  }).select("_id");
  return !!order;
}
