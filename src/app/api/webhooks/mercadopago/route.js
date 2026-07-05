import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import { mpEnabled, payments, sellerPayments, getConnectedSeller } from "@/lib/mp";
import { approveOrder } from "@/lib/orders";

export async function POST(req) {
  if (!mpEnabled) return NextResponse.json({ ok: true });

  // O MP envia o id do pagamento no corpo ou na query, dependendo do evento.
  const url = new URL(req.url);
  let body = {};
  try {
    body = await req.json();
  } catch {}

  const type = body.type || url.searchParams.get("type") || url.searchParams.get("topic");
  const paymentId =
    body?.data?.id || url.searchParams.get("data.id") || url.searchParams.get("id");

  if (type !== "payment" || !paymentId) {
    return NextResponse.json({ ok: true });
  }

  try {
    await dbConnect();

    // Pedido split: o pagamento mora na conta do fotógrafo, então a
    // consulta precisa do token dele (o pedido vem na query do
    // notification_url gerado no checkout).
    let payment = null;
    const orderId = url.searchParams.get("order");
    if (orderId) {
      const order = await Order.findById(orderId).select("items.photographer");
      const seller = order?.items[0]?.photographer
        ? await getConnectedSeller(order.items[0].photographer)
        : null;
      if (seller) {
        payment = await sellerPayments(seller.mpAccessToken).get({ id: paymentId });
      }
    }
    if (!payment) {
      payment = await payments().get({ id: paymentId });
    }

    if (payment.status === "approved" && payment.external_reference) {
      const appUrl = process.env.APP_URL || url.origin;
      await approveOrder(payment.external_reference, String(paymentId), { appUrl });
    }
  } catch (e) {
    console.error("Webhook MP:", e.message);
  }

  // Sempre 200 para o MP não ficar reenviando.
  return NextResponse.json({ ok: true });
}
