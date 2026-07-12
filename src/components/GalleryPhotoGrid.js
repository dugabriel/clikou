"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StarIcon } from "@/components/Icons";

// Quantas exclusões em paralelo no modo seleção múltipla.
const DELETE_CHUNK = 5;

// Grade de gestão das fotos: favoritas do cliente, carrossel em tela cheia
// e exclusão — uma a uma (X/carrossel) ou várias de uma vez no modo
// "Selecionar", estilo Google Photos.
export default function GalleryPhotoGrid({ galleryId, photos }) {
  const router = useRouter();
  const [busy, setBusy] = useState(null);
  const [open, setOpen] = useState(null); // índice no carrossel
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [removing, setRemoving] = useState(false);
  const [notice, setNotice] = useState("");

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

  function toggleSelect(pid) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else next.add(pid);
      return next;
    });
  }

  function exitSelecting() {
    setSelecting(false);
    setSelected(new Set());
  }

  async function removeSelected() {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (
      !confirm(
        `Remover ${ids.length} foto${ids.length > 1 ? "s" : ""} da galeria?`
      )
    ) {
      return;
    }
    setRemoving(true);
    setNotice("");
    let failed = 0;
    for (let i = 0; i < ids.length; i += DELETE_CHUNK) {
      await Promise.all(
        ids.slice(i, i + DELETE_CHUNK).map(async (pid) => {
          const res = await fetch(`/api/galleries/${galleryId}/photos/${pid}`, {
            method: "DELETE",
          });
          if (!res.ok) failed++;
        })
      );
    }
    setRemoving(false);
    exitSelecting();
    setOpen(null);
    if (failed > 0) {
      setNotice(
        `${failed} foto${failed > 1 ? "s" : ""} não ${failed > 1 ? "puderam" : "pôde"} ser removida${failed > 1 ? "s" : ""}. Tente de novo.`
      );
    }
    router.refresh();
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
      <p className="mt-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 px-6 py-10 text-center text-sm text-zinc-500">
        Nenhuma foto ainda — clique em &ldquo;Selecionar fotos&rdquo; para
        começar.
      </p>
    );
  }

  // O refresh pós-exclusão encolhe a lista; o índice clampado evita abrir
  // uma posição que já não existe.
  const current =
    open === null ? null : photos[Math.min(open, photos.length - 1)];

  return (
    <>
      {/* Barra de seleção múltipla */}
      <div className="mt-4 flex min-h-9 flex-wrap items-center justify-between gap-3">
        {selecting ? (
          <>
            <span className="text-sm text-zinc-400">
              {selected.size} selecionada{selected.size === 1 ? "" : "s"} —
              toque nas fotos para marcar
            </span>
            <div className="flex gap-2">
              <button
                onClick={removeSelected}
                disabled={removing || selected.size === 0}
                className="rounded-lg border border-red-500/50 px-4 py-1.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
              >
                {removing ? "Removendo…" : `Excluir (${selected.size})`}
              </button>
              <button
                onClick={exitSelecting}
                disabled={removing}
                className="rounded-lg border border-zinc-700 px-4 py-1.5 text-sm font-medium text-zinc-300 hover:border-zinc-500 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="text-sm text-red-400">{notice}</span>
            <button
              onClick={() => setSelecting(true)}
              className="rounded-lg border border-zinc-700 px-4 py-1.5 text-sm font-medium text-zinc-300 hover:border-zinc-500"
            >
              Selecionar
            </button>
          </>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {photos.map((p, i) => {
          const isSelected = selected.has(p.id);
          return (
            <div
              key={p.id}
              className={`group relative overflow-hidden rounded-lg border ${
                isSelected ? "border-yellow-400" : "border-zinc-800"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src(p.id)}
                alt="Foto da galeria"
                loading="lazy"
                onClick={() =>
                  selecting ? toggleSelect(p.id) : setOpen(i)
                }
                className={`aspect-square w-full cursor-pointer object-cover transition ${
                  selecting
                    ? isSelected
                      ? "opacity-100"
                      : "opacity-60"
                    : "cursor-zoom-in"
                }`}
              />
              {selecting && (
                <span
                  className={`pointer-events-none absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold ${
                    isSelected
                      ? "bg-yellow-400 text-zinc-950"
                      : "border-2 border-white/70 bg-black/30"
                  }`}
                >
                  {isSelected ? "✓" : ""}
                </span>
              )}
              {!selecting && p.favorited && (
                <span className="pointer-events-none absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-yellow-400">
                  <StarIcon size={14} filled />
                </span>
              )}
              {!selecting && (
                <button
                  onClick={() => remove(p.id)}
                  disabled={busy === p.id}
                  title="Remover foto"
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-500 disabled:opacity-50"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      {current && !selecting && (
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
