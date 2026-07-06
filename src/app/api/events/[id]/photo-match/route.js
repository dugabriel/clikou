import { NextResponse } from "next/server";
import sharp from "sharp";
import { dbConnect } from "@/lib/db";
import Photo from "@/models/Photo";
import { readFile } from "@/lib/storage";
import { imageHashes, hamming } from "@/lib/imagehash";

const MAX_BYTES = 15 * 1024 * 1024;
// Soma das distâncias dHash+pHash (0–128) para considerar a mesma foto.
// Recompressão/redimensão/marca d'água ficam < 10; fotos diferentes ~64.
const THRESHOLD = 20;
// Descarta candidatos bem piores que o melhor: sobra a foto certa (e
// eventuais quase-duplicatas, como fotos em sequência).
const RUNNER_UP_MARGIN = 6;
const MAX_RESULTS = 5;

// O print pode vir com "moldura" (barra de status, chrome do WhatsApp,
// letterbox). Além da imagem inteira, tenta versões sem bordas uniformes
// e com um recorte central.
async function queryVariants(buffer) {
  const variants = [buffer];
  try {
    variants.push(await sharp(buffer).trim().toBuffer());
  } catch {}
  try {
    const { width, height } = await sharp(buffer).metadata();
    if (width > 40 && height > 40) {
      const dx = Math.round(width * 0.12);
      const dy = Math.round(height * 0.12);
      variants.push(
        await sharp(buffer)
          .extract({ left: dx, top: dy, width: width - 2 * dx, height: height - 2 * dy })
          .toBuffer()
      );
    }
  } catch {}
  return Promise.all(variants.map((v) => imageHashes(v)));
}

// Busca a foto do print entre as fotos DESTE evento.
export async function POST(req, ctx) {
  const { id } = await ctx.params;

  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string" || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Envie uma imagem de até 15 MB." }, { status: 400 });
  }

  let queries;
  try {
    queries = await queryVariants(Buffer.from(await file.arrayBuffer()));
  } catch {
    return NextResponse.json({ error: "Arquivo não é uma imagem válida." }, { status: 400 });
  }

  await dbConnect();
  const photos = await Photo.find({ event: id })
    .select("dhash phash previewKey")
    .lean();

  const scored = [];
  for (const photo of photos) {
    let { dhash, phash } = photo;

    // Foto anterior à feature: calcula e persiste o hash agora.
    if (!dhash || !phash) {
      try {
        const preview = await readFile(photo.previewKey);
        ({ dhash, phash } = await imageHashes(preview));
        await Photo.updateOne({ _id: photo._id }, { dhash, phash });
      } catch {
        continue; // preview inacessível — ignora esta foto
      }
    }

    let best = Infinity;
    for (const q of queries) {
      best = Math.min(best, hamming(q.dhash, dhash) + hamming(q.phash, phash));
    }
    if (best <= THRESHOLD) scored.push({ id: photo._id.toString(), score: best });
  }

  scored.sort((a, b) => a.score - b.score);
  const cutoff = scored.length ? scored[0].score + RUNNER_UP_MARGIN : 0;
  return NextResponse.json({
    photoIds: scored
      .filter((s) => s.score <= cutoff)
      .slice(0, MAX_RESULTS)
      .map((s) => s.id),
  });
}
