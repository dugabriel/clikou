import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST(req) {
  await destroySession();
  // No Cloud Run, req.url tem origem interna (0.0.0.0) — usa APP_URL.
  const appUrl = process.env.APP_URL || new URL(req.url).origin;
  return NextResponse.redirect(new URL("/", appUrl), 303);
}
