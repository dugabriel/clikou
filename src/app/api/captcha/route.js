import { NextResponse } from "next/server";
import { generateChallenge } from "@/lib/captcha";

export async function GET() {
  return NextResponse.json(await generateChallenge());
}
