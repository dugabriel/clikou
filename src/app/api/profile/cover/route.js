import { NextResponse } from "next/server";
import crypto from "crypto";
import sharp from "sharp";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import { saveFile, deleteFile } from "@/lib/storage";
import { isImageInappropriate } from "@/lib/moderation";
import { isPro } from "@/lib/plan";
import { normalizeImage } from "@/lib/heic";

// Imagem de capa da página pública — recurso Pro.
export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findById(session.id).select(
    "coverKey plan planCurrentPeriodEnd"
  );
  if (!isPro(user)) {
    return NextResponse.json(
      { error: "A capa é um recurso do plano Pro." },
      { status: 403 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Envie um arquivo." }, { status: 400 });
  }

  // HEIC do iPhone vira JPEG já na entrada.
  let original = Buffer.from(await file.arrayBuffer());
  try {
    original = (await normalizeImage(original)).buffer;
  } catch {
    return NextResponse.json(
      { error: "Arquivo não é uma imagem válida." },
      { status: 400 }
    );
  }
  const moderation = await isImageInappropriate(original);
  if (moderation.blocked) {
    return NextResponse.json(
      { error: `Imagem bloqueada pela moderação (${moderation.reason}).` },
      { status: 422 }
    );
  }

  let image;
  try {
    image = await sharp(original)
      .rotate()
      .resize({ width: 2000, height: 700, fit: "cover" })
      .jpeg({ quality: 82 })
      .toBuffer();
  } catch {
    return NextResponse.json(
      { error: "Arquivo não é uma imagem válida." },
      { status: 400 }
    );
  }

  const previous = user.coverKey;
  const key = `portfolio/${session.id}/cover-${crypto.randomUUID()}.jpg`;
  await saveFile(key, image, "image/jpeg");
  user.coverKey = key;
  await user.save();
  if (previous) await deleteFile(previous).catch(() => {});

  return NextResponse.json({ ok: true, key });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findById(session.id).select("coverKey");
  const previous = user.coverKey;
  if (previous) {
    user.coverKey = "";
    await user.save();
    await deleteFile(previous).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
