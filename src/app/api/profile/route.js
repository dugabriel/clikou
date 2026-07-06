import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import { containsForbiddenWord } from "@/lib/moderation";
import { isValidCpf, isAdult } from "@/lib/seller";

const VALID_SLUG = /^[a-z0-9][a-z0-9._-]{2,29}$/;
const STATES = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
]);

export async function PUT(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  let { username, bio, city, website, instagram, whatsapp, seller } =
    await req.json();

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

  // Cadastro de vendedor (opcional aqui; obrigatório para vender).
  // Cada campo preenchido é validado; vazios ficam vazios.
  const sellerUpdate = {};
  if (seller) {
    const cpf = String(seller.cpf || "").replace(/\D/g, "");
    if (cpf && !isValidCpf(cpf)) {
      return NextResponse.json({ error: "CPF inválido." }, { status: 400 });
    }
    const birthDate = seller.birthDate ? new Date(seller.birthDate) : null;
    if (seller.birthDate && !isAdult(birthDate)) {
      return NextResponse.json(
        { error: "É preciso ter 18 anos ou mais para vender." },
        { status: 400 }
      );
    }
    const phone = String(seller.phone || "").replace(/\D/g, "");
    if (phone && (phone.length < 10 || phone.length > 11)) {
      return NextResponse.json({ error: "Telefone inválido (DDD + número)." }, { status: 400 });
    }
    const a = seller.address || {};
    const cep = String(a.cep || "").replace(/\D/g, "");
    if (cep && cep.length !== 8) {
      return NextResponse.json({ error: "CEP inválido." }, { status: 400 });
    }
    const state = String(a.state || "").trim().toUpperCase();
    if (state && !STATES.has(state)) {
      return NextResponse.json({ error: "UF do endereço inválida." }, { status: 400 });
    }
    sellerUpdate.cpf = cpf;
    sellerUpdate.birthDate = birthDate;
    sellerUpdate.phone = phone;
    sellerUpdate.address = {
      cep,
      street: String(a.street || "").slice(0, 120).trim(),
      number: String(a.number || "").slice(0, 20).trim(),
      complement: String(a.complement || "").slice(0, 60).trim(),
      district: String(a.district || "").slice(0, 80).trim(),
      city: String(a.city || "").slice(0, 80).trim(),
      state,
    };
  }

  await dbConnect();

  // Um CPF só pode pertencer a uma conta.
  if (sellerUpdate.cpf) {
    const cpfTaken = await User.findOne({
      cpf: sellerUpdate.cpf,
      _id: { $ne: session.id },
    }).select("_id");
    if (cpfTaken) {
      return NextResponse.json(
        { error: "Este CPF já está cadastrado em outra conta." },
        { status: 409 }
      );
    }
  }
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
      ...sellerUpdate,
    }
  );

  return NextResponse.json({ ok: true, username });
}
