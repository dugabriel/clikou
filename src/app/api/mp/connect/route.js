import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getSession, createMpStateToken } from "@/lib/auth";
import { splitEnabled, oauth } from "@/lib/mp";

// Manda o fotógrafo autorizar o clikou na conta Mercado Pago dele.
export async function GET(req) {
  const session = await getSession();
  const appUrl = process.env.APP_URL || new URL(req.url).origin;
  if (!session) {
    return NextResponse.redirect(new URL("/login", appUrl));
  }
  if (!splitEnabled) {
    return NextResponse.json(
      { error: "Split do Mercado Pago não configurado." },
      { status: 400 }
    );
  }

  const url = oauth().getAuthorizationURL({
    options: {
      client_id: process.env.MP_CLIENT_ID,
      state: await createMpStateToken(session.id),
      redirect_uri: `${appUrl}/api/mp/callback`,
    },
  });
  return NextResponse.redirect(url);
}

// Desconecta a conta: as próximas vendas voltam para a carteira.
export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  await dbConnect();
  await User.updateOne(
    { _id: session.id },
    {
      $unset: {
        mpUserId: 1,
        mpAccessToken: 1,
        mpRefreshToken: 1,
        mpTokenExpiresAt: 1,
      },
    }
  );
  return NextResponse.json({ ok: true });
}
