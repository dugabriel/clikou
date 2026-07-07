import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import { mpEnabled, payments, sellerPayments, getConnectedSeller } from "@/lib/mp";
import { billingEnabled } from "@/lib/billing";
import { approveOrder } from "@/lib/orders";
import { syncSubscription } from "@/lib/subscription";

export async function POST(req) {
  // O MP envia o id no corpo ou na query, dependendo do evento.
  const url = new URL(req.url);
  let body = {};
  try {
    body = await req.json();
  } catch {}

  const type = body.type || url.searchParams.get("type") || url.searchParams.get("topic");
  const dataId =
    body?.data?.id || url.searchParams.get("data.id") || url.searchParams.get("id");

  // Assinatura Pro: reconcilia o plano do fotógrafo pelo estado no MP.
  // "subscription_preapproval" traz o id da assinatura; o pagamento
  // recorrente ("subscription_authorized_payment") traz o preapproval_id.
  // Usa o token do app de assinaturas (billingEnabled), separado do checkout.
  if (type === "subscription_preapproval" || type === "subscription_authorized_payment") {
    if (billingEnabled) {
      try {
        await dbConnect();
        const preapprovalId =
          type === "subscription_preapproval" ? dataId : body?.data?.preapproval_id;
        await syncSubscription(preapprovalId);
      } catch (e) {
        console.error("Webhook assinatura MP:", e.message);
      }
    }
    return NextResponse.json({ ok: true });
  }

  // Pagamentos (venda de fotos) usam o token do checkout.
  if (!mpEnabled) return NextResponse.json({ ok: true });
  const paymentId = dataId;
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
