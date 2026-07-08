"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Opções da galeria: PIN, expiração, download, favoritos, marca d'água na
// prova. Salva via PATCH; também apaga a galeria.
export default function GallerySettings({ gallery }) {
  const router = useRouter();
  const [pin, setPin] = useState(gallery.pin);
  const [expiresAt, setExpiresAt] = useState(gallery.expiresAt);
  const [downloadEnabled, setDownloadEnabled] = useState(
    gallery.downloadEnabled
  );
  const [allowFavorites, setAllowFavorites] = useState(gallery.allowFavorites);
  const [watermarkPreviews, setWatermarkPreviews] = useState(
    gallery.watermarkPreviews
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    const res = await fetch(`/api/galleries/${gallery.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pin: pin.replace(/\D/g, "").slice(0, 8),
        expiresAt: expiresAt || null,
        downloadEnabled,
        allowFavorites,
        watermarkPreviews,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Não foi possível salvar.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Apagar esta galeria e todas as fotos? Não dá para desfazer.")) {
      return;
    }
    const res = await fetch(`/api/galleries/${gallery.id}`, {
      method: "DELETE",
    });
    if (res.ok) router.push("/dashboard/galleries");
  }

  const checkbox =
    "h-4 w-4 rounded border-zinc-600 bg-zinc-900 accent-yellow-400";

  return (
    <form
      onSubmit={save}
      className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6"
    >
      <h3 className="font-semibold">Opções da galeria</h3>

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-zinc-400">
            PIN de acesso (opcional)
          </label>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            inputMode="numeric"
            placeholder="Ex.: 1234"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-yellow-400"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Vazio = só o link basta. Com PIN, o cliente precisa digitá-lo.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">
            Expira em (opcional)
          </label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-yellow-400"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Depois da data o link deixa de funcionar.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <label className="flex items-center gap-2.5 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={downloadEnabled}
            onChange={(e) => setDownloadEnabled(e.target.checked)}
            className={checkbox}
          />
          Permitir download em alta
        </label>
        <label className="flex items-center gap-2.5 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={allowFavorites}
            onChange={(e) => setAllowFavorites(e.target.checked)}
            className={checkbox}
          />
          Deixar o cliente favoritar fotos
        </label>
        <label className="flex items-center gap-2.5 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={watermarkPreviews}
            onChange={(e) => setWatermarkPreviews(e.target.checked)}
            className={checkbox}
          />
          Marca d&apos;água na visualização (prova antes do pagamento)
        </label>
        <p className="pl-6 text-xs text-zinc-500">
          A marca vale para fotos enviadas depois de marcar esta opção. O
          download em alta é sempre sem marca.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          disabled={saving}
          className="rounded-lg bg-yellow-400 px-5 py-2.5 font-semibold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50"
        >
          {saving ? "Salvando…" : "Salvar opções"}
        </button>
        {saved && <span className="text-sm text-emerald-400">Salvo ✓</span>}
        {error && <span className="text-sm text-red-400">{error}</span>}
        <button
          type="button"
          onClick={remove}
          className="ml-auto text-sm text-red-400 hover:underline"
        >
          Apagar galeria
        </button>
      </div>
    </form>
  );
}
