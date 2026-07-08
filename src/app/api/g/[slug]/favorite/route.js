import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Gallery from "@/models/Gallery";
import GalleryPhoto from "@/models/GalleryPhoto";
import { isExpired, hasGalleryAccess } from "@/lib/gallery";

// O cliente marca/desmarca uma foto como favorita.
export async function POST(req, ctx) {
  const { slug } = await ctx.params;
  const { photoId, favorited } = await req.json().catch(() => ({}));

  await dbConnect();
  const gallery = await Gallery.findOne({ slug });
  if (!gallery || isExpired(gallery)) {
    return NextResponse.json(
      { error: "Galeria indisponível." },
      { status: 404 }
    );
  }
  if (!gallery.allowFavorites) {
    return NextResponse.json(
      { error: "Favoritos desativados nesta galeria." },
      { status: 403 }
    );
  }
  if (!(await hasGalleryAccess(gallery))) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const res = await GalleryPhoto.updateOne(
    { _id: photoId, gallery: gallery._id },
    { $set: { favorited: !!favorited } }
  );
  if (res.matchedCount === 0) {
    return NextResponse.json({ error: "Foto não encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, favorited: !!favorited });
}
