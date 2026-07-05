import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Photo from "@/models/Photo";
import Order from "@/models/Order";
import { getSession } from "@/lib/auth";
import { mpEnabled, preferences } from "@/lib/mp";
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

  // Sem token do Mercado Pago: modo dev, aprova na hora.
  if (!mpEnabled) {
    await approveOrder(order._id);
    return NextResponse.json({ url: "/purchase/success?dev=1" });
  }

  const appUrl = process.env.APP_URL || new URL(req.url).origin;
  const eventTitle = photos[0].event?.title || "evento";
  const pref = await preferences().create({
    body: {
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
    },
  });

  order.mpPreferenceId = pref.id;
  await order.save();

  return NextResponse.json({ url: pref.init_point });
}
