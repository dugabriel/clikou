import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Gallery from "@/models/Gallery";
import GalleryPhoto from "@/models/GalleryPhoto";
import { isExpired, hasGalleryAccess } from "@/lib/gallery";
import { readFile, signedDownloadUrl } from "@/lib/storage";

// Download do original em alta — a entrega. Gated por slug (+PIN) e pelo
// downloadEnabled da galeria.
export async function GET(req, ctx) {
  const { slug, pid } = await ctx.params;

  await dbConnect();
  const gallery = await Gallery.findOne({ slug });
  if (!gallery || isExpired(gallery)) {
    return new NextResponse("Indisponível", { status: 404 });
  }
  if (!gallery.downloadEnabled) {
    return new NextResponse("Download desativado nesta galeria.", {
      status: 403,
    });
  }
  if (!(await hasGalleryAccess(gallery))) {
    return new NextResponse("Acesso negado", { status: 403 });
  }

  const photo = await GalleryPhoto.findOne({ _id: pid, gallery: gallery._id });
  if (!photo) return new NextResponse("Não encontrada", { status: 404 });

  const name = photo.fileName || `clikou-${photo._id}.jpg`;
  const signed = await signedDownloadUrl(photo.originalKey, name);
  if (signed) return NextResponse.redirect(signed);

  // Modo local (sem GCS): serve o arquivo direto.
  const buf = await readFile(photo.originalKey);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}
