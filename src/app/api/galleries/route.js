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

  const { title, clientName } = await req.json().catch(() => ({}));
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

  const gallery = await Gallery.create({
    photographer: session.id,
    title: title.trim(),
    clientName: (clientName || "").trim(),
  });

  return NextResponse.json({ ok: true, id: gallery._id.toString() });
}
