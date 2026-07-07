import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Lead from "@/models/Lead";
import { isPro } from "@/lib/plan";
import { containsForbiddenWord } from "@/lib/moderation";
import { emailEnabled, sendLeadEmail } from "@/lib/email";

// Recebe um pedido de orçamento do perfil público (recurso Pro).
export async function POST(req, ctx) {
  const { username } = await ctx.params;
  const { name, contact, message, website } = await req.json();

  // Honeypot: campo invisível que só robô preenche.
  if (website) return NextResponse.json({ ok: true });

  const cleanName = String(name || "").trim().slice(0, 80);
  const cleanContact = String(contact || "").trim().slice(0, 120);
  const cleanMessage = String(message || "").trim().slice(0, 1000);
  if (!cleanName || !cleanContact) {
    return NextResponse.json(
      { error: "Preencha seu nome e um contato." },
      { status: 400 }
    );
  }
  if (containsForbiddenWord(cleanName, cleanMessage)) {
    return NextResponse.json(
      { error: "Sua mensagem contém palavras não permitidas." },
      { status: 400 }
    );
  }

  await dbConnect();
  const photographer = await User.findOne({ username }).select(
    "name email plan planCurrentPeriodEnd"
  );
  if (!photographer || !isPro(photographer)) {
    return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });
  }

  const lead = await Lead.create({
    photographer: photographer._id,
    name: cleanName,
    contact: cleanContact,
    message: cleanMessage,
  });

  if (emailEnabled) {
    const appUrl = process.env.APP_URL || new URL(req.url).origin;
    try {
      await sendLeadEmail({
        to: photographer.email,
        name: photographer.name,
        lead,
        appUrl,
      });
    } catch (e) {
      console.error("E-mail de lead:", e.message);
    }
  }

  return NextResponse.json({ ok: true });
}
