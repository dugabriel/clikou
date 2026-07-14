"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/currency";

// Quantas exclusões em paralelo no modo seleção múltipla.
const DELETE_CHUNK = 5;

// Grade de gestão das fotos do evento: carrossel em tela cheia, escolha da
// capa e exclusão — uma a uma (X/carrossel) ou várias de uma vez no modo
// "Selecionar", estilo Google Photos. Foto já vendida o servidor não deixa
// excluir (o comprador baixa por ela).
export default function EventPhotoGrid({ eventId, photos, coverId, promo }) {
  const router = useRouter();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(null); // índice no carrossel
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [removing, setRemoving] = useState(false);
  const [settingCover, setSettingCover] = useState(false);

  const src = (pid) => `/api/photos/${pid}/preview`;

  // A capa aparece no card da vitrine, no compartilhamento e no hero da
  // página pública do evento.
  async function setCover(pid) {
    setSettingCover(true);
    setError("");
    const res = await fetch(`/api/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cover: pid }),
    });
    setSettingCover(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Não foi possível definir a capa.");
      return;
    }
    router.refresh();
  }

  async function remove(pid) {
    if (!confirm("Remover esta foto do evento?")) return;
    setBusy(pid);
    setError("");
    const res = await fetch(`/api/events/${eventId}/photos/${pid}`, {
      method: "DELETE",
    });
    setBusy(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Não foi possível remover a foto.");
      return;
    }
    // No carrossel, fica na mesma posição (a próxima foto assume o lugar);
    // fecha se era a última que restava.
    setOpen((i) =>
      i === null || photos.length <= 1 ? null : Math.min(i, photos.length - 2)
    );
    router.refresh();
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
        `Remover ${ids.length} foto${ids.length > 1 ? "s" : ""} do evento?`
      )
    ) {
      return;
    }
    setRemoving(true);
    setError("");
    let sold = 0;
    let failed = 0;
    for (let i = 0; i < ids.length; i += DELETE_CHUNK) {
      await Promise.all(
        ids.slice(i, i + DELETE_CHUNK).map(async (pid) => {
          const res = await fetch(`/api/events/${eventId}/photos/${pid}`, {
            method: "DELETE",
          });
          if (res.status === 409) sold++;
          else if (!res.ok) failed++;
        })
      );
    }
    setRemoving(false);
    exitSelecting();
    setOpen(null);
    const parts = [];
    if (sold > 0) {
      parts.push(
        `${sold} já ${sold > 1 ? "foram vendidas e ficaram" : "foi vendida e ficou"} no evento (o comprador baixa por ela${sold > 1 ? "s" : ""})`
      );
    }
    if (failed > 0) {
      parts.push(
        `${failed} ${failed > 1 ? "falharam" : "falhou"} — tente de novo`
      );
    }
    setError(parts.length > 0 ? `${parts.join("; ")}.` : "");
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
            <span className="text-sm text-red-400">{error}</span>
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
                alt="Foto do evento"
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
              <p className="bg-zinc-900 px-2 py-1 text-center text-xs text-zinc-400">
                {promo ? "Grátis" : formatPrice(p.priceCents)}
              </p>
              {!selecting && p.id === coverId && (
                <span className="pointer-events-none absolute left-1.5 top-1.5 rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-950">
                  Capa
                </span>
              )}
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
            <span className="text-sm text-zinc-400">
              {Math.min(open, photos.length - 1) + 1} / {photos.length} ·{" "}
              {promo ? "Grátis" : formatPrice(current.priceCents)}
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
            className="flex flex-col items-center gap-2 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setCover(current.id)}
                disabled={settingCover || current.id === coverId}
                className="rounded-full border border-yellow-400/50 px-4 py-2 text-sm font-medium text-yellow-400 transition hover:bg-yellow-400/10 disabled:opacity-50"
              >
                {current.id === coverId
                  ? "É a capa do evento ✓"
                  : settingCover
                    ? "Definindo…"
                    : "Definir como capa"}
              </button>
              <button
                onClick={() => remove(current.id)}
                disabled={busy === current.id}
                className="rounded-full border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
              >
                {busy === current.id ? "Removendo…" : "Remover foto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
