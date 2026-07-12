import { NextResponse } from "next/server";
import { Readable } from "stream";
import { once } from "events";
import { ZipArchive } from "archiver";
import { dbConnect } from "@/lib/db";
import Gallery from "@/models/Gallery";
import GalleryPhoto from "@/models/GalleryPhoto";
import { isExpired, hasGalleryAccess } from "@/lib/gallery";
import { readFile } from "@/lib/storage";

// Trava de tamanho do zip: acima disso a resposta seria longa demais até
// para o timeout máximo do Cloud Run e cara demais para servir em uma
// requisição só. Fotos antigas sem fileSize contam como 0 (melhor esforço).
const MAX_ZIP_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

// "Baixar todas": zip dos originais em streaming (store, sem recomprimir os
// JPEGs). Mesmo gating do download individual. O zip passa pelo servidor —
// só o download individual vai direto do bucket via URL assinada.
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
    .select("originalKey fileName fileSize");
  if (photos.length === 0) {
    return new NextResponse("Galeria vazia", { status: 404 });
  }

  const totalBytes = photos.reduce((sum, p) => sum + (p.fileSize || 0), 0);
  if (totalBytes > MAX_ZIP_BYTES) {
    return new NextResponse(
      "Esta galeria passa de 2 GB — baixe as fotos individualmente ou fale com o fotógrafo.",
      { status: 413 }
    );
  }

  const archive = new ZipArchive({ store: true });
  // Cliente desistiu do download → para de ler do bucket.
  req.signal?.addEventListener("abort", () => {
    try {
      archive.abort();
    } catch {}
  });

  // Alimenta o zip enquanto a resposta já vai sendo transmitida.
  (async () => {
    const used = new Map();
    try {
      for (const p of photos) {
        if (req.signal?.aborted) return;
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
        let buf;
        try {
          buf = await readFile(p.originalKey);
        } catch {
          continue; // arquivo sumiu do storage — pula
        }
        archive.append(buf, { name });
        // Contrapressão: espera esta entrada ser consumida antes de ler a
        // próxima do bucket. Sem isso o loop enfileira a galeria INTEIRA na
        // RAM quando o cliente baixa mais devagar que o GCS entrega — foi o
        // que estourava a memória (e truncava o zip) em galerias grandes.
        await once(archive, "entry");
      }
      archive.finalize();
    } catch {
      // Erro no meio do stream (ou cliente abortou): encerra o zip para o
      // consumidor não ficar pendurado.
      try {
        archive.abort();
      } catch {}
    }
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
