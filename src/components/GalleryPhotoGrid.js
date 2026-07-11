"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StarIcon } from "@/components/Icons";

// Grade de gestão das fotos: mostra as favoritas do cliente, permite excluir
// e abre um carrossel (lightbox) para revisar as fotos em tela cheia — o
// mesmo padrão que o cliente tem no GalleryViewer.
export default function GalleryPhotoGrid({ galleryId, photos }) {
  const router = useRouter();
  const [busy, setBusy] = useState(null);
  const [open, setOpen] = useState(null); // índice no carrossel

  const src = (pid) => `/api/galleries/${galleryId}/photos/${pid}`;

  async function remove(pid) {
    if (!confirm("Remover esta foto da galeria?")) return;
    setBusy(pid);
    const res = await fetch(`/api/galleries/${galleryId}/photos/${pid}`, {
      method: "DELETE",
    });
    setBusy(null);
    if (res.ok) {
      // No carrossel, fica na mesma posição (a próxima foto assume o lugar);
      // fecha se era a última que restava.
      setOpen((i) =>
        i === null || photos.length <= 1 ? null : Math.min(i, photos.length - 2)
      );
      router.refresh();
    }
  }

  const close = useCallback(() => setOpen(null), []);
  const move = useCallback(
    (delta) =>
      setOpen((i) =>
        i === null ? i : (i + delta + photos.length) % photos.length
      ),
    [photos.length]
  );

  useEffect(() => {
    if (open === null) return;
    function onKey(e) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") move(1);
      else if (e.key === "ArrowLeft") move(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, move]);

  if (photos.length === 0) {
    return (
      <p className="mt-8 text-sm text-zinc-500">
        Nenhuma foto ainda. Suba as primeiras acima.
      </p>
    );
  }

  // O refresh pós-exclusão encolhe a lista; o índice clampado evita abrir
  // uma posição que já não existe.
  const current =
    open === null ? null : photos[Math.min(open, photos.length - 1)];

  return (
    <>
      <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {photos.map((p, i) => (
          <div
            key={p.id}
            className="group relative overflow-hidden rounded-lg border border-zinc-800"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src(p.id)}
              alt="Foto da galeria"
              loading="lazy"
              onClick={() => setOpen(i)}
              className="aspect-square w-full cursor-zoom-in object-cover"
            />
            {p.favorited && (
              <span className="pointer-events-none absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-yellow-400">
                <StarIcon size={14} filled />
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

      {current && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          onClick={close}
        >
          <div className="flex items-center justify-between p-4 text-white">
            <span className="flex items-center gap-2 text-sm text-zinc-400">
              {Math.min(open, photos.length - 1) + 1} / {photos.length}
              {current.fileName && (
                <span className="hidden max-w-[40vw] truncate sm:inline">
                  · {current.fileName}
                </span>
              )}
              {current.favorited && (
                <StarIcon size={14} filled className="text-yellow-400" />
              )}
            </span>
            <button
              onClick={close}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              ✕
            </button>
          </div>

          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => move(-1)}
              className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20"
              aria-label="Anterior"
            >
              ‹
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src(current.id)}
              alt=""
              className="max-h-full max-w-full object-contain"
            />
            <button
              onClick={() => move(1)}
              className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20"
              aria-label="Próxima"
            >
              ›
            </button>
          </div>

          <div
            className="flex items-center justify-center gap-3 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => remove(current.id)}
              disabled={busy === current.id}
              className="rounded-full border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              {busy === current.id ? "Removendo…" : "Remover foto"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
