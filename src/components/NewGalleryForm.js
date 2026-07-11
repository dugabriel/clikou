"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Cria uma entrega em dois passos: primeiro nome/cliente, depois as opções
// da galeria (PIN, expiração, download, favoritos, marca d'água). Só então a
// galeria nasce e o fotógrafo cai na tela de upload — assim as fotos já
// entram com a configuração certa (a marca d'água só vale para fotos
// enviadas depois de ativada).
export default function NewGalleryForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [pin, setPin] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [downloadEnabled, setDownloadEnabled] = useState(true);
  const [allowFavorites, setAllowFavorites] = useState(true);
  const [watermarkPreviews, setWatermarkPreviews] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (step === 1) {
      if (!title.trim()) return;
      setStep(2);
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/galleries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        clientName,
        pin: pin.replace(/\D/g, "").slice(0, 8),
        expiresAt: expiresAt || null,
        downloadEnabled,
        allowFavorites,
        watermarkPreviews,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Erro ao criar galeria.");
      setSubmitting(false);
      return;
    }
    router.push(`/dashboard/galleries/${data.id}`);
  }

  const input =
    "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-yellow-400";
  const checkbox =
    "h-4 w-4 rounded border-zinc-600 bg-zinc-900 accent-yellow-400";

  return (
    <form
      onSubmit={submit}
      className="mt-6 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-6"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Nova entrega — passo {step} de 2
      </p>

      {step === 1 ? (
        <div className="mt-3 flex flex-wrap items-end gap-4">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1 block text-sm text-zinc-400">
              Nome da galeria
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Casamento Ana &amp; João"
              className={input}
            />
          </div>
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-sm text-zinc-400">
              Cliente (opcional)
            </label>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex.: Ana Duarte"
              className={input}
            />
          </div>
          <button
            disabled={!title.trim()}
            className="rounded-lg bg-yellow-400 px-5 py-2.5 font-semibold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50"
          >
            Continuar
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <h3 className="font-semibold">Opções da galeria</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Configure antes de subir as fotos — a marca d&apos;água, por
            exemplo, só vale para fotos enviadas depois de ativada. Dá para
            mudar tudo depois nas opções da galeria.
          </p>

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
                className={input}
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
                className={input}
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
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium hover:border-zinc-500"
            >
              ← Voltar
            </button>
            <button
              disabled={submitting}
              className="rounded-lg bg-yellow-400 px-5 py-2.5 font-semibold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50"
            >
              {submitting ? "Criando…" : "Criar galeria e subir fotos"}
            </button>
          </div>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </form>
  );
}
