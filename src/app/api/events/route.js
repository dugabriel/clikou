import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Event from "@/models/Event";
import { getSession } from "@/lib/auth";
import { toCents } from "@/lib/currency";
import { CATEGORY_VALUES } from "@/lib/categories";

export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login para criar um evento." }, { status: 401 });
  }

  const { title, description, date, city, state, category, defaultPrice } =
    await req.json();
  if (!title) {
    return NextResponse.json({ error: "Informe o título." }, { status: 400 });
  }

  const STATES = new Set([
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
    "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
    "SP", "SE", "TO",
  ]);
  if (!STATES.has(state) || !city?.trim()) {
    return NextResponse.json(
      { error: "Selecione o estado e a cidade do evento." },
      { status: 400 }
    );
  }

  const { containsForbiddenWord } = await import("@/lib/moderation");
  if (containsForbiddenWord(title, description, city)) {
    return NextResponse.json(
      { error: "O texto do evento contém palavras não permitidas." },
      { status: 400 }
    );
  }
  const defaultPriceCents = toCents(defaultPrice ?? "10,00");
  if (defaultPriceCents === null || defaultPriceCents < 100) {
    return NextResponse.json(
      { error: "Preço mínimo por foto: R$ 1,00." },
      { status: 400 }
    );
  }

  await dbConnect();
  const event = await Event.create({
    title,
    description: description || "",
    date: date ? new Date(date) : undefined,
    city: city.trim(),
    state,
    category: CATEGORY_VALUES.includes(category) ? category : "others",
    photographer: session.id,
    defaultPriceCents,
  });

  return NextResponse.json({ ok: true, id: event._id.toString() });
}
