import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getSession, isAdmin } from "@/lib/auth";

export async function PATCH(req, { params }) {
  const session = await getSession();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }

  const { id } = await params;
  const { commissionPercent } = await req.json();

  // Vazio/null volta a usar a taxa padrão da plataforma.
  let rate = null;
  if (commissionPercent !== null && commissionPercent !== "") {
    rate = Number(String(commissionPercent).replace(",", "."));
    if (Number.isNaN(rate) || rate < 0 || rate > 100) {
      return NextResponse.json(
        { error: "Taxa deve ser um número entre 0 e 100." },
        { status: 400 }
      );
    }
  }

  await dbConnect();
  const user = await User.findByIdAndUpdate(
    id,
    { commissionPercent: rate },
    { new: true }
  ).select("commissionPercent");
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, commissionPercent: user.commissionPercent });
}
