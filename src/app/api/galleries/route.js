import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Gallery from "@/models/Gallery";
import { getSession } from "@/lib/auth";
import { planLimits } from "@/lib/plan";

// Cria uma galeria de entrega. Grátis pode ter 1; Pro, ilimitado.
export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { title, clientName } = body;
  if (!title || !title.trim()) {
    return NextResponse.json(
      { error: "Dê um nome para a galeria." },
      { status: 400 }
    );
  }

  await dbConnect();
  const user = await User.findById(session.id).lean();
  const limit = planLimits(user).galleries;
  const count = await Gallery.countDocuments({ photographer: session.id });
  if (count >= limit) {
    return NextResponse.json(
      {
        error:
          "No plano grátis você pode ter 1 galeria de entrega. Assine o Pro para criar quantas quiser.",
        upgrade: true,
      },
      { status: 403 }
    );
  }

  // Opções da galeria vêm junto na criação (o fluxo pede antes do upload),
  // com a mesma sanitização do PATCH.
  const gallery = await Gallery.create({
    photographer: session.id,
    title: title.trim(),
    clientName: (clientName || "").trim(),
    pin:
      typeof body.pin === "string"
        ? body.pin.replace(/\D/g, "").slice(0, 8)
        : "",
    expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    downloadEnabled:
      typeof body.downloadEnabled === "boolean" ? body.downloadEnabled : true,
    allowFavorites:
      typeof body.allowFavorites === "boolean" ? body.allowFavorites : true,
    watermarkPreviews: body.watermarkPreviews === true,
    faceSearch:
      typeof body.faceSearch === "boolean" ? body.faceSearch : true,
  });

  return NextResponse.json({ ok: true, id: gallery._id.toString() });
}
