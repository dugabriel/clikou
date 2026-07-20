import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Client from "@/models/Client";
import { getSession } from "@/lib/auth";
import { canUseClients } from "@/lib/plan";
import { sanitizeClientInput, findDuplicateClient } from "@/lib/clients";

// Cadastra um cliente do fotógrafo (mini-CRM).
export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }
  if (!canUseClients()) {
    return NextResponse.json(
      {
        error: "O cadastro de clientes é um recurso do plano Pro.",
        upgrade: true,
      },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { fields, error } = sanitizeClientInput(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  await dbConnect();
  if (await findDuplicateClient(session.id, fields.name)) {
    return NextResponse.json(
      { error: "Você já tem um cliente com esse nome." },
      { status: 409 }
    );
  }

  const client = await Client.create({ ...fields, photographer: session.id });
  return NextResponse.json({ ok: true, id: client._id.toString() });
}
