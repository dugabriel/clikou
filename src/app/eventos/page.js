import { dbConnect } from "@/lib/db";
import Evento from "@/models/Evento";
import "@/models/Foto";
import "@/models/Usuario";
import Link from "next/link";
import CardEvento from "@/components/CardEvento";
import { regexSemAcento, ufDeTexto } from "@/lib/busca";
import { CATEGORIAS, VALORES_CATEGORIA } from "@/lib/categorias";

export const dynamic = "force-dynamic";

export const metadata = { title: "Eventos — Clikou" };

export default async function Eventos({ searchParams }) {
  const { q, categoria } = await searchParams;
  await dbConnect();

  const filtro = { publicado: true };
  if (q) {
    // Busca por nome do evento, cidade ou estado (sigla ou por extenso),
    // ignorando acentos: "sao paulo" acha "São Paulo".
    const regex = regexSemAcento(q);
    filtro.$or = [{ titulo: regex }, { cidade: regex }];
    const uf = ufDeTexto(q);
    if (uf) filtro.$or.push({ estado: uf });
  }
  const categoriaAtiva = VALORES_CATEGORIA.includes(categoria) ? categoria : "";
  if (categoriaAtiva) {
    // Eventos antigos sem o campo contam como "outros".
    filtro.categoria =
      categoriaAtiva === "outros" ? { $in: ["outros", null] } : categoriaAtiva;
  }

  const eventos = await Evento.find(filtro)
    .sort({ createdAt: -1 })
    .limit(60)
    .populate("fotografo", "nome")
    .lean();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold tracking-tight">Eventos</h1>
        <form className="flex gap-2">
          {categoriaAtiva && (
            <input type="hidden" name="categoria" value={categoriaAtiva} />
          )}
          <input
            name="q"
            defaultValue={q || ""}
            placeholder="Buscar por evento, cidade ou estado…"
            className="w-72 rounded-full border border-white/10 bg-zinc-900/70 px-5 py-2.5 text-sm placeholder:text-zinc-600 outline-none transition focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/15"
          />
          <button className="rounded-full bg-zinc-800 px-5 py-2.5 text-sm font-medium transition hover:bg-zinc-700">
            Buscar
          </button>
        </form>
      </div>

      <div className="mb-8 flex max-w-full gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[{ valor: "", rotulo: "Todos" }, ...CATEGORIAS].map((c) => {
          const ativa = categoriaAtiva === c.valor;
          const params = new URLSearchParams();
          if (q) params.set("q", q);
          if (c.valor) params.set("categoria", c.valor);
          const query = params.toString();
          return (
            <Link
              key={c.valor || "todos"}
              href={query ? `/eventos?${query}` : "/eventos"}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition ${
                ativa
                  ? "border-yellow-400 bg-yellow-400 font-semibold text-zinc-950"
                  : "border-white/10 bg-zinc-900/70 font-medium text-zinc-400 hover:border-yellow-400/40 hover:text-white"
              }`}
            >
              {c.rotulo}
            </Link>
          );
        })}
      </div>

      {eventos.length === 0 ? (
        <p className="py-20 text-center text-zinc-500">
          Nenhum evento encontrado.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {eventos.map((e) => (
            <CardEvento key={e._id.toString()} evento={e} />
          ))}
        </div>
      )}
    </div>
  );
}
