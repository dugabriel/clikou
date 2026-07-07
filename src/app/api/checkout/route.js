import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Photo from "@/models/Photo";
import Order from "@/models/Order";
import { getSession } from "@/lib/auth";
import {
  mpEnabled,
  splitEnabled,
  preferences,
  sellerPreferences,
  getConnectedSeller,
} from "@/lib/mp";
import { effectiveCommissionPercent } from "@/lib/plan";
import { approveOrder } from "@/lib/orders";

export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login para comprar." }, { status: 401 });
  }

  const { photoIds } = await req.json();
  if (!Array.isArray(photoIds) || photoIds.length === 0) {
    return NextResponse.json({ error: "Selecione ao menos uma foto." }, { status: 400 });
  }

  await dbConnect();
  const photos = await Photo.find({ _id: { $in: photoIds } }).populate(
    "event",
    "title"
  );
  if (photos.length === 0) {
    return NextResponse.json({ error: "Fotos não encontradas." }, { status: 404 });
  }

  const total = photos.reduce((s, p) => s + p.priceCents, 0);
  const order = await Order.create({
    customer: session.id,
    items: photos.map((p) => ({
      photo: p._id,
      photographer: p.photographer,
      priceCents: p.priceCents,
    })),
    totalCents: total,
  });

  const appUrl = process.env.APP_URL || new URL(req.url).origin;

  // Sem token do Mercado Pago: modo dev, aprova na hora.
  if (!mpEnabled) {
    await approveOrder(order._id, null, { appUrl });
    return NextResponse.json({ url: "/purchase/success?dev=1" });
  }
  const eventTitle = photos[0].event?.title || "evento";
  const prefBody = {
    items: [
      {
        id: order._id.toString(),
        title: `${photos.length} foto(s) — ${eventTitle} (clikou)`,
        quantity: 1,
        currency_id: "BRL",
        unit_price: total / 100,
      },
    ],
    external_reference: order._id.toString(),
    notification_url: `${appUrl}/api/webhooks/mercadopago`,
    back_urls: {
      success: `${appUrl}/purchase/success`,
      failure: `${appUrl}/purchase/error`,
      pending: `${appUrl}/purchase/success?pending=1`,
    },
    auto_return: "approved",
  };

  // Split automático: pedido de um único fotógrafo com conta MP conectada.
  // O pagamento entra direto na conta dele e a comissão fica retida no
  // gateway (marketplace_fee) — a carteira não entra no fluxo. Qualquer
  // falha aqui cai no fluxo normal (carteira + saque).
  const photographerIds = [
    ...new Set(photos.map((p) => p.photographer.toString())),
  ];
  if (splitEnabled && photographerIds.length === 1) {
    try {
      const seller = await getConnectedSeller(photographerIds[0]);
      if (seller) {
        const percent = effectiveCommissionPercent(seller);
        const feeCents = Math.round((total * percent) / 100);
        const pref = await sellerPreferences(seller.mpAccessToken).create({
          body: {
            ...prefBody,
            // O webhook chega em nome do vendedor; o pedido na query permite
            // achar o token certo para consultar o pagamento.
            notification_url: `${appUrl}/api/webhooks/mercadopago?order=${order._id}`,
            marketplace_fee: feeCents / 100,
          },
        });
        order.split = true;
        order.commissionCents = feeCents;
        order.mpPreferenceId = pref.id;
        await order.save();
        return NextResponse.json({ url: pref.init_point });
      }
    } catch (e) {
      console.error("Checkout split MP:", e.message);
    }
  }

  const pref = await preferences().create({ body: prefBody });

  order.mpPreferenceId = pref.id;
  await order.save();

  return NextResponse.json({ url: pref.init_point });
}
