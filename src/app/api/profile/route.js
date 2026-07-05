import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import { containsForbiddenWord } from "@/lib/moderation";

const VALID_SLUG = /^[a-z0-9][a-z0-9._-]{2,29}$/;

export async function PUT(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  let { username, bio, city, website, instagram, whatsapp } = await req.json();

  username = (username || "").trim().toLowerCase();
  if (username && !VALID_SLUG.test(username)) {
    return NextResponse.json(
      {
        error: "Nome de usuário inválido: use 3–30 caracteres (letras minúsculas, números, ponto, hífen ou _).",
      },
      { status: 400 }
    );
  }

  bio = (bio || "").slice(0, 600);
  city = (city || "").slice(0, 80);
  if (containsForbiddenWord(username, bio, city)) {
    return NextResponse.json(
      { error: "O perfil contém palavras não permitidas." },
      { status: 400 }
    );
  }

  website = (website || "").trim();
  if (website && !/^https?:\/\//.test(website)) website = `https://${website}`;
  instagram = (instagram || "").trim().replace(/^@/, "");
  whatsapp = (whatsapp || "").replace(/\D/g, "");

  await dbConnect();
  if (username) {
    const taken = await User.findOne({
      username,
      _id: { $ne: session.id },
    }).select("_id");
    if (taken) {
      return NextResponse.json(
        { error: `O nome de usuário "${username}" já está em uso.` },
        { status: 409 }
      );
    }
  }

  await User.updateOne(
    { _id: session.id },
    {
      ...(username ? { username } : { $unset: { username: "" } }),
      bio,
      city,
      website,
      instagram,
      whatsapp,
    }
  );

  return NextResponse.json({ ok: true, username });
}
