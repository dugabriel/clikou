import { NextResponse } from "next/server";
import crypto from "crypto";
import sharp from "sharp";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import { saveFile, deleteFile } from "@/lib/storage";
import { isImageInappropriate } from "@/lib/moderation";

const MAX_PHOTOS = 8;

export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findById(session.id).select("portfolio");
  if (user.portfolio.length >= MAX_PHOTOS) {
    return NextResponse.json(
      { error: `Máximo de ${MAX_PHOTOS} fotos no portfólio.` },
      { status: 400 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Envie um arquivo." }, { status: 400 });
  }

  const original = Buffer.from(await file.arrayBuffer());
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
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer();
  } catch {
    return NextResponse.json(
      { error: "Arquivo não é uma imagem válida." },
      { status: 400 }
    );
  }

  const key = `portfolio/${session.id}/${crypto.randomUUID()}.jpg`;
  await saveFile(key, image, "image/jpeg");
  await User.updateOne({ _id: session.id }, { $push: { portfolio: key } });

  return NextResponse.json({ ok: true, key });
}

export async function DELETE(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const { key } = await req.json();
  await dbConnect();
  const result = await User.updateOne(
    { _id: session.id, portfolio: key },
    { $pull: { portfolio: key } }
  );
  if (result.modifiedCount > 0) await deleteFile(key);

  return NextResponse.json({ ok: true });
}
