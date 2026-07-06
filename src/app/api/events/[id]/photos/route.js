import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Event from "@/models/Event";
import Photo from "@/models/Photo";
import { getSession } from "@/lib/auth";
import { generatePreview } from "@/lib/watermark";
import { imageHashes } from "@/lib/imagehash";
import { saveFile } from "@/lib/storage";
import { toCents } from "@/lib/currency";

// Recebe uma foto por requisição (multipart). O front envia em fila.
export async function POST(req, ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const { id } = await ctx.params;
  await dbConnect();
  const event = await Event.findById(id);
  if (!event || event.photographer.toString() !== session.id) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Envie um arquivo." }, { status: 400 });
  }

  let priceCents = event.defaultPriceCents;
  const priceForm = form.get("price");
  if (priceForm) {
    const p = toCents(priceForm);
    if (p === null || p < 100) {
      return NextResponse.json(
        { error: "Preço mínimo por foto: R$ 1,00." },
        { status: 400 }
      );
    }
    priceCents = p;
  }

  // Descritores faciais calculados no navegador durante o upload
  let faces = [];
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

  const original = Buffer.from(await file.arrayBuffer());

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
    derived = await generatePreview(original);
  } catch {
    return NextResponse.json(
      { error: `Arquivo "${file.name}" não é uma imagem válida.` },
      { status: 400 }
    );
  }

  // Hashes do preview: é ele que circula (print) e a marca d'água quase
  // não muda o hash perceptual.
  const { dhash, phash } = await imageHashes(derived.preview);

  const photo = new Photo({
    event: event._id,
    photographer: session.id,
    priceCents,
    fileName: file.name || "foto.jpg",
    width: derived.width,
    height: derived.height,
    faces,
    dhash,
    phash,
    originalKey: "",
    previewKey: "",
  });
  photo.originalKey = `originals/${photo._id}.jpg`;
  photo.previewKey = `previews/${photo._id}.jpg`;

  await saveFile(photo.originalKey, original, file.type || "image/jpeg");
  await saveFile(photo.previewKey, derived.preview, "image/jpeg");
  await photo.save();

  if (!event.cover) {
    event.cover = photo._id;
    await event.save();
  }

  return NextResponse.json({
    ok: true,
    id: photo._id.toString(),
    priceCents,
  });
}
