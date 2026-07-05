import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import Event from "@/models/Event";
import Photo from "@/models/Photo";
import { getSession } from "@/lib/auth";
import { formatPrice } from "@/lib/currency";
import Uploader from "@/components/Uploader";
import CopyLinkButton from "@/components/CopyLinkButton";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export default async function ManageEvent({ params }) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  const session = await getSession();
  await dbConnect();
  const event = await Event.findById(id).lean();
  if (!event || event.photographer.toString() !== session.id) notFound();

  const photos = await Photo.find({ event: id })
    .sort({ createdAt: -1 })
    .select("priceCents")
    .lean();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{event.title}</h2>
          <p className="text-sm text-zinc-400">
            {photos.length} fotos · preço padrão{" "}
            {formatPrice(event.defaultPriceCents)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/events/${id}`}
            className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-medium hover:border-zinc-500"
          >
            Ver página pública
          </Link>
          <CopyLinkButton path={`/events/${id}`} />
        </div>
      </div>

      <p className="mt-3 rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-4 py-3 text-sm text-zinc-300">
        Divulgue! Mande o link do evento no grupo do WhatsApp ou poste no
        story — quem estava lá encontra as próprias fotos e compra direto.
      </p>

      <Uploader
        eventId={id}
        defaultPrice={(event.defaultPriceCents / 100)
          .toFixed(2)
          .replace(".", ",")}
      />

      {photos.length > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {photos.map((p) => (
            <div
              key={p._id.toString()}
              className="overflow-hidden rounded-lg border border-zinc-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/photos/${p._id}/preview`}
                alt="Foto do evento"
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
              <p className="bg-zinc-900 px-2 py-1 text-center text-xs text-zinc-400">
                {formatPrice(p.priceCents)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
