import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Event from "@/models/Event";
import Photo from "@/models/Photo";
import Order from "@/models/Order";
import { getSession } from "@/lib/auth";
import { deleteFile } from "@/lib/storage";

// Remove uma foto do evento (só o dono). Foto já vendida não pode ser
// excluída: o comprador baixa o original pelo registro dela — apagar
// quebraria a compra.
export async function DELETE(req, ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const { id, pid } = await ctx.params;
  await dbConnect();
  const event = await Event.findById(id);
  if (!event || event.photographer.toString() !== session.id) {
    return NextResponse.json(
      { error: "Evento não encontrado." },
      { status: 404 }
    );
  }

  const photo = await Photo.findOne({ _id: pid, event: id });
  if (!photo) {
    return NextResponse.json({ error: "Foto não encontrada." }, { status: 404 });
  }

  const sold = await Order.exists({ status: "paid", "items.photo": photo._id });
  if (sold) {
    return NextResponse.json(
      {
        error:
          "Esta foto já foi vendida e o comprador baixa por ela — não dá para excluir.",
      },
      { status: 409 }
    );
  }

  await Promise.all([
    deleteFile(photo.originalKey),
    deleteFile(photo.previewKey),
  ]);
  await photo.deleteOne();

  // Se era a capa, elege outra (a mais recente) ou nada.
  if (event.cover && event.cover.toString() === pid) {
    const next = await Photo.findOne({ event: id }).sort({ createdAt: -1 });
    event.cover = next ? next._id : undefined;
    await event.save();
  }

  return NextResponse.json({ ok: true });
}
