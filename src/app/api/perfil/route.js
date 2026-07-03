import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Usuario from "@/models/Usuario";
import { obterSessao } from "@/lib/auth";
import { contemPalavraProibida } from "@/lib/moderacao";

const SLUG_VALIDO = /^[a-z0-9][a-z0-9._-]{2,29}$/;

export async function PUT(req) {
  const sessao = await obterSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Faça login." }, { status: 401 });
  }

  let { usuario, sobre, cidade, website, instagram, whatsapp } =
    await req.json();

  usuario = (usuario || "").trim().toLowerCase();
  if (usuario && !SLUG_VALIDO.test(usuario)) {
    return NextResponse.json(
      {
        erro: "Nome de usuário inválido: use 3–30 caracteres (letras minúsculas, números, ponto, hífen ou _).",
      },
      { status: 400 }
    );
  }

  sobre = (sobre || "").slice(0, 600);
  cidade = (cidade || "").slice(0, 80);
  if (contemPalavraProibida(usuario, sobre, cidade)) {
    return NextResponse.json(
      { erro: "O perfil contém palavras não permitidas." },
      { status: 400 }
    );
  }

  website = (website || "").trim();
  if (website && !/^https?:\/\//.test(website)) website = `https://${website}`;
  instagram = (instagram || "").trim().replace(/^@/, "");
  whatsapp = (whatsapp || "").replace(/\D/g, "");

  await dbConnect();
  if (usuario) {
    const emUso = await Usuario.findOne({
      usuario,
      _id: { $ne: sessao.id },
    }).select("_id");
    if (emUso) {
      return NextResponse.json(
        { erro: `O nome de usuário "${usuario}" já está em uso.` },
        { status: 409 }
      );
    }
  }

  await Usuario.updateOne(
    { _id: sessao.id },
    {
      ...(usuario ? { usuario } : { $unset: { usuario: "" } }),
      sobre,
      cidade,
      website,
      instagram,
      whatsapp,
    }
  );

  return NextResponse.json({ ok: true, usuario });
}
