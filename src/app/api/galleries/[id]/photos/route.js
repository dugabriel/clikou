import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Gallery from "@/models/Gallery";
import GalleryPhoto from "@/models/GalleryPhoto";
import { getSession } from "@/lib/auth";
import { generatePreview, generatePlainPreview } from "@/lib/watermark";
import { saveFile } from "@/lib/storage";
import { normalizeImage, jpegFileName } from "@/lib/heic";

// Sobe uma foto por requisição (o front envia em fila, como no upload de
// evento). Sem preço/rostos: galeria de entrega é privada e não é vendida.
export async function POST(req, ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const { id } = await ctx.params;
  await dbConnect();
  const gallery = await Gallery.findById(id);
  if (!gallery || gallery.photographer.toString() !== session.id) {
    return NextResponse.json(
      { error: "Galeria não encontrada." },
      { status: 404 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Envie um arquivo." }, { status: 400 });
  }

  // Descritores faciais calculados no navegador durante o upload (mesma
  // validação do upload de evento). Só valem com a busca por selfie ligada.
  let faces = [];
  if (gallery.faceSearch !== false) {
    try {
      const raw = JSON.parse(form.get("faces") || "[]");
      if (Array.isArray(raw)) {
        faces = raw
          .filter(
            (f) =>
              Array.isArray(f) &&
              f.length === 128 &&
              f.every((n) => typeof n === "number")
          )
          .slice(0, 30);
      }
    } catch {}
  }

  // HEIC do iPhone vira JPEG já na entrada — moderação, marca d'água e o
  // download do cliente só veem JPEG.
  let original = Buffer.from(await file.arrayBuffer());
  let fileName = file.name || "foto.jpg";
  try {
    const norm = await normalizeImage(original);
    if (norm.converted) {
      original = norm.buffer;
      fileName = jpegFileName(fileName);
    }
  } catch {
    return NextResponse.json(
      { error: `Arquivo "${file.name}" não é uma imagem válida.` },
      { status: 400 }
    );
  }

  const { isImageInappropriate } = await import("@/lib/moderation");
  const moderation = await isImageInappropriate(original);
  if (moderation.blocked) {
    return NextResponse.json(
      {
        error: `"${file.name}" foi bloqueada pela moderação (${moderation.reason}).`,
      },
      { status: 422 }
    );
  }

  let derived;
  try {
    derived = gallery.watermarkPreviews
      ? await generatePreview(original)
      : await generatePlainPreview(original);
  } catch {
    return NextResponse.json(
      { error: `Arquivo "${file.name}" não é uma imagem válida.` },
      { status: 400 }
    );
  }

  const photo = new GalleryPhoto({
    gallery: gallery._id,
    photographer: session.id,
    fileName,
    fileSize: file.size || 0,
    width: derived.width,
    height: derived.height,
    faces,
    originalKey: "",
    previewKey: "",
  });
  photo.originalKey = `galleries/${gallery._id}/originals/${photo._id}.jpg`;
  photo.previewKey = `galleries/${gallery._id}/previews/${photo._id}.jpg`;

  await saveFile(photo.originalKey, original, file.type || "image/jpeg");
  await saveFile(photo.previewKey, derived.preview, "image/jpeg");
  await photo.save();

  if (!gallery.cover) {
    gallery.cover = photo._id;
    await gallery.save();
  }

  return NextResponse.json({ ok: true, id: photo._id.toString() });
}
