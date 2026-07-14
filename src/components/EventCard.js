import Link from "next/link";
import { formatPrice } from "@/lib/currency";
import { categoryLabel } from "@/lib/categories";
import { CameraIcon } from "@/components/Icons";

export default function EventCard({ event }) {
  return (
    <Link
      href={`/events/${event._id}`}
      className="group overflow-hidden rounded-2xl border border-white/5 bg-zinc-900 transition hover:border-yellow-400/40"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-800">
        {event.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/photos/${event.cover}/preview`}
            alt={event.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-600">
            <CameraIcon size={40} />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-yellow-400 backdrop-blur">
          {event.promo
            ? "Fotos grátis"
            : `a partir de ${formatPrice(event.defaultPriceCents)}`}
        </span>
      </div>
      <div className="p-4">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
          {categoryLabel(event.category)}
        </p>
        <h3 className="font-display font-semibold tracking-tight group-hover:text-yellow-400">
          {event.title}
        </h3>
        <p className="mt-1 text-sm text-zinc-400">
          {event.city && (
            <span>
              {event.city}
              {event.state && ` – ${event.state}`} ·{" "}
            </span>
          )}
          {event.date &&
            new Date(event.date).toLocaleDateString("pt-BR", {
              timeZone: "UTC",
            })}
        </p>
        <p className="mt-1.5 text-xs text-zinc-500">
          por {event.photographer?.name || "fotógrafo"}
        </p>
      </div>
    </Link>
  );
}
