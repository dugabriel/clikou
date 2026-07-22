import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Event from "@/models/Event";
import Photo from "@/models/Photo";
import EventCard from "@/components/EventCard";
import LeadForm from "@/components/LeadForm";
import PortfolioGallery from "@/components/PortfolioGallery";
import { getSession } from "@/lib/auth";
import { isPro, normalizedCollections } from "@/lib/plan";
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
    .select(
      "name bio city website instagram whatsapp collections avatarUrl plan planCurrentPeriodEnd brandColor coverKey"
    )
    .lean();
  if (!profile) notFound();

  const pro = isPro(profile);
  const accent = pro && profile.brandColor ? profile.brandColor : "#facc15";

  // Contabiliza a visita (métrica Pro), exceto quando o próprio dono acessa.
  const session = await getSession();
  if (!session || session.id !== profile._id.toString()) {
    User.updateOne({ _id: profile._id }, { $inc: { "stats.profileViews": 1 } }).catch(
      () => {}
    );
  }

  // Coleções com fotos (grátis tem uma só, sem nome; Pro tem várias nomeadas).
  const collections = normalizedCollections(profile).filter(
    (c) => c.photos.length > 0
  );
  const named = collections.filter((c) => c.name);

  const [events, totalPhotos] = await Promise.all([
    Event.find({ photographer: profile._id, published: true })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean(),
    Photo.countDocuments({ photographer: profile._id }),
  ]);

  // Links de contato passam pela rota de clique (conta a métrica e redireciona).
  const track = (to) => `/api/f/${username}/click?to=${to}`;
  const socials = [
    profile.instagram && {
      Icon: InstagramIcon,
      label: `@${profile.instagram}`,
      href: track("instagram"),
    },
    profile.whatsapp && {
      Icon: WhatsAppIcon,
      label: "WhatsApp",
      href: track("whatsapp"),
    },
    profile.website && {
      Icon: GlobeIcon,
      label: profile.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
      href: track("site"),
    },
  ].filter(Boolean);

  return (
    <div className="relative overflow-hidden" style={{ "--brand": accent }}>
      {/* Capa (Pro) ou brilho de fundo padrão */}
      {pro && profile.coverKey ? (
        <div className="relative h-56 w-full overflow-hidden sm:h-72">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/${profile.coverKey}`}
            alt={`Capa de ${profile.name}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
        </div>
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: accent }}
        />
      )}

      {/* Cabeçalho do perfil */}
      <section
        className={`relative mx-auto max-w-4xl px-4 text-center ${
          pro && profile.coverKey ? "-mt-16" : "pt-20"
        }`}
      >
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="mx-auto h-28 w-28 rounded-full object-cover ring-4 ring-[color:var(--brand)]"
          />
        ) : (
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-zinc-800 text-4xl font-bold text-[color:var(--brand)] ring-4 ring-[color:var(--brand)]">
            {profile.name[0]?.toUpperCase()}
          </div>
        )}

        <h1 className="font-display mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
          {profile.name}
        </h1>
        <p className="mt-2 text-[color:var(--brand)]">
          {pro ? (
            profile.city ? (
              <span className="text-zinc-400">{profile.city}</span>
            ) : null
          ) : (
            <>
              clikou/f/{username}
              {profile.city && (
                <span className="text-zinc-500"> · {profile.city}</span>
              )}
            </>
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
                className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-5 py-2.5 text-sm font-medium transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
              >
                <Icon size={17} />
                {label}
              </a>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center gap-10 text-center">
          <div>
            <p className="font-display text-3xl font-bold text-[color:var(--brand)]">
              {events.length}
            </p>
            <p className="text-sm text-zinc-500">
              evento{events.length !== 1 && "s"}
            </p>
          </div>
          <div className="w-px bg-zinc-800" />
          <div>
            <p className="font-display text-3xl font-bold text-[color:var(--brand)]">
              {totalPhotos}
            </p>
            <p className="text-sm text-zinc-500">
              foto{totalPhotos !== 1 && "s"} à venda
            </p>
          </div>
        </div>
      </section>

      {/* Portfólio: coleções nomeadas viram seções; senão, uma grade única. */}
      {collections.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pt-20">
          <h2 className="font-display mb-6 flex items-center gap-2.5 text-2xl font-bold tracking-tight">
            <CameraIcon size={24} className="text-[color:var(--brand)]" />
            Portfólio
          </h2>

          {named.length > 0 ? (
            <div className="space-y-12">
              {collections.map((c) => (
                <div key={c._id}>
                  {c.name && (
                    <h3 className="mb-4 text-lg font-semibold text-zinc-200">
                      {c.name}
                    </h3>
                  )}
                  <PortfolioGallery
                    photos={c.photos}
                    alt={c.name || `Portfólio de ${profile.name}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <PortfolioGallery
              photos={collections[0].photos}
              alt={`Portfólio de ${profile.name}`}
              spotlightFirst
            />
          )}
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

      {/* Peça um orçamento (Pro) */}
      {pro && (
        <section className="mx-auto max-w-3xl px-4 pt-20">
          <h2 className="font-display mb-2 text-center text-2xl font-bold tracking-tight">
            Quer contratar {profile.name.split(" ")[0]}?
          </h2>
          <p className="mx-auto mb-6 max-w-lg text-center text-zinc-400">
            Conte sobre o seu evento e receba um orçamento.
          </p>
          <LeadForm username={username} />
        </section>
      )}

      {/* Rodapé: marca clikou só no grátis (é o funil). */}
      {!pro && (
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
      )}

      {pro && <div className="py-16" />}
    </div>
  );
}
