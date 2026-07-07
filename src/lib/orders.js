import Order from "@/models/Order";
import User from "@/models/User";
import { effectiveCommissionPercent } from "@/lib/plan";
import { emailEnabled, sendPurchaseEmail } from "@/lib/email";

// Marca o pedido como pago e credita a parte de cada fotógrafo na carteira.
// Idempotente: se o pedido já está pago, não credita de novo.
export async function approveOrder(orderId, mpPaymentId = null, { appUrl } = {}) {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, status: "pending" },
    { status: "paid", ...(mpPaymentId ? { mpPaymentId } : {}) },
    { new: true }
  );
  if (!order) return null;

  // Pedido split: o Mercado Pago já repassou a parte do fotógrafo no
  // pagamento (comissão retida via marketplace_fee no checkout); nada
  // a creditar na carteira.
  if (!order.split) {
    // Taxa individual do fotógrafo, se definida; senão a padrão da plataforma.
    const photographerIds = [
      ...new Set(order.items.map((i) => i.photographer.toString())),
    ];
    const photographers = await User.find({ _id: { $in: photographerIds } })
      .select("commissionPercent plan planCurrentPeriodEnd")
      .lean();
    const rates = new Map(
      photographers.map((p) => [
        p._id.toString(),
        effectiveCommissionPercent(p),
      ])
    );

    let totalCommission = 0;
    const credits = new Map();
    for (const item of order.items) {
      const percent = rates.get(item.photographer.toString()) ?? 0;
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
  }

  await notifyPurchase(order, appUrl);
  return order;
}

// Avisa o cliente por e-mail; falha no envio não pode desfazer a aprovação.
async function notifyPurchase(order, appUrl) {
  if (!emailEnabled) return;
  try {
    const customer = await User.findById(order.customer)
      .select("name email")
      .lean();
    if (!customer) return;
    await sendPurchaseEmail({
      to: customer.email,
      name: customer.name,
      photoCount: order.items.length,
      totalCents: order.totalCents,
      appUrl: appUrl || process.env.APP_URL || "http://localhost:3000",
    });
  } catch (e) {
    console.error("E-mail de compra:", e.message);
  }
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
