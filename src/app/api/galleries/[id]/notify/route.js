import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import Gallery from "@/models/Gallery";
import { getSession } from "@/lib/auth";
import { emailEnabled, sendGalleryReadyEmail } from "@/lib/email";

// Envia (ou reenvia) o link da galeria por e-mail para o cliente.
export async function POST(req, ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Galeria não encontrada." }, { status: 404 });
  }

  const { email } = await req.json().catch(() => ({}));
  const clientEmail = (email || "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clientEmail)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  await dbConnect();
  const gallery = await Gallery.findById(id);
  if (!gallery || gallery.photographer.toString() !== session.id) {
    return NextResponse.json({ error: "Galeria não encontrada." }, { status: 404 });
  }

  // Guarda o e-mail do cliente para reenvios futuros.
  gallery.clientEmail = clientEmail;

  if (!emailEnabled) {
    await gallery.save();
    return NextResponse.json({ ok: true, disabled: true });
  }

  const appUrl = process.env.APP_URL || new URL(req.url).origin;
  const emailSent = await sendGalleryReadyEmail({
    to: clientEmail,
    clientName: gallery.clientName,
    photographerName: session.name,
    galleryTitle: gallery.title,
    link: `${appUrl}/g/${gallery.slug}`,
    pin: gallery.pin,
  });

  if (emailSent) gallery.notifiedAt = new Date();
  await gallery.save();

  return NextResponse.json({ ok: true, emailSent });
}
