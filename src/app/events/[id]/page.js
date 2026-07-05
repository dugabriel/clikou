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

  // Fotos que o usuário logado já comprou neste evento
  const session = await getSession();
  let purchased = [];
  if (session) {
    const orders = await Order.find({
      customer: session.id,
      status: "paid",
      "items.photo": { $in: photos.map((p) => p._id) },
    })
      .select("items.photo")
      .lean();
    purchased = orders.flatMap((o) => o.items.map((i) => i.photo.toString()));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{event.title}</h1>
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
        </p>
        {event.description && (
          <p className="mt-3 max-w-2xl text-zinc-300">{event.description}</p>
        )}
      </div>

      <PurchaseGallery
        photos={photos.map((p) => ({
          id: p._id.toString(),
          priceCents: p.priceCents,
        }))}
        purchased={purchased}
        loggedIn={!!session}
        eventId={id}
      />
    </div>
  );
}
