import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import Client from "@/models/Client";
import Gallery from "@/models/Gallery";
import { getSession } from "@/lib/auth";
import { sanitizeClientInput, findDuplicateClient } from "@/lib/clients";

async function ownedClient(id, session) {
  if (!mongoose.isValidObjectId(id)) return null;
  await dbConnect();
  const client = await Client.findById(id);
  if (!client || client.photographer.toString() !== session.id) return null;
  return client;
}

// Atualiza o cadastro do cliente. Renomear propaga o novo nome para o
// clientName denormalizado das galerias vinculadas; e-mail não propaga
// (o da galeria é override por entrega, via notify).
export async function PATCH(req, ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const client = await ownedClient(id, session);
  if (!client) {
    return NextResponse.json(
      { error: "Cliente não encontrado." },
      { status: 404 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { fields, error } = sanitizeClientInput(body, { partial: true });
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  if (fields.name && fields.name !== client.name) {
    if (await findDuplicateClient(session.id, fields.name, client._id)) {
      return NextResponse.json(
        { error: "Você já tem um cliente com esse nome." },
        { status: 409 }
      );
    }
  }

  const renamed = "name" in fields && fields.name !== client.name;
  Object.assign(client, fields);
  await client.save();

  if (renamed) {
    await Gallery.updateMany(
      { photographer: session.id, client: client._id },
      { clientName: client.name }
    );
  }

  return NextResponse.json({ ok: true });
}

// Exclui o cliente. As galerias vinculadas só perdem o vínculo — o nome e o
// e-mail denormalizados ficam, então nada muda na entrega já feita.
export async function DELETE(req, ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const client = await ownedClient(id, session);
  if (!client) {
    return NextResponse.json(
      { error: "Cliente não encontrado." },
      { status: 404 }
    );
  }

  await Gallery.updateMany(
    { photographer: session.id, client: client._id },
    { $unset: { client: 1 } }
  );
  await client.deleteOne();

  return NextResponse.json({ ok: true });
}
