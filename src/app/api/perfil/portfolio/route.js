import { NextResponse } from "next/server";
import crypto from "crypto";
import sharp from "sharp";
import { dbConnect } from "@/lib/db";
import Usuario from "@/models/Usuario";
import { obterSessao } from "@/lib/auth";
import { salvarArquivo, removerArquivo } from "@/lib/storage";
import { imagemInapropriada } from "@/lib/moderacao";

const MAX_FOTOS = 8;

export async function POST(req) {
  const sessao = await obterSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Faça login." }, { status: 401 });
  }

  await dbConnect();
  const usuario = await Usuario.findById(sessao.id).select("portfolio");
  if (usuario.portfolio.length >= MAX_FOTOS) {
    return NextResponse.json(
      { erro: `Máximo de ${MAX_FOTOS} fotos no portfólio.` },
      { status: 400 }
    );
  }

  const form = await req.formData();
  const arquivo = form.get("arquivo");
  if (!arquivo || typeof arquivo === "string") {
    return NextResponse.json({ erro: "Envie um arquivo." }, { status: 400 });
  }

  const original = Buffer.from(await arquivo.arrayBuffer());
  const moderacao = await imagemInapropriada(original);
  if (moderacao.bloqueada) {
    return NextResponse.json(
      { erro: `Imagem bloqueada pela moderação (${moderacao.motivo}).` },
      { status: 422 }
    );
  }

  let imagem;
  try {
    imagem = await sharp(original)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer();
  } catch {
    return NextResponse.json(
      { erro: "Arquivo não é uma imagem válida." },
      { status: 400 }
    );
  }

  const chave = `portfolio/${sessao.id}/${crypto.randomUUID()}.jpg`;
  await salvarArquivo(chave, imagem, "image/jpeg");
  await Usuario.updateOne({ _id: sessao.id }, { $push: { portfolio: chave } });

  return NextResponse.json({ ok: true, chave });
}

export async function DELETE(req) {
  const sessao = await obterSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Faça login." }, { status: 401 });
  }

  const { chave } = await req.json();
  await dbConnect();
  const resultado = await Usuario.updateOne(
    { _id: sessao.id, portfolio: chave },
    { $pull: { portfolio: chave } }
  );
  if (resultado.modifiedCount > 0) await removerArquivo(chave);

  return NextResponse.json({ ok: true });
}
