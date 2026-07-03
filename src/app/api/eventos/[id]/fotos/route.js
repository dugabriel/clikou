import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Evento from "@/models/Evento";
import Foto from "@/models/Foto";
import { obterSessao } from "@/lib/auth";
import { gerarPreview } from "@/lib/watermark";
import { salvarArquivo } from "@/lib/storage";
import { paraCentavos } from "@/lib/moeda";

// Recebe uma foto por requisição (multipart). O front envia em fila.
export async function POST(req, ctx) {
  const sessao = await obterSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Faça login." }, { status: 401 });
  }

  const { id } = await ctx.params;
  await dbConnect();
  const evento = await Evento.findById(id);
  if (!evento || evento.fotografo.toString() !== sessao.id) {
    return NextResponse.json({ erro: "Evento não encontrado." }, { status: 404 });
  }

  const form = await req.formData();
  const arquivo = form.get("arquivo");
  if (!arquivo || typeof arquivo === "string") {
    return NextResponse.json({ erro: "Envie um arquivo." }, { status: 400 });
  }

  let precoCentavos = evento.precoPadraoCentavos;
  const precoForm = form.get("preco");
  if (precoForm) {
    const p = paraCentavos(precoForm);
    if (p === null || p < 100) {
      return NextResponse.json(
        { erro: "Preço mínimo por foto: R$ 1,00." },
        { status: 400 }
      );
    }
    precoCentavos = p;
  }

  // Descritores faciais calculados no navegador durante o upload
  let rostos = [];
  try {
    const brutos = JSON.parse(form.get("rostos") || "[]");
    if (Array.isArray(brutos)) {
      rostos = brutos
        .filter(
          (r) =>
            Array.isArray(r) &&
            r.length === 128 &&
            r.every((n) => typeof n === "number")
        )
        .slice(0, 30);
    }
  } catch {}

  const original = Buffer.from(await arquivo.arrayBuffer());

  const { imagemInapropriada } = await import("@/lib/moderacao");
  const moderacao = await imagemInapropriada(original);
  if (moderacao.bloqueada) {
    return NextResponse.json(
      {
        erro: `"${arquivo.name}" foi bloqueada pela moderação (${moderacao.motivo}).`,
      },
      { status: 422 }
    );
  }

  let derivado;
  try {
    derivado = await gerarPreview(original);
  } catch {
    return NextResponse.json(
      { erro: `Arquivo "${arquivo.name}" não é uma imagem válida.` },
      { status: 400 }
    );
  }

  const foto = new Foto({
    evento: evento._id,
    fotografo: sessao.id,
    precoCentavos,
    nomeArquivo: arquivo.name || "foto.jpg",
    largura: derivado.largura,
    altura: derivado.altura,
    rostos,
    chaveOriginal: "",
    chavePreview: "",
  });
  foto.chaveOriginal = `originais/${foto._id}.jpg`;
  foto.chavePreview = `previews/${foto._id}.jpg`;

  await salvarArquivo(foto.chaveOriginal, original, arquivo.type || "image/jpeg");
  await salvarArquivo(foto.chavePreview, derivado.preview, "image/jpeg");
  await foto.save();

  if (!evento.capa) {
    evento.capa = foto._id;
    await evento.save();
  }

  return NextResponse.json({
    ok: true,
    id: foto._id.toString(),
    precoCentavos,
  });
}
