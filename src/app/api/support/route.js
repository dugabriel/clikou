import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";
import { emailEnabled, sendSupportTicketEmail } from "@/lib/email";

const CATEGORIES = ["Problema", "Sugestão", "Outro assunto"];

// Abre um ticket de suporte: e-mail para a caixa do suporte com o usuário em
// cópia; a conversa segue por e-mail. Só logado — quem não tem conta não tem
// e-mail confirmado pra receber a resposta.
export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const { category, message, page } = await req.json().catch(() => ({}));
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Escolha uma categoria." }, { status: 400 });
  }
  const body = String(message || "").trim();
  if (body.length < 10) {
    return NextResponse.json(
      { error: "Conte um pouco mais — mínimo de 10 caracteres." },
      { status: 400 }
    );
  }
  if (body.length > 3000) {
    return NextResponse.json(
      { error: "Mensagem muito longa (máx. 3000 caracteres)." },
      { status: 400 }
    );
  }

  await dbConnect();
  const hit = await rateLimit("support-user", session.id, {
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });
  if (!hit.ok) {
    return NextResponse.json(
      { error: "Você já abriu vários tickets há pouco. Aguarde um momento." },
      { status: 429 }
    );
  }

  const user = await User.findById(session.id).select("name email").lean();
  if (!user) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  if (!emailEnabled) return NextResponse.json({ ok: true, disabled: true });

  const sent = await sendSupportTicketEmail({
    user,
    category,
    message: body,
    page: typeof page === "string" ? page.slice(0, 200) : "",
  });
  if (!sent) {
    return NextResponse.json(
      { error: "Não conseguimos enviar agora. Tente de novo em instantes." },
      { status: 502 }
    );
  }
  return NextResponse.json({ ok: true });
}
