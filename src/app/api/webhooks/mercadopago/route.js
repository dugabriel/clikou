import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { mpEnabled, payments } from "@/lib/mp";
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
    const payment = await payments().get({ id: paymentId });
    if (payment.status === "approved" && payment.external_reference) {
      await dbConnect();
      await approveOrder(payment.external_reference, String(paymentId));
    }
  } catch (e) {
    console.error("Webhook MP:", e.message);
  }

  // Sempre 200 para o MP não ficar reenviando.
  return NextResponse.json({ ok: true });
}
