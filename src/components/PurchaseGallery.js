"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/currency";
import PhotoFinder from "@/components/PhotoFinder";
import PhotoViewer from "@/components/PhotoViewer";

// promo: evento de divulgação — tudo grátis e sem marca d'água. A versão web
// (1600px) baixa sem login; o original em alta pede cadastro (captação de lead).
export default function PurchaseGallery({ photos, purchased, loggedIn, eventId, promo = false }) {
  const router = useRouter();
  const [selected, setSelected] = useState(new Set());
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState(null); // null = sem filtro; { ids, kind }
  const [viewer, setViewer] = useState(null); // índice da foto aberta no lightbox
  const alreadyPurchased = useMemo(() => new Set(purchased), [purchased]);

  const visiblePhotos = filter
    ? photos.filter((p) => filter.ids.has(p.id))
    : photos;

  function toggle(id) {
    setSelected((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const total = photos
    .filter((p) => selected.has(p.id))
    .reduce((s, p) => s + p.priceCents, 0);

  async function buy() {
    if (!loggedIn) {
      router.push(`/login?next=/events/${eventId}`);
      return;
    }
    setBuying(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoIds: [...selected] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro no checkout.");
      window.location.href = data.url;
    } catch (e) {
      setError(e.message);
      setBuying(false);
    }
  }

  if (photos.length === 0) {
    return (
      <p className="py-20 text-center text-zinc-500">
        O fotógrafo ainda não publicou fotos neste evento.
      </p>
    );
  }

  return (
    <div className="pb-24">
      <PhotoFinder
        eventId={eventId}
        filterActive={!!filter}
        onFilter={(ids, kind) => {
          setFilter(ids ? { ids: new Set(ids), kind } : null);
          setViewer(null); // a lista visível muda, fecha o lightbox
        }}
      />

      {filter && (
        <p className="mb-4 text-sm text-zinc-300">
          {visiblePhotos.length === 0
            ? filter.kind === "print"
              ? "Nenhuma foto parecida com esse print neste evento. Tente uma imagem mais nítida ou limpe o filtro para ver todas."
              : "Nenhuma foto sua encontrada neste evento. Tente outra selfie ou limpe o filtro para ver todas."
            : filter.kind === "print"
              ? `${visiblePhotos.length === 1 ? "Achamos esta foto" : `Achamos ${visiblePhotos.length} fotos parecidas`} com o seu print:`
              : `Encontramos você em ${visiblePhotos.length} foto${
                  visiblePhotos.length > 1 ? "s" : ""
                }:`}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visiblePhotos.map((p, i) => {
          const isPurchased = alreadyPurchased.has(p.id);
          const isSelected = selected.has(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setViewer(i)}
              className={`group relative overflow-hidden rounded-lg border text-left transition ${
                isSelected
                  ? "border-yellow-400 ring-2 ring-yellow-400"
                  : "border-zinc-800 hover:border-zinc-600"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/photos/${p.id}/preview`}
                alt="Foto do evento"
                loading="lazy"
                className="aspect-[4/3] w-full bg-zinc-900 object-cover transition group-hover:scale-[1.03]"
              />
              {/* Dica de que o clique abre a foto grande */}
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 text-xs font-semibold uppercase tracking-widest text-white opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                Ver foto
              </span>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-3 py-2 text-sm">
                <span className="font-medium">
                  {promo ? "Grátis" : formatPrice(p.priceCents)}
                </span>
                {promo ? (
                  <a
                    href={`/api/photos/${p.id}/preview?download=1`}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="rounded bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-zinc-950"
                  >
                    Baixar ↓
                  </a>
                ) : isPurchased ? (
                  <a
                    href={`/api/photos/${p.id}/download`}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-zinc-950"
                  >
                    Baixar ✓
                  </a>
                ) : (
                  <span
                    role="button"
                    aria-label={isSelected ? "Remover da seleção" : "Selecionar para compra"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(p.id);
                    }}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs transition ${
                      isSelected
                        ? "border-yellow-400 bg-yellow-400 text-zinc-950"
                        : "border-zinc-300 text-transparent hover:border-yellow-400 hover:bg-yellow-400/20"
                    }`}
                  >
                    ✓
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {viewer !== null && (
        <PhotoViewer
          photos={visiblePhotos}
          index={Math.min(viewer, visiblePhotos.length - 1)}
          onClose={() => setViewer(null)}
          onNavigate={setViewer}
          selected={selected}
          onToggle={toggle}
          purchased={alreadyPurchased}
          totalCents={total}
          onBuy={buy}
          buying={buying}
          loggedIn={loggedIn}
          promo={promo}
          eventId={eventId}
        />
      )}

      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-700 bg-zinc-900/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
            <div>
              <span className="font-semibold">
                {selected.size} foto{selected.size > 1 ? "s" : ""}
              </span>
              <span className="ml-2 text-zinc-400">
                Total: {formatPrice(total)}
              </span>
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
            <button
              onClick={buy}
              disabled={buying}
              className="rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50"
            >
              {buying ? "Aguarde…" : loggedIn ? "Comprar" : "Entrar para comprar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
