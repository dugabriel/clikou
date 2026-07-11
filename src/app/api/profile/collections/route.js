import { NextResponse } from "next/server";
import crypto from "crypto";
import sharp from "sharp";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import { saveFile, deleteFile } from "@/lib/storage";
import { isImageInappropriate, containsForbiddenWord } from "@/lib/moderation";
import { planLimits } from "@/lib/plan";
import { normalizeImage } from "@/lib/heic";

async function loadUser(session) {
  return User.findById(session.id).select(
    "collections plan planCurrentPeriodEnd"
  );
}

// Coleção onde a foto vai entrar: a informada, ou a primeira (grátis usa
// uma coleção única); cria a padrão se ainda não existe nenhuma.
function targetCollection(user, collectionId) {
  if (collectionId) {
    return user.collections.id(collectionId) || null;
  }
  if (user.collections.length === 0) {
    user.collections.push({ name: "", photos: [] });
  }
  return user.collections[0];
}

// POST (multipart): sobe uma foto para uma coleção.
export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  await dbConnect();
  const user = await loadUser(session);
  const limits = planLimits(user);

  const form = await req.formData();
  const file = form.get("file");
  const collectionId = form.get("collectionId") || null;
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Envie um arquivo." }, { status: 400 });
  }

  const collection = targetCollection(user, collectionId);
  if (!collection) {
    return NextResponse.json({ error: "Coleção não encontrada." }, { status: 404 });
  }
  if (collection.photos.length >= limits.photosPerCollection) {
    return NextResponse.json(
      { error: `Máximo de ${limits.photosPerCollection} fotos nesta coleção.` },
      { status: 400 }
    );
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
  collection.photos.push(key);
  await user.save();

  return NextResponse.json({
    ok: true,
    key,
    collectionId: collection._id.toString(),
  });
}

// PUT (JSON): cria ou renomeia coleção. Nomear exige Pro.
export async function PUT(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const { action, collectionId, name } = await req.json();
  await dbConnect();
  const user = await loadUser(session);
  const limits = planLimits(user);

  const cleanName = String(name || "").trim().slice(0, 40);
  if (cleanName && containsForbiddenWord(cleanName)) {
    return NextResponse.json(
      { error: "Nome da coleção contém palavras não permitidas." },
      { status: 400 }
    );
  }

  if (action === "create") {
    if (!limits.namedCollections) {
      return NextResponse.json(
        { error: "Assine o Pro para criar coleções." },
        { status: 403 }
      );
    }
    if (user.collections.length >= limits.collections) {
      return NextResponse.json(
        { error: `Máximo de ${limits.collections} coleções.` },
        { status: 400 }
      );
    }
    user.collections.push({ name: cleanName || "Nova coleção", photos: [] });
    await user.save();
    const created = user.collections[user.collections.length - 1];
    return NextResponse.json({ ok: true, collectionId: created._id.toString() });
  }

  if (action === "rename") {
    if (!limits.namedCollections) {
      return NextResponse.json(
        { error: "Assine o Pro para nomear coleções." },
        { status: 403 }
      );
    }
    const collection = user.collections.id(collectionId);
    if (!collection) {
      return NextResponse.json({ error: "Coleção não encontrada." }, { status: 404 });
    }
    collection.name = cleanName;
    await user.save();
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
}

// DELETE (JSON): remove uma foto ({collectionId, key}) ou a coleção inteira
// ({collectionId}), apagando os arquivos do storage.
export async function DELETE(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const { collectionId, key } = await req.json();
  await dbConnect();
  const user = await loadUser(session);

  const collection = user.collections.id(collectionId);
  if (!collection) {
    return NextResponse.json({ error: "Coleção não encontrada." }, { status: 404 });
  }

  if (key) {
    if (collection.photos.includes(key)) {
      collection.photos = collection.photos.filter((k) => k !== key);
      await user.save();
      await deleteFile(key).catch(() => {});
    }
    return NextResponse.json({ ok: true });
  }

  const photos = [...collection.photos];
  collection.deleteOne();
  await user.save();
  await Promise.all(photos.map((k) => deleteFile(k).catch(() => {})));
  return NextResponse.json({ ok: true });
}
