import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Saque from "@/models/Saque";
import Usuario from "@/models/Usuario";
import { obterSessao, ehAdmin } from "@/lib/auth";

export async function PATCH(req, { params }) {
  const sessao = await obterSessao();
  if (!ehAdmin(sessao)) {
    return NextResponse.json({ erro: "Acesso restrito." }, { status: 403 });
  }

  const { id } = await params;
  const { acao } = await req.json();
  if (!["pagar", "recusar"].includes(acao)) {
    return NextResponse.json({ erro: "Ação inválida." }, { status: 400 });
  }

  await dbConnect();
  // Só transiciona a partir de "pendente" (evita pagar/estornar duas vezes).
  const saque = await Saque.findOneAndUpdate(
    { _id: id, status: "pendente" },
    { status: acao === "pagar" ? "pago" : "recusado" },
    { new: true }
  );
  if (!saque) {
    return NextResponse.json(
      { erro: "Saque não encontrado ou já processado." },
      { status: 404 }
    );
  }

  // Recusou: devolve o valor (debitado na solicitação) à carteira.
  if (acao === "recusar") {
    await Usuario.updateOne(
      { _id: saque.fotografo },
      { $inc: { saldoCentavos: saque.valorCentavos } }
    );
  }

  return NextResponse.json({ ok: true, status: saque.status });
}
