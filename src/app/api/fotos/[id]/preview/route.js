import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Foto from "@/models/Foto";
import { lerArquivo } from "@/lib/storage";

// Preview público com marca d'água.
export async function GET(req, ctx) {
  const { id } = await ctx.params;
  await dbConnect();
  const foto = await Foto.findById(id).select("chavePreview");
  if (!foto) return new NextResponse("Não encontrada", { status: 404 });

  const buf = await lerArquivo(foto.chavePreview);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
