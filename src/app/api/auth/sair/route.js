import { NextResponse } from "next/server";
import { encerrarSessao } from "@/lib/auth";

export async function POST(req) {
  await encerrarSessao();
  return NextResponse.redirect(new URL("/", req.url));
}
