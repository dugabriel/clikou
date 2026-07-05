import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Photo from "@/models/Photo";

// Distância euclidiana máxima para considerar "a mesma pessoa"
const THRESHOLD = 0.55;

function distance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

// Busca restrita às fotos DESTE evento.
export async function POST(req, ctx) {
  const { id } = await ctx.params;
  const { descriptor } = await req.json();

  if (
    !Array.isArray(descriptor) ||
    descriptor.length !== 128 ||
    descriptor.some((n) => typeof n !== "number")
  ) {
    return NextResponse.json({ error: "Descritor inválido." }, { status: 400 });
  }

  await dbConnect();
  const photos = await Photo.find({ event: id, "faces.0": { $exists: true } })
    .select("faces")
    .lean();

  const photoIds = [];
  for (const photo of photos) {
    for (const face of photo.faces) {
      if (distance(descriptor, face) <= THRESHOLD) {
        photoIds.push(photo._id.toString());
        break;
      }
    }
  }

  return NextResponse.json({ photoIds });
}
