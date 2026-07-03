import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Usuario from "@/models/Usuario";
import Saque from "@/models/Saque";
import { obterSessao } from "@/lib/auth";
import { paraCentavos } from "@/lib/moeda";

const SAQUE_MINIMO_CENTAVOS = 2000; // R$ 20,00

export async function POST(req) {
  const sessao = await obterSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Faça login." }, { status: 401 });
  }

  const { valor, chavePix } = await req.json();
  const valorCentavos = paraCentavos(valor);
  if (valorCentavos === null || valorCentavos < SAQUE_MINIMO_CENTAVOS) {
    return NextResponse.json(
      { erro: "Valor mínimo de saque: R$ 20,00." },
      { status: 400 }
    );
  }
  if (!chavePix) {
    return NextResponse.json({ erro: "Informe sua chave Pix." }, { status: 400 });
  }

  await dbConnect();
  // Debita só se houver saldo suficiente (operação atômica).
  const usuario = await Usuario.findOneAndUpdate(
    { _id: sessao.id, saldoCentavos: { $gte: valorCentavos } },
    { $inc: { saldoCentavos: -valorCentavos }, chavePix },
    { new: true }
  );
  if (!usuario) {
    return NextResponse.json({ erro: "Saldo insuficiente." }, { status: 400 });
  }

  await Saque.create({
    fotografo: sessao.id,
    valorCentavos,
    chavePix,
  });

  return NextResponse.json({ ok: true, saldoCentavos: usuario.saldoCentavos });
}
