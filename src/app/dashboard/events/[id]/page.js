import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import Event from "@/models/Event";
import Photo from "@/models/Photo";
import { getSession } from "@/lib/auth";
import { formatPrice } from "@/lib/currency";
import Uploader from "@/components/Uploader";
import EventPhotoGrid from "@/components/EventPhotoGrid";
import CopyLinkButton from "@/components/CopyLinkButton";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// Mesmo marcador de passos da página de galeria: a ordem do trabalho é
// 1 subir e conferir, 2 divulgar.
function Step({ n }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-zinc-950">
      {n}
    </span>
  );
}

export default async function ManageEvent({ params }) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  const session = await getSession();
  await dbConnect();
  const event = await Event.findById(id).lean();
  if (!event || event.photographer.toString() !== session.id) notFound();

  const photos = await Photo.find({ event: id })
    .sort({ createdAt: -1 })
    .select("priceCents fileName fileSize")
    .lean();

  return (
    <div>
      <div>
        <Link
          href="/dashboard/events"
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← Eventos
        </Link>
        <h2 className="mt-1 text-xl font-bold">{event.title}</h2>
        <p className="text-sm text-zinc-400">
          {photos.length} foto{photos.length === 1 ? "" : "s"} · preço padrão{" "}
          {formatPrice(event.defaultPriceCents)}
        </p>
      </div>

      {/* Passo 1 — subir e conferir */}
      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h3 className="flex items-center gap-2.5 font-semibold">
            <Step n={1} /> Suba e confira as fotos
          </h3>
          <Uploader
            eventId={id}
            eventTitle={event.title}
            defaultPrice={(event.defaultPriceCents / 100)
              .toFixed(2)
              .replace(".", ",")}
            existing={photos.map((p) => ({
              name: p.fileName,
              size: p.fileSize || 0,
            }))}
          />
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          A prova pública sai sempre com marca d&apos;água — a foto limpa só
          depois da compra — e os rostos são detectados para a busca por
          selfie. O envio roda em segundo plano: acompanhe no cartão no canto
          da tela. Clique numa foto para vê-la em tela cheia.
        </p>
        <EventPhotoGrid
          photos={photos.map((p) => ({
            id: p._id.toString(),
            priceCents: p.priceCents,
          }))}
        />
      </section>

      {/* Passo 2 — divulgar */}
      <section className="mt-12">
        <h3 className="flex items-center gap-2.5 font-semibold">
          <Step n={2} /> Divulgue e venda
        </h3>
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
          {photos.length === 0 && (
            <p className="mb-4 rounded-lg border border-yellow-400/20 bg-yellow-400/5 px-4 py-3 text-sm text-zinc-300">
              O evento ainda está sem fotos — suba as fotos antes de divulgar
              o link.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <CopyLinkButton
              path={`/events/${id}`}
              label="Copiar link do evento"
            />
            <Link
              href={`/events/${id}`}
              target="_blank"
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-medium hover:border-zinc-500"
            >
              Ver página pública
            </Link>
          </div>
          <p className="mt-4 text-sm text-zinc-400">
            Mande o link no grupo do WhatsApp ou poste no story — quem estava
            lá encontra as próprias fotos com uma selfie e compra direto.
          </p>
        </div>
      </section>
    </div>
  );
}
