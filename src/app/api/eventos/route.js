import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Evento from "@/models/Evento";
import { obterSessao } from "@/lib/auth";
import { paraCentavos } from "@/lib/moeda";
import { VALORES_CATEGORIA } from "@/lib/categorias";

export async function POST(req) {
  const sessao = await obterSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Faça login para criar um evento." }, { status: 401 });
  }

  const { titulo, descricao, data, cidade, estado, categoria, precoPadrao } =
    await req.json();
  if (!titulo) {
    return NextResponse.json({ erro: "Informe o título." }, { status: 400 });
  }

  const UFS = new Set([
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
    "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
    "SP", "SE", "TO",
  ]);
  if (!UFS.has(estado) || !cidade?.trim()) {
    return NextResponse.json(
      { erro: "Selecione o estado e a cidade do evento." },
      { status: 400 }
    );
  }

  const { contemPalavraProibida } = await import("@/lib/moderacao");
  if (contemPalavraProibida(titulo, descricao, cidade)) {
    return NextResponse.json(
      { erro: "O texto do evento contém palavras não permitidas." },
      { status: 400 }
    );
  }
  const precoPadraoCentavos = paraCentavos(precoPadrao ?? "10,00");
  if (precoPadraoCentavos === null || precoPadraoCentavos < 100) {
    return NextResponse.json(
      { erro: "Preço mínimo por foto: R$ 1,00." },
      { status: 400 }
    );
  }

  await dbConnect();
  const evento = await Evento.create({
    titulo,
    descricao: descricao || "",
    data: data ? new Date(data) : undefined,
    cidade: cidade.trim(),
    estado,
    categoria: VALORES_CATEGORIA.includes(categoria) ? categoria : "outros",
    fotografo: sessao.id,
    precoPadraoCentavos,
  });

  return NextResponse.json({ ok: true, id: evento._id.toString() });
}
