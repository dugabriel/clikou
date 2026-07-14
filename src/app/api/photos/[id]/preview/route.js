import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Photo from "@/models/Photo";
import { readFile } from "@/lib/storage";

// Preview público — com marca d'água, exceto em evento de divulgação (o
// upload já gera o preview limpo). ?download=1 força o download do arquivo
// (a versão web de 1600px, gratuita nos eventos de divulgação).
export async function GET(req, ctx) {
  const { id } = await ctx.params;
  await dbConnect();
  const photo = await Photo.findById(id).select("previewKey fileName");
  if (!photo) return new NextResponse("Não encontrada", { status: 404 });

  const buf = await readFile(photo.previewKey);
  const headers = {
    "Content-Type": "image/jpeg",
    "Cache-Control": "public, max-age=86400, immutable",
  };
  if (new URL(req.url).searchParams.has("download")) {
    const name = photo.fileName || `clikou-${photo._id}.jpg`;
    headers["Content-Disposition"] = `attachment; filename="${name}"`;
  }
  return new NextResponse(buf, { headers });
}
