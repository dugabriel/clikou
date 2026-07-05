import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Photo from "@/models/Photo";
import { readFile } from "@/lib/storage";

// Preview público com marca d'água.
export async function GET(req, ctx) {
  const { id } = await ctx.params;
  await dbConnect();
  const photo = await Photo.findById(id).select("previewKey");
  if (!photo) return new NextResponse("Não encontrada", { status: 404 });

  const buf = await readFile(photo.previewKey);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
