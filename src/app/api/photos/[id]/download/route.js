import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Photo from "@/models/Photo";
import { getSession } from "@/lib/auth";
import { hasPurchased } from "@/lib/orders";
import { readFile, signedDownloadUrl } from "@/lib/storage";

// Original sem marca d'água — só para quem comprou (ou o próprio fotógrafo).
export async function GET(req, ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { id } = await ctx.params;
  await dbConnect();
  const photo = await Photo.findById(id);
  if (!photo) return new NextResponse("Não encontrada", { status: 404 });

  const isOwner = photo.photographer.toString() === session.id;
  if (!isOwner && !(await hasPurchased(session.id, photo._id))) {
    return new NextResponse("Você ainda não comprou esta foto.", {
      status: 403,
    });
  }

  const name = photo.fileName || `clikou-${photo._id}.jpg`;
  const signed = await signedDownloadUrl(photo.originalKey, name);
  if (signed) return NextResponse.redirect(signed);

  // Modo local (sem GCS): serve o arquivo direto.
  const buf = await readFile(photo.originalKey);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}
