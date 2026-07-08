import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Gallery from "@/models/Gallery";
import GalleryPhoto from "@/models/GalleryPhoto";
import { isExpired, hasGalleryAccess } from "@/lib/gallery";
import { readFile } from "@/lib/storage";

// Preview de uma foto da galeria — gated pelo slug (+PIN, se houver).
export async function GET(req, ctx) {
  const { slug, pid } = await ctx.params;

  await dbConnect();
  const gallery = await Gallery.findOne({ slug });
  if (!gallery || isExpired(gallery)) {
    return new NextResponse("Indisponível", { status: 404 });
  }
  if (!(await hasGalleryAccess(gallery))) {
    return new NextResponse("Acesso negado", { status: 403 });
  }

  const photo = await GalleryPhoto.findOne({
    _id: pid,
    gallery: gallery._id,
  }).select("previewKey");
  if (!photo) return new NextResponse("Não encontrada", { status: 404 });

  const buf = await readFile(photo.previewKey);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "image/jpeg",
      // Privado: não deixa cache compartilhado guardar a imagem de entrega.
      "Cache-Control": "private, max-age=3600",
    },
  });
}
