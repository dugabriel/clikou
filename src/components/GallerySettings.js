"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Opções da galeria: cliente vinculado, PIN, expiração, download, favoritos,
// marca d'água na prova. Sem cartão nem título próprios — a página envolve
// num <details> recolhido, já que tudo isso é configurado na criação e
// raramente muda.
export default function GallerySettings({ gallery, clients = [] }) {
  const router = useRouter();
  const [clientId, setClientId] = useState(gallery.clientId || "");
  // Galeria antiga com cliente em texto livre: o "+ Novo cliente" já vem
  // preenchido com o que a galeria tem — vincular o legado vira 2 cliques.
  const [newClientName, setNewClientName] = useState(
    gallery.clientId ? "" : gallery.clientName || ""
  );
  const [newClientEmail, setNewClientEmail] = useState(
    gallery.clientId ? "" : gallery.clientEmail || ""
  );
  const [pin, setPin] = useState(gallery.pin);
  const [expiresAt, setExpiresAt] = useState(gallery.expiresAt);
  const [downloadEnabled, setDownloadEnabled] = useState(
    gallery.downloadEnabled
  );
  const [allowFavorites, setAllowFavorites] = useState(gallery.allowFavorites);
  const [watermarkPreviews, setWatermarkPreviews] = useState(
    gallery.watermarkPreviews
  );
  const [faceSearch, setFaceSearch] = useState(gallery.faceSearch);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    // "+ Novo cliente": cadastra no CRM primeiro e vincula em seguida.
    let linkedClientId = clientId === "__new" ? "" : clientId;
    if (clientId === "__new") {
      if (!newClientName.trim()) {
        setError("Informe o nome do cliente.");
        setSaving(false);
        return;
      }
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClientName, email: newClientEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Não foi possível cadastrar o cliente.");
        setSaving(false);
        return;
      }
      linkedClientId = data.id;
    }

    const res = await fetch(`/api/galleries/${gallery.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: linkedClientId,
        pin: pin.replace(/\D/g, "").slice(0, 8),
        expiresAt: expiresAt || null,
        downloadEnabled,
        allowFavorites,
        watermarkPreviews,
        faceSearch,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Não foi possível salvar.");
      return;
    }
    if (clientId === "__new") setClientId(linkedClientId);
    setSaved(true);
    router.refresh();
  }

  const checkbox =
    "h-4 w-4 rounded border-zinc-600 bg-zinc-900 accent-yellow-400";

  const input =
    "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-yellow-400";

  return (
    <form onSubmit={save}>
      <div className="mb-5">
        <label className="mb-1 block text-sm text-zinc-400">Cliente</label>
        <div className="grid gap-4 sm:grid-cols-2">
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className={input}
          >
            <option value="">Sem cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="__new">+ Novo cliente</option>
          </select>
          {clientId === "__new" && (
            <>
              <input
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Nome do cliente"
                className={input}
              />
              <input
                type="email"
                value={newClientEmail}
                onChange={(e) => setNewClientEmail(e.target.value)}
                placeholder="E-mail (opcional)"
                className={input}
              />
            </>
          )}
        </div>
        {!clientId && gallery.clientName && (
          <p className="mt-1 text-xs text-zinc-500">
            Esta galeria mostra &ldquo;{gallery.clientName}&rdquo; como
            cliente, mas sem vínculo com o cadastro — escolha &ldquo;+ Novo
            cliente&rdquo; para cadastrá-lo.
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
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
        <label className="flex items-center gap-2.5 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={faceSearch}
            onChange={(e) => setFaceSearch(e.target.checked)}
            className={checkbox}
          />
          Deixar quem recebeu se achar por selfie
        </label>
        <p className="pl-6 text-xs text-zinc-500">
          Vale para fotos enviadas com a opção ligada — a análise dos rostos
          acontece durante o upload.
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
      </div>
    </form>
  );
}

// Zona de perigo — apagar é irreversível, então fica num bloco separado e
// recolhido no fim da página.
export function GalleryDelete({ galleryId }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function remove() {
    if (
      !confirm("Apagar esta galeria e todas as fotos? Não dá para desfazer.")
    ) {
      return;
    }
    setDeleting(true);
    setDeleteError("");
    const res = await fetch(`/api/galleries/${galleryId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      // Sai da página da galeria apagada e revalida a lista.
      router.replace("/dashboard/galleries");
      router.refresh();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setDeleting(false);
    setDeleteError(data.error || "Não foi possível apagar a galeria.");
  }

  return (
    <div>
      <p className="text-sm text-zinc-400">
        Remove a galeria, todas as fotos e o link de entrega do cliente. Esta
        ação não pode ser desfeita.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={remove}
          disabled={deleting}
          className="rounded-lg border border-red-500/50 px-5 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
        >
          {deleting ? "Apagando…" : "Apagar galeria"}
        </button>
        {deleteError && (
          <span className="text-sm text-red-400">{deleteError}</span>
        )}
      </div>
    </div>
  );
}
