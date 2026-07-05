import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Event from "@/models/Event";
import Photo from "@/models/Photo";
import EventCard from "@/components/EventCard";
import { BrandIcon } from "@/components/Logo";
import {
  GlobeIcon,
  InstagramIcon,
  WhatsAppIcon,
  CameraIcon,
  ArrowIcon,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { username } = await params;
  await dbConnect();
  const profile = await User.findOne({ username }).select("name bio").lean();
  if (!profile) return { title: "Perfil não encontrado — Clikou" };
  return {
    title: `${profile.name} — fotógrafo na Clikou`,
    description: profile.bio || `Fotos de eventos por ${profile.name}.`,
  };
}

export default async function PublicProfile({ params }) {
  const { username } = await params;
  await dbConnect();
  const profile = await User.findOne({ username })
    .select("name bio city website instagram whatsapp portfolio avatarUrl")
    .lean();
  if (!profile) notFound();

  const [events, totalPhotos] = await Promise.all([
    Event.find({ photographer: profile._id, published: true })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean(),
    Photo.countDocuments({ photographer: profile._id }),
  ]);

  const socials = [
    profile.instagram && {
      Icon: InstagramIcon,
      label: `@${profile.instagram}`,
      href: `https://instagram.com/${profile.instagram}`,
    },
    profile.whatsapp && {
      Icon: WhatsAppIcon,
      label: "WhatsApp",
      href: `https://wa.me/${profile.whatsapp}`,
    },
    profile.website && {
      Icon: GlobeIcon,
      label: profile.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
      href: profile.website,
    },
  ].filter(Boolean);

  return (
    <div className="relative overflow-hidden">
      {/* brilho de fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl"
      />

      {/* Cabeçalho do perfil */}
      <section className="relative mx-auto max-w-4xl px-4 pt-20 text-center">
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="mx-auto h-28 w-28 rounded-full object-cover ring-4 ring-yellow-400"
          />
        ) : (
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-zinc-800 text-4xl font-bold text-yellow-400 ring-4 ring-yellow-400">
            {profile.name[0]?.toUpperCase()}
          </div>
        )}

        <h1 className="font-display mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
          {profile.name}
        </h1>
        <p className="mt-2 text-yellow-400">
          clikou/f/{username}
          {profile.city && (
            <span className="text-zinc-500"> · {profile.city}</span>
          )}
        </p>

        {profile.bio && (
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-zinc-300">
            {profile.bio}
          </p>
        )}

        {socials.length > 0 && (
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {socials.map(({ Icon, label, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-5 py-2.5 text-sm font-medium transition hover:border-yellow-400 hover:text-yellow-400"
              >
                <Icon size={17} />
                {label}
              </a>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center gap-10 text-center">
          <div>
            <p className="font-display text-3xl font-bold text-yellow-400">
              {events.length}
            </p>
            <p className="text-sm text-zinc-500">
              evento{events.length !== 1 && "s"}
            </p>
          </div>
          <div className="w-px bg-zinc-800" />
          <div>
            <p className="font-display text-3xl font-bold text-yellow-400">
              {totalPhotos}
            </p>
            <p className="text-sm text-zinc-500">
              foto{totalPhotos !== 1 && "s"} à venda
            </p>
          </div>
        </div>
      </section>

      {/* Portfólio */}
      {profile.portfolio.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pt-20">
          <h2 className="font-display mb-6 flex items-center gap-2.5 text-2xl font-bold tracking-tight">
            <CameraIcon size={24} className="text-yellow-400" />
            Portfólio
          </h2>
          <div className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] sm:grid-cols-4">
            {profile.portfolio.map((key, i) => (
              <div
                key={key}
                className={`overflow-hidden rounded-2xl border border-white/5 ${
                  i === 0 ? "col-span-2 row-span-2" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/${key}`}
                  alt={`Portfólio de ${profile.name}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Eventos */}
      {events.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pt-20">
          <h2 className="font-display mb-6 text-2xl font-bold tracking-tight">
            Eventos com fotos à venda
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <EventCard
                key={e._id.toString()}
                event={{ ...e, photographer: { name: profile.name } }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Rodapé da página do fotógrafo */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/80 px-6 py-3 text-sm text-zinc-400 transition hover:border-yellow-400 hover:text-yellow-400"
        >
          <BrandIcon size={20} />
          Fotografa? Crie sua página grátis na clikou
          <ArrowIcon size={15} />
        </Link>
      </section>
    </div>
  );
}
