import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Gallery from "@/models/Gallery";
import GalleryPhoto from "@/models/GalleryPhoto";
import { getSession } from "@/lib/auth";
import { deleteFile, readFile } from "@/lib/storage";

// Preview de uma foto para o próprio fotógrafo gerenciar (ele não passa pelo
// portão de PIN da página do cliente).
export async function GET(req, ctx) {
  const session = await getSession();
  if (!session) return new NextResponse("Faça login", { status: 401 });

  const { id, pid } = await ctx.params;
  await dbConnect();
  const gallery = await Gallery.findById(id).select("photographer");
  if (!gallery || gallery.photographer.toString() !== session.id) {
    return new NextResponse("Não encontrada", { status: 404 });
  }
  const photo = await GalleryPhoto.findOne({ _id: pid, gallery: id }).select(
    "previewKey"
  );
  if (!photo) return new NextResponse("Não encontrada", { status: 404 });

  const buf = await readFile(photo.previewKey);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, max-age=3600",
    },
  });
}

// Remove uma foto da galeria (só o dono).
export async function DELETE(req, ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const { id, pid } = await ctx.params;
  await dbConnect();
  const gallery = await Gallery.findById(id);
  if (!gallery || gallery.photographer.toString() !== session.id) {
    return NextResponse.json(
      { error: "Galeria não encontrada." },
      { status: 404 }
    );
  }

  const photo = await GalleryPhoto.findOne({ _id: pid, gallery: id });
  if (!photo) {
    return NextResponse.json({ error: "Foto não encontrada." }, { status: 404 });
  }

  await Promise.all([
    deleteFile(photo.originalKey),
    deleteFile(photo.previewKey),
  ]);
  await photo.deleteOne();

  // Se era a capa, elege outra (a mais recente) ou nada.
  if (gallery.cover && gallery.cover.toString() === pid) {
    const next = await GalleryPhoto.findOne({ gallery: id }).sort({
      createdAt: -1,
    });
    gallery.cover = next ? next._id : undefined;
    await gallery.save();
  }

  return NextResponse.json({ ok: true });
}
