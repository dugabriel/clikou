import Link from "next/link";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Event from "@/models/Event";
import Photo from "@/models/Photo";
import Order from "@/models/Order";
import Gallery from "@/models/Gallery";
import { getSession } from "@/lib/auth";
import { formatPrice } from "@/lib/currency";
import { isSellerProfileComplete } from "@/lib/seller";
import { isPro } from "@/lib/plan";
import OnboardingChecklist from "@/components/OnboardingChecklist";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await getSession();
  await dbConnect();

  const myId = new mongoose.Types.ObjectId(session.id);
  const [user, events, galleryCount, sales] = await Promise.all([
    User.findById(myId)
      .select(
        "balanceCents cpf birthDate phone address collections plan planCurrentPeriodEnd"
      )
      .lean(),
    Event.find({ photographer: myId }).sort({ createdAt: -1 }).lean(),
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

  const counts = await Photo.aggregate([
    { $match: { photographer: myId } },
    { $group: { _id: "$event", total: { $sum: 1 } } },
  ]);
  const photosByEvent = Object.fromEntries(
    counts.map((c) => [c._id.toString(), c.total])
  );

  const summary = sales[0] || { photosSold: 0, grossTotalCents: 0 };

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
      done: isPro(user),
      href: "/dashboard/plan",
      cta: "Ver o Pro",
    },
  ];

  return (
    <div>
      <OnboardingChecklist steps={steps} />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Saldo disponível", formatPrice(user?.balanceCents || 0)],
          ["Fotos vendidas", summary.photosSold],
          ["Total bruto vendido", formatPrice(summary.grossTotalCents)],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <p className="text-sm text-zinc-400">{label}</p>
            <p className="mt-1 text-2xl font-bold text-yellow-400">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl font-bold">Meus eventos</h2>
        <Link
          href="/dashboard/events/new"
          className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-yellow-300"
        >
          + Novo evento
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="py-16 text-center text-zinc-500">
          Você ainda não criou nenhum evento. Crie o primeiro e suba suas
          fotos!
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
    </div>
  );
}
