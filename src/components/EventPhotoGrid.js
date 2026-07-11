"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPrice } from "@/lib/currency";

// Grade de gestão das fotos do evento, com carrossel em tela cheia — o
// mesmo padrão do GalleryPhotoGrid da entrega. Sem exclusão: foto de evento
// à venda não tem API de remoção (por enquanto).
export default function EventPhotoGrid({ photos }) {
  const [open, setOpen] = useState(null); // índice no carrossel

  const src = (pid) => `/api/photos/${pid}/preview`;

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
      <p className="mt-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 px-6 py-10 text-center text-sm text-zinc-500">
        Nenhuma foto ainda — clique em &ldquo;Selecionar fotos&rdquo; para
        começar.
      </p>
    );
  }

  const current = open === null ? null : photos[open];

  return (
    <>
      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {photos.map((p, i) => (
          <div
            key={p.id}
            className="overflow-hidden rounded-lg border border-zinc-800"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src(p.id)}
              alt="Foto do evento"
              loading="lazy"
              onClick={() => setOpen(i)}
              className="aspect-square w-full cursor-zoom-in object-cover"
            />
            <p className="bg-zinc-900 px-2 py-1 text-center text-xs text-zinc-400">
              {formatPrice(p.priceCents)}
            </p>
          </div>
        ))}
      </div>

      {current && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          onClick={close}
        >
          <div className="flex items-center justify-between p-4 text-white">
            <span className="text-sm text-zinc-400">
              {open + 1} / {photos.length} · {formatPrice(current.priceCents)}
            </span>
            <button
              onClick={close}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              ✕
            </button>
          </div>

          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden px-2 pb-4"
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
        </div>
      )}
    </>
  );
}
