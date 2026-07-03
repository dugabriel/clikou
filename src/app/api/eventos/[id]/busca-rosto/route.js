import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Foto from "@/models/Foto";

// Distância euclidiana máxima para considerar "a mesma pessoa"
const LIMIAR = 0.55;

function distancia(a, b) {
  let soma = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    soma += d * d;
  }
  return Math.sqrt(soma);
}

// Busca restrita às fotos DESTE evento.
export async function POST(req, ctx) {
  const { id } = await ctx.params;
  const { descritor } = await req.json();

  if (
    !Array.isArray(descritor) ||
    descritor.length !== 128 ||
    descritor.some((n) => typeof n !== "number")
  ) {
    return NextResponse.json({ erro: "Descritor inválido." }, { status: 400 });
  }

  await dbConnect();
  const fotos = await Foto.find({ evento: id, "rostos.0": { $exists: true } })
    .select("rostos")
    .lean();

  const fotoIds = [];
  for (const foto of fotos) {
    for (const rosto of foto.rostos) {
      if (distancia(descritor, rosto) <= LIMIAR) {
        fotoIds.push(foto._id.toString());
        break;
      }
    }
  }

  return NextResponse.json({ fotoIds });
}
