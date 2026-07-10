import Link from "next/link";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Event from "@/models/Event";
import Photo from "@/models/Photo";
import Order from "@/models/Order";
import Gallery from "@/models/Gallery";
import GalleryPhoto from "@/models/GalleryPhoto";
import { getSession } from "@/lib/auth";
import { formatPrice } from "@/lib/currency";
import { isSellerProfileComplete } from "@/lib/seller";
import { isPro } from "@/lib/plan";
import OnboardingChecklist from "@/components/OnboardingChecklist";
import { PackageIcon, LockIcon } from "@/components/Icons";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// Quantas entregas recentes mostrar na home antes de mandar pra "Entregas".
const RECENT_GALLERIES = 6;

export default async function Dashboard() {
  const session = await getSession();
  await dbConnect();

  const myId = new mongoose.Types.ObjectId(session.id);
  const [user, events, galleries, galleryCount, sales] = await Promise.all([
    User.findById(myId)
      .select(
        "balanceCents cpf birthDate phone address collections plan planCurrentPeriodEnd"
      )
      .lean(),
    Event.find({ photographer: myId }).sort({ createdAt: -1 }).lean(),
    Gallery.find({ photographer: myId })
      .sort({ createdAt: -1 })
      .limit(RECENT_GALLERIES)
      .lean(),
    Gallery.countDocuments({ photographer: myId }),
    Order.aggregate([
      { $match: { status: "paid" } },
      { $unwind: "$items" },
      { $match: { "items.photographer": myId } },
      {
        $group: {
          _id: null,
          photosSold: { $sum: 1 },
          grossTotalCents: { $sum: "$items.priceCents" },
        },
      },
    ]),
  ]);

  const [photoCounts, galleryPhotoCounts] = await Promise.all([
    Photo.aggregate([
      { $match: { photographer: myId } },
      { $group: { _id: "$event", total: { $sum: 1 } } },
    ]),
    GalleryPhoto.aggregate([
      { $match: { photographer: myId } },
      { $group: { _id: "$gallery", total: { $sum: 1 } } },
    ]),
  ]);
  const photosByEvent = Object.fromEntries(
    photoCounts.map((c) => [c._id.toString(), c.total])
  );
  const photosByGallery = Object.fromEntries(
    galleryPhotoCounts.map((c) => [c._id.toString(), c.total])
  );

  const summary = sales[0] || { photosSold: 0, grossTotalCents: 0 };
  const pro = isPro(user);

  const steps = [
    {
      label: "Complete seus dados de venda (CPF, telefone, endereço)",
      done: isSellerProfileComplete(user),
      href: "/dashboard/profile",
      cta: "Completar",
    },
    {
      label: "Monte seu portfólio com suas melhores fotos",
      done: (user?.collections || []).some((c) => (c.photos || []).length > 0),
      href: "/dashboard/profile",
      cta: "Adicionar fotos",
    },
    {
      label: "Crie sua primeira galeria de entrega para um cliente",
      done: galleryCount > 0,
      href: "/dashboard/galleries",
      cta: "Criar galeria",
    },
    {
      label: "Ative o Pro: comissão zero e página sem a marca clikou",
      done: pro,
      href: "/dashboard/plan",
      cta: "Ver o Pro",
    },
  ];

  return (
    <div className="space-y-10">
      <OnboardingChecklist steps={steps} />

      {/* Números */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Saldo disponível", formatPrice(user?.balanceCents || 0), "/dashboard/withdrawal"],
          ["Fotos vendidas", summary.photosSold, null],
          ["Total bruto vendido", formatPrice(summary.grossTotalCents), null],
        ].map(([label, value, href]) => {
          const inner = (
            <>
              <p className="text-sm text-zinc-400">{label}</p>
              <p className="mt-1 text-2xl font-bold text-yellow-400">{value}</p>
            </>
          );
          return href ? (
            <Link
              key={label}
              href={href}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-600"
            >
              {inner}
            </Link>
          ) : (
            <div
              key={label}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
            >
              {inner}
            </div>
          );
        })}
      </div>

      {/* Entregas — o coração do painel */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Entregas</h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              Galerias privadas pra o cliente ver, favoritar e baixar em alta.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {galleryCount > RECENT_GALLERIES && (
              <Link
                href="/dashboard/galleries"
                className="text-sm font-medium text-yellow-400 hover:underline"
              >
                Ver todas ({galleryCount})
              </Link>
            )}
            <Link
              href="/dashboard/galleries"
              className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-yellow-300"
            >
              + Nova galeria
            </Link>
          </div>
        </div>

        {galleries.length === 0 ? (
          <Link
            href="/dashboard/galleries"
            className="mt-4 flex flex-col items-center gap-1 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 px-5 py-12 text-center transition hover:border-yellow-400/40"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
              <PackageIcon size={24} />
            </span>
            <p className="mt-2 font-semibold">Crie sua primeira entrega</p>
            <p className="max-w-sm text-sm text-zinc-500">
              Suba as fotos de um trabalho e mande o link pro cliente — ele nem
              precisa de conta.
            </p>
          </Link>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                      · expira {new Date(g.expiresAt).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Eventos — fotos à venda com busca por selfie */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Eventos à venda</h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              Fotos à venda com busca por selfie — o cliente se acha e compra.
            </p>
          </div>
          <Link
            href="/dashboard/events/new"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-yellow-400/60 hover:text-yellow-400"
          >
            + Novo evento
          </Link>
        </div>

        {events.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 px-5 py-10 text-center text-sm text-zinc-500">
            Nenhum evento ainda. Crie o primeiro e suba suas fotos à venda.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
            {events.map((e) => (
              <Link
                key={e._id.toString()}
                href={`/dashboard/events/${e._id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-zinc-800/50"
              >
                <div>
                  <p className="font-semibold">{e.title}</p>
                  <p className="text-sm text-zinc-400">
                    {photosByEvent[e._id.toString()] || 0} fotos · preço padrão{" "}
                    {formatPrice(e.defaultPriceCents)}
                  </p>
                </div>
                <span className="text-sm text-yellow-400">Gerenciar →</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
