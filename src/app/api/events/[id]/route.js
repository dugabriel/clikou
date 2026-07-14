import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import Event from "@/models/Event";
import Photo from "@/models/Photo";
import { getSession } from "@/lib/auth";

// Define a foto de capa do evento (só o dono). A capa aparece no card da
// vitrine, no compartilhamento (OG) e como fundo do hero da página pública.
export async function PATCH(req, ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const { id } = await ctx.params;
  await dbConnect();
  const event = await Event.findById(id);
  if (!event || event.photographer.toString() !== session.id) {
    return NextResponse.json(
      { error: "Evento não encontrado." },
      { status: 404 }
    );
  }

  const { cover } = await req.json();
  if (!mongoose.isValidObjectId(cover)) {
    return NextResponse.json({ error: "Foto inválida." }, { status: 400 });
  }
  const photo = await Photo.exists({ _id: cover, event: id });
  if (!photo) {
    return NextResponse.json(
      { error: "A foto de capa precisa ser uma foto deste evento." },
      { status: 400 }
    );
  }

  event.cover = cover;
  await event.save();
  return NextResponse.json({ ok: true });
}
