import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import Gallery from "@/models/Gallery";
import GalleryPhoto from "@/models/GalleryPhoto";
import { getSession } from "@/lib/auth";
import CopyLinkButton from "@/components/CopyLinkButton";
import GalleryUploader from "@/components/GalleryUploader";
import GallerySettings, { GalleryDelete } from "@/components/GallerySettings";
import GalleryNotify from "@/components/GalleryNotify";
import GalleryPhotoGrid from "@/components/GalleryPhotoGrid";
import { StarIcon, LockIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

// Marcador dos passos: a página segue a ordem real do trabalho
// (1 subir e conferir, 2 entregar) — só o que é sequência ganha número.
function Step({ n }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-zinc-950">
      {n}
    </span>
  );
}

function Chevron() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 transition-transform group-open:rotate-180"
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default async function ManageGallery({ params }) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  const session = await getSession();
  await dbConnect();
  const gallery = await Gallery.findById(id).lean();
  if (!gallery || gallery.photographer.toString() !== session.id) notFound();

  const photos = await GalleryPhoto.find({ gallery: id })
    .sort({ createdAt: -1 })
    .select("favorited fileName fileSize")
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
    // Galerias antigas não têm o campo — ausente conta como ligado.
    faceSearch: gallery.faceSearch !== false,
  };

  return (
    <div>
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
          {photos.length} foto{photos.length === 1 ? "" : "s"}
          {favorites > 0 && (
            <>
              {` · ${favorites} favorita${favorites > 1 ? "s" : ""}`}
              <StarIcon size={14} filled className="text-yellow-400" />
            </>
          )}
        </p>
      </div>

      {/* Passo 1 — subir e conferir */}
      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2.5 font-semibold">
            <Step n={1} /> Suba e confira as fotos
          </h3>
          <GalleryUploader
            galleryId={id}
            galleryTitle={gallery.title}
            indexFaces={g.faceSearch}
            existing={photos.map((p) => ({
              name: p.fileName,
              size: p.fileSize || 0,
            }))}
          />
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          As fotos sobem em segundo plano — acompanhe no cartão no canto da
          tela e navegue à vontade, só não feche a aba. Clique numa foto para
          vê-la em tela cheia.
        </p>
        <GalleryPhotoGrid
          galleryId={id}
          photos={photos.map((p) => ({
            id: p._id.toString(),
            favorited: !!p.favorited,
            fileName: p.fileName || "",
          }))}
        />
      </section>

      {/* Passo 2 — entregar */}
      <section className="mt-12">
        <h3 className="flex items-center gap-2.5 font-semibold">
          <Step n={2} /> Entregue ao cliente
        </h3>
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
          {photos.length === 0 && (
            <p className="mb-4 rounded-lg border border-yellow-400/20 bg-yellow-400/5 px-4 py-3 text-sm text-zinc-300">
              A galeria ainda está vazia — suba as fotos antes de mandar o
              link.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <CopyLinkButton
              path={`/g/${gallery.slug}`}
              label="Copiar link de entrega"
            />
            <Link
              href={`/g/${gallery.slug}`}
              target="_blank"
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-medium hover:border-zinc-500"
            >
              Ver como cliente
            </Link>
          </div>

          {gallery.pin && (
            <p className="mt-4 flex items-start gap-2 text-sm text-zinc-400">
              <LockIcon size={16} className="mt-0.5 shrink-0 text-yellow-400" />
              <span>
                Mande também o PIN <strong>{gallery.pin}</strong> — o cliente
                precisa dele para entrar (por outro canal, se preferir mais
                segurança).
              </span>
            </p>
          )}

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-zinc-600">
            <span className="h-px flex-1 bg-zinc-800" />
            ou mande direto por e-mail
            <span className="h-px flex-1 bg-zinc-800" />
          </div>

          <GalleryNotify
            galleryId={id}
            clientEmail={gallery.clientEmail || ""}
            notifiedAt={
              gallery.notifiedAt ? gallery.notifiedAt.toISOString() : null
            }
          />
        </div>
      </section>

      {/* Secundário: opções (definidas na criação) e exclusão, recolhidas */}
      <section className="mt-12 space-y-3">
        <details className="group rounded-xl border border-zinc-800 bg-zinc-900/60">
          <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 font-semibold [&::-webkit-details-marker]:hidden">
            Opções da galeria
            <Chevron />
          </summary>
          <div className="border-t border-zinc-800 px-6 py-5">
            <GallerySettings gallery={g} />
          </div>
        </details>

        <details className="group rounded-xl border border-red-500/25 bg-red-500/[0.03]">
          <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 font-semibold text-red-400 [&::-webkit-details-marker]:hidden">
            Apagar galeria
            <Chevron />
          </summary>
          <div className="border-t border-red-500/25 px-6 py-5">
            <GalleryDelete galleryId={id} />
          </div>
        </details>
      </section>
    </div>
  );
}
