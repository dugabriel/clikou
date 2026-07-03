import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Foto from "@/models/Foto";
import { obterSessao } from "@/lib/auth";
import { compraLiberada } from "@/lib/pedidos";
import { lerArquivo, urlDownloadAssinada } from "@/lib/storage";

// Original sem marca d'água — só para quem comprou (ou o próprio fotógrafo).
export async function GET(req, ctx) {
  const sessao = await obterSessao();
  if (!sessao) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { id } = await ctx.params;
  await dbConnect();
  const foto = await Foto.findById(id);
  if (!foto) return new NextResponse("Não encontrada", { status: 404 });

  const ehDono = foto.fotografo.toString() === sessao.id;
  if (!ehDono && !(await compraLiberada(sessao.id, foto._id))) {
    return new NextResponse("Você ainda não comprou esta foto.", {
      status: 403,
    });
  }

  const nome = foto.nomeArquivo || `clikou-${foto._id}.jpg`;
  const assinada = await urlDownloadAssinada(foto.chaveOriginal, nome);
  if (assinada) return NextResponse.redirect(assinada);

  // Modo local (sem GCS): serve o arquivo direto.
  const buf = await lerArquivo(foto.chaveOriginal);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": `attachment; filename="${nome}"`,
    },
  });
}
