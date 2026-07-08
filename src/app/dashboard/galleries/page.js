import Link from "next/link";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Gallery from "@/models/Gallery";
import GalleryPhoto from "@/models/GalleryPhoto";
import { getSession } from "@/lib/auth";
import { isPro, planLimits } from "@/lib/plan";
import NewGalleryForm from "@/components/NewGalleryForm";

export const dynamic = "force-dynamic";

export default async function GalleriesPage() {
  const session = await getSession();
  await dbConnect();

  const myId = new mongoose.Types.ObjectId(session.id);
  const [user, galleries] = await Promise.all([
    User.findById(myId).select("plan planCurrentPeriodEnd").lean(),
    Gallery.find({ photographer: myId }).sort({ createdAt: -1 }).lean(),
  ]);

  const counts = await GalleryPhoto.aggregate([
    { $match: { photographer: myId } },
    { $group: { _id: "$gallery", total: { $sum: 1 } } },
  ]);
  const photosByGallery = Object.fromEntries(
    counts.map((c) => [c._id.toString(), c.total])
  );

  const pro = isPro(user);
  const limit = planLimits(user).galleries;
  const atLimit = galleries.length >= limit;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Galerias de entrega</h2>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">
            Crie uma galeria privada de um trabalho, suba as fotos e mande o
            link pro cliente. Ele vê, favorita e baixa em alta — sem precisar
            de conta.
          </p>
        </div>
      </div>

      {!pro && (
        <p className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-4 py-3 text-sm text-zinc-300">
          No plano grátis você tem <strong>1 galeria</strong> de entrega.{" "}
          <Link href="/dashboard/plan" className="text-yellow-400 hover:underline">
            Assine o Pro
          </Link>{" "}
          para criar quantas quiser.
        </p>
      )}

      {!atLimit && <NewGalleryForm />}

      {galleries.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500">
          Você ainda não tem nenhuma galeria de entrega.
        </p>
      ) : (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                {g.pin && <span>· 🔒 PIN</span>}
                {g.expiresAt && (
                  <span>
                    · expira{" "}
                    {new Date(g.expiresAt).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
