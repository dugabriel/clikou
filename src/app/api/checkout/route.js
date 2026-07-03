import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Foto from "@/models/Foto";
import Pedido from "@/models/Pedido";
import { obterSessao } from "@/lib/auth";
import { mpAtivo, preferencias } from "@/lib/mp";
import { aprovarPedido } from "@/lib/pedidos";

export async function POST(req) {
  const sessao = await obterSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Faça login para comprar." }, { status: 401 });
  }

  const { fotoIds } = await req.json();
  if (!Array.isArray(fotoIds) || fotoIds.length === 0) {
    return NextResponse.json({ erro: "Selecione ao menos uma foto." }, { status: 400 });
  }

  await dbConnect();
  const fotos = await Foto.find({ _id: { $in: fotoIds } }).populate(
    "evento",
    "titulo"
  );
  if (fotos.length === 0) {
    return NextResponse.json({ erro: "Fotos não encontradas." }, { status: 404 });
  }

  const total = fotos.reduce((s, f) => s + f.precoCentavos, 0);
  const pedido = await Pedido.create({
    cliente: sessao.id,
    itens: fotos.map((f) => ({
      foto: f._id,
      fotografo: f.fotografo,
      precoCentavos: f.precoCentavos,
    })),
    totalCentavos: total,
  });

  // Sem token do Mercado Pago: modo dev, aprova na hora.
  if (!mpAtivo) {
    await aprovarPedido(pedido._id);
    return NextResponse.json({ url: "/compra/sucesso?dev=1" });
  }

  const appUrl = process.env.APP_URL || new URL(req.url).origin;
  const tituloEvento = fotos[0].evento?.titulo || "evento";
  const pref = await preferencias().create({
    body: {
      items: [
        {
          id: pedido._id.toString(),
          title: `${fotos.length} foto(s) — ${tituloEvento} (clikou)`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: total / 100,
        },
      ],
      external_reference: pedido._id.toString(),
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      back_urls: {
        success: `${appUrl}/compra/sucesso`,
        failure: `${appUrl}/compra/erro`,
        pending: `${appUrl}/compra/sucesso?pendente=1`,
      },
      auto_return: "approved",
    },
  });

  pedido.mpPreferenceId = pref.id;
  await pedido.save();

  return NextResponse.json({ url: pref.init_point });
}
