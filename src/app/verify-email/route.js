import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { createSession, readVerificationToken } from "@/lib/auth";

// Destino do link enviado por e-mail: confirma a conta e já entra.
export async function GET(req) {
  const url = new URL(req.url);
  const appUrl = process.env.APP_URL || url.origin;

  const id = await readVerificationToken(url.searchParams.get("token") || "");
  if (!id) {
    return NextResponse.redirect(new URL("/login?error=verification", appUrl));
  }

  await dbConnect();
  const user = await User.findByIdAndUpdate(
    id,
    { emailVerified: true },
    { new: true }
  );
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=verification", appUrl));
  }

  await createSession(user);
  return NextResponse.redirect(new URL("/events", appUrl));
}
