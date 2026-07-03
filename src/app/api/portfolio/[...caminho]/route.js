import { NextResponse } from "next/server";
import { lerArquivo } from "@/lib/storage";

// Serve imagens do portfólio (chaves sempre sob "portfolio/").
export async function GET(req, ctx) {
  const { caminho } = await ctx.params;
  const chave = `portfolio/${caminho.join("/")}`;
  if (chave.includes("..")) {
    return new NextResponse("Inválido", { status: 400 });
  }

  try {
    const buf = await lerArquivo(chave);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse("Não encontrada", { status: 404 });
  }
}
