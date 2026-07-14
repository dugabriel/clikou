"use client";

import { useCallback, useEffect, useRef } from "react";
import { formatPrice } from "@/lib/currency";

// Lightbox da galeria: foto grande, navegação por setas/teclado/swipe e
// seleção para compra sem sair da visualização.
export default function PhotoViewer({
  photos,
  index,
  onClose,
  onNavigate,
  selected,
  onToggle,
  purchased,
  totalCents,
  onBuy,
  buying,
  loggedIn,
  promo = false,
  eventId,
}) {
  const touchX = useRef(null);
  const photo = photos[index];
  const isSelected = photo && selected.has(photo.id);
  const isPurchased = photo && purchased.has(photo.id);

  const previous = useCallback(() => {
    if (index > 0) onNavigate(index - 1);
  }, [index, onNavigate]);
  const next = useCallback(() => {
    if (index < photos.length - 1) onNavigate(index + 1);
  }, [index, photos.length, onNavigate]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") previous();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, previous, next]);

  // Pré-carrega as vizinhas pra navegação não "piscar".
  useEffect(() => {
    [index - 1, index + 1].forEach((i) => {
      if (photos[i]) new Image().src = `/api/photos/${photos[i].id}/preview`;
    });
  }, [index, photos]);

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-zinc-950/95 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Visualização da foto"
    >
      {/* Topo: contador + fechar */}
      <div
        className="flex items-center justify-between px-4 py-3 text-sm text-zinc-400"
        onClick={(e) => e.stopPropagation()}
      >
        <span>
          {index + 1} / {photos.length}
        </span>
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-lg text-zinc-300 transition hover:border-yellow-400/60 hover:text-yellow-400"
        >
          ✕
        </button>
      </div>

      {/* Foto + setas */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2 py-3"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const delta = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (delta > 50) previous();
          else if (delta < -50) next();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={photo.id}
          src={`/api/photos/${photo.id}/preview`}
          alt="Foto do evento em tamanho grande"
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
          className="max-h-full max-w-full select-none rounded-lg object-contain shadow-2xl shadow-black/60"
        />

        {index > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              previous();
            }}
            aria-label="Foto anterior"
            className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-zinc-900/70 text-xl text-zinc-200 backdrop-blur transition hover:border-yellow-400/60 hover:text-yellow-400"
          >
            ‹
          </button>
        )}
        {index < photos.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Próxima foto"
            className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-zinc-900/70 text-xl text-zinc-200 backdrop-blur transition hover:border-yellow-400/60 hover:text-yellow-400"
          >
            ›
          </button>
        )}
      </div>

      {/* Rodapé: preço + ações de compra */}
      <div
        className="border-t border-white/10 bg-zinc-900/80 px-4 py-4 backdrop-blur"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3 sm:justify-between">
          <div className="text-sm">
            <p className="text-lg font-bold text-yellow-400">
              {promo ? "Grátis" : formatPrice(photo.priceCents)}
            </p>
            <p className="text-zinc-500">
              {promo
                ? "Divulgação do fotógrafo — sem marca d'água"
                : "Alta resolução, sem marca d'água"}
            </p>
          </div>

          {promo ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <a
                href={`/api/photos/${photo.id}/preview?download=1`}
                download
                className="rounded-full bg-yellow-400 px-6 py-2.5 font-semibold text-zinc-950 transition hover:bg-yellow-300"
              >
                Baixar grátis
              </a>
              <a
                href={
                  loggedIn
                    ? `/api/photos/${photo.id}/download`
                    : `/login?next=/events/${eventId}`
                }
                className="rounded-full border border-white/15 px-6 py-2.5 font-medium text-zinc-200 transition hover:border-yellow-400/60 hover:text-yellow-400"
              >
                {loggedIn
                  ? "Baixar em alta resolução"
                  : "Criar conta p/ alta resolução"}
              </a>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {isPurchased ? (
                <a
                  href={`/api/photos/${photo.id}/download`}
                  className="rounded-full bg-emerald-500 px-6 py-2.5 font-semibold text-zinc-950 transition hover:bg-emerald-400"
                >
                  Baixar ✓
                </a>
              ) : (
                <button
                  onClick={() => onToggle(photo.id)}
                  className={`rounded-full px-6 py-2.5 font-semibold transition ${
                    isSelected
                      ? "border border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
                      : "bg-yellow-400 text-zinc-950 hover:bg-yellow-300"
                  }`}
                >
                  {isSelected ? "Selecionada ✓ — remover" : "Quero esta foto"}
                </button>
              )}

              {selected.size > 0 && (
                <button
                  onClick={onBuy}
                  disabled={buying}
                  className="rounded-full border border-white/15 px-6 py-2.5 font-medium text-zinc-200 transition hover:border-yellow-400/60 hover:text-yellow-400 disabled:pointer-events-none disabled:opacity-50"
                >
                  {buying
                    ? "Aguarde…"
                    : `${loggedIn ? "Comprar" : "Entrar e comprar"} ${
                        selected.size
                      } foto${selected.size > 1 ? "s" : ""} · ${formatPrice(
                        totalCents
                      )}`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
