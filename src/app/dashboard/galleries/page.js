import Link from "next/link";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Client from "@/models/Client";
import Gallery from "@/models/Gallery";
import GalleryPhoto from "@/models/GalleryPhoto";
import { getSession } from "@/lib/auth";
import { isPro, planLimits } from "@/lib/plan";
import { accentInsensitiveRegex } from "@/lib/search";
import NewGalleryForm from "@/components/NewGalleryForm";
import { LockIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12; // grade de 3 colunas × 4 linhas

export default async function GalleriesPage({ searchParams }) {
  const session = await getSession();
  const { q, cliente, page: rawPage } = await searchParams;
  const requestedPage = Math.max(1, parseInt(rawPage, 10) || 1);

  await dbConnect();

  const myId = new mongoose.Types.ObjectId(session.id);
  const activeClient =
    cliente && mongoose.isValidObjectId(cliente) ? cliente : "";

  const filter = { photographer: myId };
  if (activeClient) filter.client = new mongoose.Types.ObjectId(activeClient);
  if (q) {
    const regex = accentInsensitiveRegex(q);
    filter.$or = [{ title: regex }, { clientName: regex }];
  }

  // Duas contagens de propósito: o limite do plano olha TODAS as galerias do
  // fotógrafo; a paginação, só as que passam no filtro.
  const [user, clients, totalMine, totalFiltered] = await Promise.all([
    User.findById(myId).select("plan planCurrentPeriodEnd").lean(),
    Client.find({ photographer: myId })
      .collation({ locale: "pt" })
      .sort({ name: 1 })
      .select("name")
      .lean(),
    Gallery.countDocuments({ photographer: myId }),
    Gallery.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const galleries = await Gallery.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean();

  // Contagem de fotos só das galerias desta página.
  const pageIds = galleries.map((g) => g._id);
  const counts = pageIds.length
    ? await GalleryPhoto.aggregate([
        { $match: { photographer: myId, gallery: { $in: pageIds } } },
        { $group: { _id: "$gallery", total: { $sum: 1 } } },
      ])
    : [];
  const photosByGallery = Object.fromEntries(
    counts.map((c) => [c._id.toString(), c.total])
  );

  const pro = isPro(user);
  const limit = planLimits(user).galleries;
  const atLimit = totalMine >= limit;

  const clientOptions = clients.map((c) => ({
    id: c._id.toString(),
    name: c.name,
  }));
  const hasFilters = !!(q || activeClient);

  // Links preservando busca e filtro.
  const hrefWith = (overrides) => {
    const merged = { q: q || "", cliente: activeClient, page: "", ...overrides };
    const params = new URLSearchParams();
    if (merged.q) params.set("q", merged.q);
    if (merged.cliente) params.set("cliente", merged.cliente);
    if (merged.page > 1) params.set("page", String(merged.page));
    const query = params.toString();
    return query ? `/dashboard/galleries?${query}` : "/dashboard/galleries";
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Entregas
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">
            Crie uma galeria privada de um trabalho, suba as fotos e mande o
            link pro cliente. Ele vê, favorita e baixa em alta — sem precisar
            de conta.
          </p>
        </div>
      </div>

      {!pro && (
        <p className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-4 py-3 text-sm text-zinc-300">
          No plano grátis você tem <strong>1 galeria</strong> de entrega.{" "}
          <Link href="/dashboard/plan" className="text-yellow-400 hover:underline">
            Assine o Pro
          </Link>{" "}
          para criar quantas quiser.
        </p>
      )}

      {!atLimit && <NewGalleryForm clients={clientOptions} />}

      {(totalMine > 0 || hasFilters) && (
        <form className="mt-8 flex flex-wrap gap-2">
          <input
            name="q"
            defaultValue={q || ""}
            placeholder="Buscar por galeria ou cliente…"
            className="w-64 rounded-full border border-white/10 bg-zinc-900/70 px-5 py-2 text-sm placeholder:text-zinc-600 outline-none transition focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/15"
          />
          {clientOptions.length > 0 && (
            <select
              name="cliente"
              defaultValue={activeClient}
              className="rounded-full border border-white/10 bg-zinc-900/70 px-4 py-2 text-sm text-zinc-300 outline-none transition focus:border-yellow-400/60"
            >
              <option value="">Todos os clientes</option>
              {clientOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          <button className="rounded-full bg-zinc-800 px-5 py-2 text-sm font-medium transition hover:bg-zinc-700">
            Buscar
          </button>
        </form>
      )}

      {totalFiltered === 0 ? (
        <p className="mt-8 text-sm text-zinc-500">
          {hasFilters ? (
            <>
              Nenhuma galeria encontrada com esses filtros.{" "}
              <Link
                href="/dashboard/galleries"
                className="text-yellow-400 hover:underline"
              >
                Limpar filtros
              </Link>
            </>
          ) : (
            "Você ainda não tem nenhuma galeria de entrega."
          )}
        </p>
      ) : (
        <>
          {hasFilters && (
            <p className="mt-6 text-sm text-zinc-500">
              {totalFiltered} galeria{totalFiltered > 1 ? "s" : ""} ·{" "}
              <Link
                href="/dashboard/galleries"
                className="text-yellow-400 hover:underline"
              >
                Limpar filtros
              </Link>
            </p>
          )}
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {galleries.map((g) => (
              <Link
                key={g._id.toString()}
                href={`/dashboard/galleries/${g._id}`}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-600"
              >
                <p className="truncate font-semibold">{g.title}</p>
                {g.clientName && (
                  <p className="mt-0.5 truncate text-sm text-zinc-400">
                    {g.clientName}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span>{photosByGallery[g._id.toString()] || 0} fotos</span>
                  {g.pin && (
                    <span className="flex items-center gap-1">
                      · <LockIcon size={12} /> PIN
                    </span>
                  )}
                  {g.expiresAt && (
                    <span>
                      · expira{" "}
                      {new Date(g.expiresAt).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-4 text-sm">
          {page > 1 && (
            <Link
              href={hrefWith({ page: page - 1 })}
              className="rounded-full border border-zinc-700 px-5 py-2 font-medium transition hover:border-zinc-500"
            >
              ← Anterior
            </Link>
          )}
          <span className="text-zinc-500">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={hrefWith({ page: page + 1 })}
              className="rounded-full border border-zinc-700 px-5 py-2 font-medium transition hover:border-zinc-500"
            >
              Próxima →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
