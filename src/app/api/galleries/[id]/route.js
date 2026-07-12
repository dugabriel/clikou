import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import Gallery from "@/models/Gallery";
import GalleryPhoto from "@/models/GalleryPhoto";
import { getSession } from "@/lib/auth";
import { deleteFile } from "@/lib/storage";

async function ownedGallery(id, session) {
  if (!mongoose.isValidObjectId(id)) return null;
  await dbConnect();
  const gallery = await Gallery.findById(id);
  if (!gallery || gallery.photographer.toString() !== session.id) return null;
  return gallery;
}

// Atualiza as configurações da galeria (nome, cliente, PIN, expiração,
// download, favoritos, marca d'água).
export async function PATCH(req, ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const gallery = await ownedGallery(id, session);
  if (!gallery) {
    return NextResponse.json(
      { error: "Galeria não encontrada." },
      { status: 404 }
    );
  }

  const body = await req.json().catch(() => ({}));
  if (typeof body.title === "string" && body.title.trim()) {
    gallery.title = body.title.trim();
  }
  if (typeof body.clientName === "string") {
    gallery.clientName = body.clientName.trim();
  }
  if (typeof body.pin === "string") {
    // Só dígitos, no máximo 8 — vazio remove o PIN.
    gallery.pin = body.pin.replace(/\D/g, "").slice(0, 8);
  }
  if ("expiresAt" in body) {
    gallery.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  }
  if (typeof body.downloadEnabled === "boolean") {
    gallery.downloadEnabled = body.downloadEnabled;
  }
  if (typeof body.allowFavorites === "boolean") {
    gallery.allowFavorites = body.allowFavorites;
  }
  if (typeof body.watermarkPreviews === "boolean") {
    gallery.watermarkPreviews = body.watermarkPreviews;
  }
  if (typeof body.faceSearch === "boolean") {
    gallery.faceSearch = body.faceSearch;
  }

  await gallery.save();
  return NextResponse.json({ ok: true });
}

// Apaga a galeria, suas fotos e os arquivos no storage.
export async function DELETE(req, ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const gallery = await ownedGallery(id, session);
  if (!gallery) {
    return NextResponse.json(
      { error: "Galeria não encontrada." },
      { status: 404 }
    );
  }

  const photos = await GalleryPhoto.find({ gallery: id }).select(
    "originalKey previewKey"
  );
  await Promise.all(
    photos.flatMap((p) => [
      deleteFile(p.originalKey),
      deleteFile(p.previewKey),
    ])
  );
  // ZIP pré-gerado da galeria (o lifecycle do bucket é só rede de segurança).
  if (gallery.zipKey) await deleteFile(gallery.zipKey);
  await GalleryPhoto.deleteMany({ gallery: id });
  await gallery.deleteOne();

  return NextResponse.json({ ok: true });
}
