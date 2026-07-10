import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import Gallery from "@/models/Gallery";
import GalleryPhoto from "@/models/GalleryPhoto";
import { getSession } from "@/lib/auth";
import CopyLinkButton from "@/components/CopyLinkButton";
import GalleryUploader from "@/components/GalleryUploader";
import GallerySettings from "@/components/GallerySettings";
import GalleryNotify from "@/components/GalleryNotify";
import GalleryPhotoGrid from "@/components/GalleryPhotoGrid";
import { StarIcon, LockIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function ManageGallery({ params }) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  const session = await getSession();
  await dbConnect();
  const gallery = await Gallery.findById(id).lean();
  if (!gallery || gallery.photographer.toString() !== session.id) notFound();

  const photos = await GalleryPhoto.find({ gallery: id })
    .sort({ createdAt: -1 })
    .select("favorited fileName")
    .lean();

  const favorites = photos.filter((p) => p.favorited).length;

  const g = {
    id: id,
    slug: gallery.slug,
    pin: gallery.pin || "",
    expiresAt: gallery.expiresAt
      ? new Date(gallery.expiresAt).toISOString().slice(0, 10)
      : "",
    downloadEnabled: gallery.downloadEnabled,
    allowFavorites: gallery.allowFavorites,
    watermarkPreviews: gallery.watermarkPreviews,
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard/galleries"
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← Entregas
          </Link>
          <h2 className="mt-1 text-xl font-bold">{gallery.title}</h2>
          <p className="flex items-center gap-1 text-sm text-zinc-400">
            {gallery.clientName ? `${gallery.clientName} · ` : ""}
            {photos.length} fotos
            {favorites > 0 && (
              <>
                {` · ${favorites} favorita${favorites > 1 ? "s" : ""}`}
                <StarIcon size={14} filled className="text-yellow-400" />
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/g/${gallery.slug}`}
            target="_blank"
            className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-medium hover:border-zinc-500"
          >
            Ver como cliente
          </Link>
          <CopyLinkButton
            path={`/g/${gallery.slug}`}
            label="Copiar link de entrega"
          />
        </div>
      </div>

      {gallery.pin && (
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-4 py-3 text-sm text-zinc-300">
          <LockIcon size={16} className="mt-0.5 shrink-0 text-yellow-400" />
          <span>
            Esta galeria pede o PIN <strong>{gallery.pin}</strong>. Mande o PIN
            junto com o link (ou por outro canal, se preferir mais segurança).
          </span>
        </p>
      )}

      <GalleryUploader galleryId={id} />

      <GalleryNotify
        galleryId={id}
        clientEmail={gallery.clientEmail || ""}
        notifiedAt={gallery.notifiedAt ? gallery.notifiedAt.toISOString() : null}
      />

      <GallerySettings gallery={g} />

      <GalleryPhotoGrid galleryId={id} photos={photos.map((p) => ({
        id: p._id.toString(),
        favorited: !!p.favorited,
      }))} />
    </div>
  );
}
