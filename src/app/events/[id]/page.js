import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import Event from "@/models/Event";
import Photo from "@/models/Photo";
import Order from "@/models/Order";
import "@/models/User";
import { getSession } from "@/lib/auth";
import PurchaseGallery from "@/components/PurchaseGallery";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return {};
  await dbConnect();
  const event = await Event.findById(id)
    .select("title description city state cover published promo")
    .lean();
  if (!event || !event.published) return {};

  const where = [event.city, event.state].filter(Boolean).join(" – ");
  const description =
    event.description ||
    (event.promo
      ? `Fotos de ${event.title}${where ? ` em ${where}` : ""}. Encontre-se com uma selfie e baixe de graça, sem marca d'água.`
      : `Fotos de ${event.title}${where ? ` em ${where}` : ""}. Encontre-se com uma selfie e baixe em alta resolução, sem marca d'água.`);
  const image = event.cover
    ? `/api/photos/${event.cover.toString()}/preview`
    : "/og.png";

  return {
    title: `${event.title}${where ? ` (${where})` : ""} — fotos do evento — Clikou`,
    description,
    alternates: { canonical: `/events/${id}` },
    openGraph: {
      title: `${event.title} — fotos do evento`,
      description,
      url: `/events/${id}`,
      images: [{ url: image, alt: event.title }],
    },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export default async function EventPage({ params }) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await dbConnect();
  const event = await Event.findById(id)
    .populate("photographer", "name username")
    .lean();
  if (!event || !event.published) notFound();

  const photos = await Photo.find({ event: id })
    .sort({ createdAt: 1 })
    .select("priceCents width height")
    .lean();

  // Fotos que o usuário logado já comprou neste evento (não se aplica a
  // evento de divulgação: lá tudo é grátis).
  const session = await getSession();
  let purchased = [];
  if (session && !event.promo) {
    const orders = await Order.find({
      customer: session.id,
      status: "paid",
      "items.photo": { $in: photos.map((p) => p._id) },
    })
      .select("items.photo")
      .lean();
    purchased = orders.flatMap((o) => o.items.map((i) => i.photo.toString()));
  }

  // Dados estruturados (schema.org/Event) para o Google
  const appUrl = process.env.APP_URL || "https://clikou.click";
  const prices = photos.map((p) => p.priceCents);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    ...(event.date ? { startDate: new Date(event.date).toISOString().slice(0, 10) } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    ...(event.city
      ? {
          location: {
            "@type": "Place",
            name: event.city,
            address: {
              "@type": "PostalAddress",
              addressLocality: event.city,
              ...(event.state ? { addressRegion: event.state } : {}),
              addressCountry: "BR",
            },
          },
        }
      : {}),
    ...(event.cover
      ? { image: `${appUrl}/api/photos/${event.cover.toString()}/preview` }
      : {}),
    ...(event.photographer?.name
      ? { organizer: { "@type": "Person", name: event.photographer.name } }
      : {}),
    ...(event.promo
      ? { isAccessibleForFree: true }
      : prices.length
        ? {
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "BRL",
              lowPrice: Math.min(...prices) / 100,
              highPrice: Math.max(...prices) / 100,
              offerCount: prices.length,
              availability: "https://schema.org/InStock",
              url: `${appUrl}/events/${id}`,
            },
          }
        : {}),
  };

  const meta = (
    <p className="mt-1 text-zinc-400">
      {event.city && (
        <span>
          {event.city}
          {event.state && ` – ${event.state}`} ·{" "}
        </span>
      )}
      {event.date &&
        new Date(event.date).toLocaleDateString("pt-BR", {
          timeZone: "UTC",
        })}{" "}
      · por{" "}
      {event.photographer?.username ? (
        <Link
          href={`/f/${event.photographer.username}`}
          className="text-yellow-400 hover:underline"
        >
          {event.photographer.name}
        </Link>
      ) : (
        event.photographer?.name
      )}
      {/* Data de criação (timestamps do Mongoose) — sinal de frescor
          pra quem procura as fotos: "publicado em" ≠ data do evento. */}
      {event.createdAt && (
        <span className="text-zinc-500">
          {" "}
          · publicado em{" "}
          {new Date(event.createdAt).toLocaleDateString("pt-BR")}
        </span>
      )}
    </p>
  );

  const promoBadge = event.promo && (
    <span className="mb-3 inline-block rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-yellow-400">
      Fotos grátis · divulgação
    </span>
  );

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {event.cover ? (
        /* Hero: a capa escolhida pelo fotógrafo como fundo, escurecendo até
           a cor do site pra grade de fotos começar sem emenda. */
        <div className="relative -mt-px overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/photos/${event.cover.toString()}/preview`}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/55 to-[#0a0a0a]/25" />
          <div className="relative mx-auto flex min-h-[320px] max-w-6xl flex-col justify-end px-4 pb-8 pt-40 sm:min-h-[420px]">
            {promoBadge}
            <h1 className="max-w-3xl font-display text-4xl font-bold tracking-tight drop-shadow-lg sm:text-5xl">
              {event.title}
            </h1>
            {meta}
            {event.description && (
              <p className="mt-3 max-w-2xl text-zinc-300">
                {event.description}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl px-4 pt-10">
          {promoBadge}
          <h1 className="text-3xl font-bold">{event.title}</h1>
          {meta}
          {event.description && (
            <p className="mt-3 max-w-2xl text-zinc-300">{event.description}</p>
          )}
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-8">
        <PurchaseGallery
          photos={photos.map((p) => ({
            id: p._id.toString(),
            priceCents: p.priceCents,
          }))}
          purchased={purchased}
          loggedIn={!!session}
          eventId={id}
          promo={!!event.promo}
        />
      </div>
    </div>
  );
}
