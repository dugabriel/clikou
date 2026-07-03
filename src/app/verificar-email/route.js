import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Usuario from "@/models/Usuario";
import { criarSessao, lerTokenVerificacao } from "@/lib/auth";

// Destino do link enviado por e-mail: confirma a conta e já entra.
export async function GET(req) {
  const url = new URL(req.url);
  const appUrl = process.env.APP_URL || url.origin;

  const id = await lerTokenVerificacao(url.searchParams.get("token") || "");
  if (!id) {
    return NextResponse.redirect(new URL("/login?erro=verificacao", appUrl));
  }

  await dbConnect();
  const usuario = await Usuario.findByIdAndUpdate(
    id,
    { emailVerificado: true },
    { new: true }
  );
  if (!usuario) {
    return NextResponse.redirect(new URL("/login?erro=verificacao", appUrl));
  }

  await criarSessao(usuario);
  return NextResponse.redirect(new URL("/eventos", appUrl));
}
