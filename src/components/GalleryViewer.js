"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BrandIcon } from "@/components/Logo";

// Galeria vista pelo cliente: grade, lightbox, favoritar e baixar em alta.
export default function GalleryViewer({
  slug,
  title,
  clientName,
  downloadEnabled,
  allowFavorites,
  photos,
}) {
  const [favs, setFavs] = useState(() => {
    const m = {};
    for (const p of photos) m[p.id] = p.favorited;
    return m;
  });
  const [open, setOpen] = useState(null); // índice no lightbox

  const previewSrc = (id) => `/api/g/${slug}/photo/${id}/preview`;
  const downloadHref = (id) => `/api/g/${slug}/photo/${id}/download`;

  async function toggleFav(id) {
    const next = !favs[id];
    setFavs((f) => ({ ...f, [id]: next })); // otimista
    const res = await fetch(`/api/g/${slug}/favorite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId: id, favorited: next }),
    });
    if (!res.ok) setFavs((f) => ({ ...f, [id]: !next })); // desfaz
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

  const favCount = Object.values(favs).filter(Boolean).length;
  const current = open === null ? null : photos[open];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {title}
          </h1>
          <p className="mt-0.5 text-sm text-zinc-400">
            {clientName ? `${clientName} · ` : ""}
            {photos.length} foto{photos.length === 1 ? "" : "s"}
            {allowFavorites && favCount > 0 && ` · ${favCount} favorita${favCount === 1 ? "" : "s"} ⭐`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {downloadEnabled && photos.length > 0 && (
            <a
              href={`/api/g/${slug}/download-all`}
              className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-yellow-300"
            >
              ⬇️ Baixar todas
            </a>
          )}
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-zinc-500"
          >
            <BrandIcon size={22} /> clikou
          </Link>
        </div>
      </header>

      {photos.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-500">
          O fotógrafo ainda não subiu as fotos desta galeria.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((p, i) => (
            <div
              key={p.id}
              className="group relative overflow-hidden rounded-lg bg-zinc-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc(p.id)}
                alt=""
                loading="lazy"
                onClick={() => setOpen(i)}
                className="aspect-square w-full cursor-zoom-in object-cover"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                {allowFavorites && (
                  <button
                    onClick={() => toggleFav(p.id)}
                    title="Favoritar"
                    className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-base backdrop-blur hover:bg-black/70"
                  >
                    {favs[p.id] ? "❤️" : "🤍"}
                  </button>
                )}
                {downloadEnabled && (
                  <a
                    href={downloadHref(p.id)}
                    title="Baixar em alta"
                    className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-base backdrop-blur hover:bg-black/70"
                  >
                    ⬇️
                  </a>
                )}
              </div>
              {allowFavorites && favs[p.id] && (
                <span className="absolute left-1.5 top-1.5 text-sm">❤️</span>
              )}
            </div>
          ))}
        </div>
      )}

      {current && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          onClick={close}
        >
          <div className="flex items-center justify-between p-4 text-white">
            <span className="text-sm text-zinc-400">
              {open + 1} / {photos.length}
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
              src={previewSrc(current.id)}
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
            {allowFavorites && (
              <button
                onClick={() => toggleFav(current.id)}
                className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
              >
                {favs[current.id] ? "❤️ Favoritada" : "🤍 Favoritar"}
              </button>
            )}
            {downloadEnabled && (
              <a
                href={downloadHref(current.id)}
                className="flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-2 text-sm font-semibold text-zinc-950 hover:bg-yellow-300"
              >
                ⬇️ Baixar em alta
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
