"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Grade de gestão das fotos: mostra as favoritas do cliente e permite excluir.
export default function GalleryPhotoGrid({ galleryId, photos }) {
  const router = useRouter();
  const [busy, setBusy] = useState(null);

  async function remove(pid) {
    if (!confirm("Remover esta foto da galeria?")) return;
    setBusy(pid);
    const res = await fetch(`/api/galleries/${galleryId}/photos/${pid}`, {
      method: "DELETE",
    });
    setBusy(null);
    if (res.ok) router.refresh();
  }

  if (photos.length === 0) {
    return (
      <p className="mt-8 text-sm text-zinc-500">
        Nenhuma foto ainda. Suba as primeiras acima.
      </p>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {photos.map((p) => (
        <div
          key={p.id}
          className="group relative overflow-hidden rounded-lg border border-zinc-800"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/galleries/${galleryId}/photos/${p.id}`}
            alt="Foto da galeria"
            loading="lazy"
            className="aspect-square w-full object-cover"
          />
          {p.favorited && (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-xs">
              ⭐
            </span>
          )}
          <button
            onClick={() => remove(p.id)}
            disabled={busy === p.id}
            title="Remover foto"
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-500 disabled:opacity-50"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
