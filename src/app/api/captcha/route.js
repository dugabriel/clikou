import { NextResponse } from "next/server";
import { gerarDesafio } from "@/lib/captcha";

export async function GET() {
  return NextResponse.json(await gerarDesafio());
}
