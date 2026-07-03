import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Usuario from "@/models/Usuario";
import { obterSessao, ehAdmin } from "@/lib/auth";

export async function PATCH(req, { params }) {
  const sessao = await obterSessao();
  if (!ehAdmin(sessao)) {
    return NextResponse.json({ erro: "Acesso restrito." }, { status: 403 });
  }

  const { id } = await params;
  const { comissaoPorcento } = await req.json();

  // Vazio/null volta a usar a taxa padrão da plataforma.
  let taxa = null;
  if (comissaoPorcento !== null && comissaoPorcento !== "") {
    taxa = Number(String(comissaoPorcento).replace(",", "."));
    if (Number.isNaN(taxa) || taxa < 0 || taxa > 100) {
      return NextResponse.json(
        { erro: "Taxa deve ser um número entre 0 e 100." },
        { status: 400 }
      );
    }
  }

  await dbConnect();
  const usuario = await Usuario.findByIdAndUpdate(
    id,
    { comissaoPorcento: taxa },
    { new: true }
  ).select("comissaoPorcento");
  if (!usuario) {
    return NextResponse.json({ erro: "Usuário não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, comissaoPorcento: usuario.comissaoPorcento });
}
