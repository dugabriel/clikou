import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Gallery from "@/models/Gallery";
import { isExpired, grantGalleryAccess } from "@/lib/gallery";

// Desbloqueia uma galeria protegida por PIN: confere o PIN e grava o cookie.
export async function POST(req, ctx) {
  const { slug } = await ctx.params;
  const { pin } = await req.json().catch(() => ({}));

  await dbConnect();
  const gallery = await Gallery.findOne({ slug });
  if (!gallery || isExpired(gallery)) {
    return NextResponse.json(
      { error: "Galeria indisponível." },
      { status: 404 }
    );
  }

  if (!gallery.pin) {
    // Sem PIN não há o que desbloquear.
    return NextResponse.json({ ok: true });
  }

  if ((pin || "").trim() !== gallery.pin) {
    return NextResponse.json({ error: "PIN incorreto." }, { status: 403 });
  }

  await grantGalleryAccess(gallery);
  return NextResponse.json({ ok: true });
}
