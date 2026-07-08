import { NextResponse } from "next/server";
import { Readable } from "stream";
import { ZipArchive } from "archiver";
import { dbConnect } from "@/lib/db";
import Gallery from "@/models/Gallery";
import GalleryPhoto from "@/models/GalleryPhoto";
import { isExpired, hasGalleryAccess } from "@/lib/gallery";
import { readFile } from "@/lib/storage";

// "Baixar todas": zip dos originais em streaming (store, sem recomprimir os
// JPEGs). Mesmo gating do download individual.
export async function GET(req, ctx) {
  const { slug } = await ctx.params;

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

  const photos = await GalleryPhoto.find({ gallery: gallery._id })
    .sort({ createdAt: 1 })
    .select("originalKey fileName");
  if (photos.length === 0) {
    return new NextResponse("Galeria vazia", { status: 404 });
  }

  const archive = new ZipArchive({ store: true });
  // Alimenta o zip enquanto a resposta já vai sendo transmitida.
  (async () => {
    const used = new Map();
    for (const p of photos) {
      let name = p.fileName || `foto-${p._id}.jpg`;
      const n = (used.get(name) || 0) + 1;
      used.set(name, n);
      if (n > 1) {
        const dot = name.lastIndexOf(".");
        name =
          dot > 0
            ? `${name.slice(0, dot)}-${n}${name.slice(dot)}`
            : `${name}-${n}`;
      }
      try {
        const buf = await readFile(p.originalKey);
        archive.append(buf, { name });
      } catch {
        // arquivo sumiu do storage — pula
      }
    }
    archive.finalize();
  })();

  const zipName =
    (gallery.title || "galeria").replace(/[^\w-]+/g, "_").slice(0, 60) ||
    "galeria";

  return new NextResponse(Readable.toWeb(archive), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipName}.zip"`,
    },
  });
}
