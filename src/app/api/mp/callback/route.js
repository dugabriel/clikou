import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { readMpStateToken } from "@/lib/auth";
import { splitEnabled, oauth } from "@/lib/mp";

// Volta do OAuth do Mercado Pago: troca o code pelos tokens do fotógrafo.
export async function GET(req) {
  const appUrl = process.env.APP_URL || new URL(req.url).origin;
  const back = (result) =>
    NextResponse.redirect(`${appUrl}/dashboard/withdrawal?mp=${result}`);

  if (!splitEnabled) return back("error");

  const params = new URL(req.url).searchParams;
  const userId = await readMpStateToken(params.get("state") || "");
  const code = params.get("code");
  if (!userId || !code) return back("denied");

  try {
    const t = await oauth().create({
      body: {
        client_id: process.env.MP_CLIENT_ID,
        client_secret: process.env.MP_CLIENT_SECRET,
        code,
        redirect_uri: `${appUrl}/api/mp/callback`,
      },
    });

    await dbConnect();
    await User.updateOne(
      { _id: userId },
      {
        mpUserId: String(t.user_id),
        mpAccessToken: t.access_token,
        mpRefreshToken: t.refresh_token,
        mpTokenExpiresAt: new Date(Date.now() + t.expires_in * 1000),
      }
    );
    return back("connected");
  } catch (e) {
    console.error("MP OAuth callback:", e.message);
    return back("error");
  }
}
