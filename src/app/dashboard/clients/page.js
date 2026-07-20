import Link from "next/link";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import Client from "@/models/Client";
import Gallery from "@/models/Gallery";
import { getSession } from "@/lib/auth";
import { canUseClients } from "@/lib/plan";
import { accentInsensitiveRegex } from "@/lib/search";
import { NewClientButton, ClientRow } from "@/components/ClientForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Clientes — Clikou" };

const PAGE_SIZE = 20;

export default async function ClientsPage({ searchParams }) {
  const session = await getSession();

  if (!canUseClients()) {
    return (
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Clientes
        </h2>
        <p className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-4 py-3 text-sm text-zinc-300">
          O cadastro de clientes é um recurso do plano Pro.{" "}
          <Link href="/dashboard/plan" className="text-yellow-400 hover:underline">
            Assine o Pro
          </Link>{" "}
          para organizar seus clientes e vincular entregas.
        </p>
      </div>
    );
  }

  const { q, page: rawPage } = await searchParams;
  const requestedPage = Math.max(1, parseInt(rawPage, 10) || 1);

  await dbConnect();
  const myId = new mongoose.Types.ObjectId(session.id);

  const filter = { photographer: myId };
  if (q) {
    const regex = accentInsensitiveRegex(q);
    filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  const total = await Client.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const clients = await Client.find(filter)
    .collation({ locale: "pt" })
    .sort({ name: 1 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean();

  // Nº de entregas vinculadas — só dos clientes desta página.
  const pageIds = clients.map((c) => c._id);
  const counts = pageIds.length
    ? await Gallery.aggregate([
        { $match: { photographer: myId, client: { $in: pageIds } } },
        { $group: { _id: "$client", total: { $sum: 1 } } },
      ])
    : [];
  const galleriesByClient = Object.fromEntries(
    counts.map((c) => [c._id.toString(), c.total])
  );

  // Links preservando a busca.
  const hrefWith = (overrides) => {
    const merged = { q: q || "", page: "", ...overrides };
    const params = new URLSearchParams();
    if (merged.q) params.set("q", merged.q);
    if (merged.page > 1) params.set("page", String(merged.page));
    const query = params.toString();
    return query ? `/dashboard/clients?${query}` : "/dashboard/clients";
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Clientes
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">
            Seu caderninho de clientes: contato, endereço e anotações num só
            lugar. Vincule às entregas para achar tudo de cada cliente rapidinho.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <NewClientButton />
      </div>

      {(total > 0 || q) && (
        <form className="mt-6 flex flex-wrap gap-2">
          <input
            name="q"
            defaultValue={q || ""}
            placeholder="Buscar por nome, e-mail ou telefone…"
            className="w-72 rounded-full border border-white/10 bg-zinc-900/70 px-5 py-2 text-sm placeholder:text-zinc-600 outline-none transition focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/15"
          />
          <button className="rounded-full bg-zinc-800 px-5 py-2 text-sm font-medium transition hover:bg-zinc-700">
            Buscar
          </button>
        </form>
      )}

      {total === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">
          {q ? (
            <>
              Nenhum cliente encontrado para &ldquo;{q}&rdquo;.{" "}
              <Link
                href="/dashboard/clients"
                className="text-yellow-400 hover:underline"
              >
                Limpar busca
              </Link>
            </>
          ) : (
            "Você ainda não cadastrou nenhum cliente."
          )}
        </p>
      ) : (
        <>
          <p className="mt-6 mb-3 text-sm text-zinc-500">
            {total} cliente{total > 1 ? "s" : ""}
          </p>
          <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
            {clients.map((c) => (
              <ClientRow
                key={c._id.toString()}
                client={{
                  id: c._id.toString(),
                  name: c.name,
                  email: c.email || "",
                  phone: c.phone || "",
                  instagram: c.instagram || "",
                  street: c.street || "",
                  neighborhood: c.neighborhood || "",
                  city: c.city || "",
                  state: c.state || "",
                  zip: c.zip || "",
                  notes: c.notes || "",
                }}
                galleryCount={galleriesByClient[c._id.toString()] || 0}
              />
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
