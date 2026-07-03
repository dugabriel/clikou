import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { mpAtivo, pagamentos } from "@/lib/mp";
import { aprovarPedido } from "@/lib/pedidos";

export async function POST(req) {
  if (!mpAtivo) return NextResponse.json({ ok: true });

  // O MP envia o id do pagamento no corpo ou na query, dependendo do evento.
  const url = new URL(req.url);
  let corpo = {};
  try {
    corpo = await req.json();
  } catch {}

  const tipo = corpo.type || url.searchParams.get("type") || url.searchParams.get("topic");
  const pagamentoId =
    corpo?.data?.id || url.searchParams.get("data.id") || url.searchParams.get("id");

  if (tipo !== "payment" || !pagamentoId) {
    return NextResponse.json({ ok: true });
  }

  try {
    const pagamento = await pagamentos().get({ id: pagamentoId });
    if (pagamento.status === "approved" && pagamento.external_reference) {
      await dbConnect();
      await aprovarPedido(pagamento.external_reference, String(pagamentoId));
    }
  } catch (e) {
    console.error("Webhook MP:", e.message);
  }

  // Sempre 200 para o MP não ficar reenviando.
  return NextResponse.json({ ok: true });
}
