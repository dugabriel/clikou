import { dbConnect } from "@/lib/db";
import Event from "@/models/Event";
import "@/models/Photo";
import "@/models/User";
import Link from "next/link";
import EventCard from "@/components/EventCard";
import { accentInsensitiveRegex, stateFromText } from "@/lib/search";
import { CATEGORIES, CATEGORY_VALUES } from "@/lib/categories";

export const dynamic = "force-dynamic";

export const metadata = { title: "Eventos — Clikou" };

export default async function Events({ searchParams }) {
  const { q, category } = await searchParams;
  await dbConnect();

  const filter = { published: true };
  if (q) {
    // Busca por nome do evento, cidade ou estado (sigla ou por extenso),
    // ignorando acentos: "sao paulo" acha "São Paulo".
    const regex = accentInsensitiveRegex(q);
    filter.$or = [{ title: regex }, { city: regex }];
    const state = stateFromText(q);
    if (state) filter.$or.push({ state });
  }
  const activeCategory = CATEGORY_VALUES.includes(category) ? category : "";
  if (activeCategory) {
    filter.category = activeCategory;
  }

  const events = await Event.find(filter)
    .sort({ createdAt: -1 })
    .limit(60)
    .populate("photographer", "name")
    .lean();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold tracking-tight">Eventos</h1>
        <form className="flex gap-2">
          {activeCategory && (
            <input type="hidden" name="category" value={activeCategory} />
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
        {[{ value: "", label: "Todos" }, ...CATEGORIES].map((c) => {
          const active = activeCategory === c.value;
          const params = new URLSearchParams();
          if (q) params.set("q", q);
          if (c.value) params.set("category", c.value);
          const query = params.toString();
          return (
            <Link
              key={c.value || "all"}
              href={query ? `/events?${query}` : "/events"}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition ${
                active
                  ? "border-yellow-400 bg-yellow-400 font-semibold text-zinc-950"
                  : "border-white/10 bg-zinc-900/70 font-medium text-zinc-400 hover:border-yellow-400/40 hover:text-white"
              }`}
            >
              {c.label}
            </Link>
          );
        })}
      </div>

      {events.length === 0 ? (
        <p className="py-20 text-center text-zinc-500">
          Nenhum evento encontrado.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {events.map((e) => (
            <EventCard key={e._id.toString()} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
