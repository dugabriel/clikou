import { NextResponse } from "next/server";
import { Readable } from "stream";
import { dbConnect } from "@/lib/db";
import Gallery from "@/models/Gallery";
import GalleryPhoto from "@/models/GalleryPhoto";
import { isExpired, hasGalleryAccess, galleryFileSlug } from "@/lib/gallery";
import { signedDownloadUrl, readStream, usingGCS } from "@/lib/storage";
import {
  zipIsCurrent,
  buildGalleryZip,
  MAX_ZIP_BYTES,
  BUILD_LOCK_MS,
} from "@/lib/galleryZip";

async function gatedGallery(slug) {
  await dbConnect();
  const gallery = await Gallery.findOne({ slug });
  if (!gallery || isExpired(gallery)) {
    return { error: new NextResponse("Indisponível", { status: 404 }) };
  }
  if (!gallery.downloadEnabled) {
    return {
      error: new NextResponse("Download desativado nesta galeria.", {
        status: 403,
      }),
    };
  }
  if (!(await hasGalleryAccess(gallery))) {
    return { error: new NextResponse("Acesso negado", { status: 403 }) };
  }
  return { gallery };
}

function zipFileName(gallery) {
  return `${galleryFileSlug(gallery)}.zip`;
}

// Prepara o ZIP (gera uma vez e guarda no bucket). Guardrails: cache por
// estado das fotos (cliques repetidos reutilizam), trava atômica contra
// gerações concorrentes e teto de tamanho.
export async function POST(req, ctx) {
  const { slug } = await ctx.params;
  const { gallery, error } = await gatedGallery(slug);
  if (error) return error;

  if (await zipIsCurrent(gallery)) {
    return NextResponse.json({ ready: true, bytes: gallery.zipBytes });
  }

  const photos = await GalleryPhoto.find({ gallery: gallery._id }).select(
    "fileSize"
  );
  if (photos.length === 0) {
    return NextResponse.json({ error: "Galeria vazia." }, { status: 404 });
  }
  const totalBytes = photos.reduce((sum, p) => sum + (p.fileSize || 0), 0);
  if (totalBytes > MAX_ZIP_BYTES) {
    return NextResponse.json(
      { error: "Esta galeria passa de 6 GB — baixe as fotos individualmente." },
      { status: 413 }
    );
  }

  // Toma a trava de geração de forma atômica: só um build por galeria.
  const now = new Date();
  const locked = await Gallery.findOneAndUpdate(
    {
      _id: gallery._id,
      $or: [
        { zipBuildingAt: null },
        { zipBuildingAt: { $lt: new Date(now.getTime() - BUILD_LOCK_MS) } },
      ],
    },
    { zipBuildingAt: now },
    { new: true }
  );
  if (!locked) {
    return NextResponse.json({ building: true }, { status: 202 });
  }

  try {
    const { bytes } = await buildGalleryZip(locked);
    return NextResponse.json({ ready: true, bytes });
  } catch {
    // Solta a trava para a próxima tentativa não esperar o lock vencer.
    await Gallery.updateOne(
      { _id: gallery._id },
      { $unset: { zipBuildingAt: 1 } }
    );
    return NextResponse.json(
      { error: "Não foi possível preparar o ZIP. Tente de novo." },
      { status: 500 }
    );
  }
}

// Entrega o ZIP pronto: redirect para URL assinada (download direto do
// bucket, retomável) ou streaming do arquivo quando não dá para assinar
// (dev local). Se o zip não está pronto/atual, manda preparar.
export async function GET(req, ctx) {
  const { slug } = await ctx.params;
  const { gallery, error } = await gatedGallery(slug);
  if (error) return error;

  if (!(await zipIsCurrent(gallery))) {
    return new NextResponse(
      "O ZIP ainda não foi preparado — use o botão 'Baixar todas' na página da galeria.",
      { status: 409 }
    );
  }

  const name = zipFileName(gallery);
  const signed = await signedDownloadUrl(gallery.zipKey, name);
  if (signed) return NextResponse.redirect(signed);

  if (usingGCS) {
    // Com GCS a entrega é sempre por URL assinada: servir o ZIP pelo app
    // estoura o limite de resposta do Cloud Run. Se chegou aqui, a
    // assinatura falhou (ver log de signedDownloadUrl) — erro legível em
    // vez de tela branca.
    return new NextResponse(
      "Não foi possível gerar o link de download. Tente de novo em instantes.",
      { status: 500 }
    );
  }

  const stream = await readStream(gallery.zipKey);
  return new NextResponse(Readable.toWeb(stream), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Length": String(gallery.zipBytes || ""),
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}
