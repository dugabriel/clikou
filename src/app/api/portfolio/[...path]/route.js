import { NextResponse } from "next/server";
import { readFile } from "@/lib/storage";

// Serve imagens do portfólio (chaves sempre sob "portfolio/").
export async function GET(req, ctx) {
  const { path } = await ctx.params;
  const key = `portfolio/${path.join("/")}`;
  if (key.includes("..")) {
    return new NextResponse("Inválido", { status: 400 });
  }

  try {
    const buf = await readFile(key);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse("Não encontrada", { status: 404 });
  }
}
