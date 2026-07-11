"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BrandIcon } from "@/components/Logo";
import { DownloadIcon, HeartIcon, StarIcon, XIcon } from "@/components/Icons";

// Busca por selfie dentro da galeria: extrai o descritor no navegador (como
// no PhotoFinder dos eventos) e filtra a grade pelas fotos em que a pessoa
// aparece. Sem busca por print — foto de galeria não tem hash perceptual.
function SelfieFinder({ slug, matches, shownCount, onFilter }) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function onPickSelfie(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");
    setStatus("Analisando sua selfie…");
    try {
      const { extractDescriptors } = await import("@/lib/face");
      const faces = await extractDescriptors(file);
      if (faces.length === 0) {
        setError(
          "Não encontrei um rosto nessa imagem. Tente uma selfie de frente, bem iluminada."
        );
        setStatus("");
        return;
      }

      setStatus("Procurando você nas fotos…");
      const res = await fetch(`/api/g/${slug}/face-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor: faces[0] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro na busca.");
      onFilter(new Set(data.photoIds));
    } catch (err) {
      setError(err.message || "Erro ao processar a imagem.");
    }
    setStatus("");
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 px-5 py-4">
      <div className="mr-auto">
        <p className="font-semibold">Ache suas fotos</p>
        <p className="text-sm text-zinc-400">
          {matches
            ? `Mostrando ${shownCount} foto${shownCount === 1 ? "" : "s"} com você.`
            : "Envie uma selfie para ver só as fotos em que você aparece — a análise acontece no seu navegador, nada é guardado."}
        </p>
        {status && <p className="mt-1 text-sm text-yellow-400">{status}</p>}
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      </div>

      {matches ? (
        <button
          onClick={() => onFilter(null)}
          className="flex items-center gap-2 rounded-full border border-zinc-600 px-5 py-2.5 text-sm font-semibold hover:border-zinc-400"
        >
          <XIcon size={15} /> Ver todas
        </button>
      ) : (
        <label
          className={`cursor-pointer rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-yellow-300 ${
            status ? "pointer-events-none opacity-60" : ""
          }`}
        >
          Enviar selfie
          <input
            type="file"
            accept="image/*"
            capture="user"
            onChange={onPickSelfie}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}

// Galeria vista pelo cliente: grade, lightbox, favoritar, baixar em alta e
// (se ligado) achar as próprias fotos por selfie.
export default function GalleryViewer({
  slug,
  title,
  clientName,
  downloadEnabled,
  allowFavorites,
  faceSearch,
  photos,
}) {
  const [favs, setFavs] = useState(() => {
    const m = {};
    for (const p of photos) m[p.id] = p.favorited;
    return m;
  });
  const [open, setOpen] = useState(null); // índice no lightbox
  const [matches, setMatches] = useState(null); // Set de ids ou null

  // Grade e lightbox trabalham sobre a lista filtrada pela selfie.
  const shown = matches ? photos.filter((p) => matches.has(p.id)) : photos;

  function applyFilter(ids) {
    setMatches(ids);
    setOpen(null); // índices do lightbox mudam junto com a lista
  }

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
        i === null ? i : (i + delta + shown.length) % shown.length
      ),
    [shown.length]
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
  const current = open === null ? null : shown[open];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {title}
          </h1>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-zinc-400">
            {clientName ? `${clientName} · ` : ""}
            {photos.length} foto{photos.length === 1 ? "" : "s"}
            {allowFavorites && favCount > 0 && (
              <>
                {` · ${favCount} favorita${favCount === 1 ? "" : "s"}`}
                <StarIcon size={14} filled className="text-yellow-400" />
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {downloadEnabled && photos.length > 0 && (
            <a
              href={`/api/g/${slug}/download-all`}
              className="flex items-center gap-1.5 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-yellow-300"
            >
              <DownloadIcon size={16} /> Baixar todas
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

      {faceSearch && photos.length > 0 && (
        <SelfieFinder
          slug={slug}
          matches={matches}
          shownCount={shown.length}
          onFilter={applyFilter}
        />
      )}

      {photos.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-500">
          O fotógrafo ainda não subiu as fotos desta galeria.
        </p>
      ) : shown.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-500">
          Não achamos fotos com você — tente outra selfie, de frente e bem
          iluminada, ou toque em &ldquo;Ver todas&rdquo;.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((p, i) => (
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
                    className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
                  >
                    <HeartIcon
                      size={16}
                      filled={!!favs[p.id]}
                      className={favs[p.id] ? "text-red-500" : ""}
                    />
                  </button>
                )}
                {downloadEnabled && (
                  <a
                    href={downloadHref(p.id)}
                    title="Baixar em alta"
                    className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
                  >
                    <DownloadIcon size={16} />
                  </a>
                )}
              </div>
              {allowFavorites && favs[p.id] && (
                <span className="absolute left-1.5 top-1.5 text-red-500">
                  <HeartIcon size={15} filled />
                </span>
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
              {open + 1} / {shown.length}
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
                <HeartIcon
                  size={16}
                  filled={!!favs[current.id]}
                  className={favs[current.id] ? "text-red-500" : ""}
                />
                {favs[current.id] ? "Favoritada" : "Favoritar"}
              </button>
            )}
            {downloadEnabled && (
              <a
                href={downloadHref(current.id)}
                className="flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-2 text-sm font-semibold text-zinc-950 hover:bg-yellow-300"
              >
                <DownloadIcon size={16} /> Baixar em alta
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
