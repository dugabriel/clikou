import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Gallery from "@/models/Gallery";
import GalleryPhoto from "@/models/GalleryPhoto";
import { isExpired, hasGalleryAccess } from "@/lib/gallery";

// Mesmo limiar da busca de evento: distância euclidiana máxima para
// considerar "a mesma pessoa".
const THRESHOLD = 0.55;

function distance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

// Busca por selfie restrita às fotos DESTA galeria — gated pelo slug
// (+PIN, se houver), como as demais rotas /api/g.
export async function POST(req, ctx) {
  const { slug } = await ctx.params;
  const { descriptor } = await req.json().catch(() => ({}));

  if (
    !Array.isArray(descriptor) ||
    descriptor.length !== 128 ||
    descriptor.some((n) => typeof n !== "number")
  ) {
    return NextResponse.json({ error: "Descritor inválido." }, { status: 400 });
  }

  await dbConnect();
  const gallery = await Gallery.findOne({ slug });
  if (!gallery || isExpired(gallery) || gallery.faceSearch === false) {
    return NextResponse.json({ error: "Indisponível." }, { status: 404 });
  }
  if (!(await hasGalleryAccess(gallery))) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const photos = await GalleryPhoto.find({
    gallery: gallery._id,
    "faces.0": { $exists: true },
  })
    .select("faces")
    .lean();

  const photoIds = [];
  for (const photo of photos) {
    for (const face of photo.faces) {
      if (distance(descriptor, face) <= THRESHOLD) {
        photoIds.push(photo._id.toString());
        break;
      }
    }
  }

  return NextResponse.json({ photoIds });
}
