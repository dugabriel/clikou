"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { XIcon } from "@/components/Icons";

// Grade de portfólio clicável: abre a foto em tela cheia com navegação por
// setas/teclado/swipe, igual ao lightbox das galerias de entrega e evento.
export default function PortfolioGallery({ photos, alt, spotlightFirst = false }) {
  const [open, setOpen] = useState(null);
  const touchX = useRef(null);

  const close = useCallback(() => setOpen(null), []);
  const move = useCallback(
    (delta) =>
      setOpen((i) => (i === null ? i : (i + delta + photos.length) % photos.length)),
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
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, move]);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] sm:grid-cols-4">
        {photos.map((key, i) => (
          <button
            key={key}
            type="button"
            onClick={() => setOpen(i)}
            aria-label="Ver foto em tela cheia"
            className={`overflow-hidden rounded-2xl border border-white/5 ${
              spotlightFirst && i === 0 ? "col-span-2 row-span-2" : ""
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/${key}`}
              alt={alt}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 hover:scale-105"
            />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Visualização da foto"
        >
          <div
            className="flex items-center justify-between p-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-sm text-zinc-400">
              {open + 1} / {photos.length}
            </span>
            <button
              onClick={close}
              aria-label="Fechar"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <XIcon size={16} />
            </button>
          </div>

          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden px-2"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const delta = e.changedTouches[0].clientX - touchX.current;
              touchX.current = null;
              if (delta > 50) move(-1);
              else if (delta < -50) move(1);
            }}
          >
            {photos.length > 1 && (
              <button
                onClick={() => move(-1)}
                aria-label="Foto anterior"
                className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20"
              >
                ‹
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={photos[open]}
              src={`/api/${photos[open]}`}
              alt={alt}
              draggable={false}
              className="max-h-full max-w-full select-none object-contain"
            />
            {photos.length > 1 && (
              <button
                onClick={() => move(1)}
                aria-label="Próxima foto"
                className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20"
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
