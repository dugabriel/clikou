"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewGalleryForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/galleries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, clientName }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Erro ao criar galeria.");
      setSubmitting(false);
      return;
    }
    router.push(`/dashboard/galleries/${data.id}`);
  }

  return (
    <form
      onSubmit={submit}
      className="mt-6 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-6"
    >
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-sm text-zinc-400">
            Nome da galeria
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Casamento Ana &amp; João"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-yellow-400"
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
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-yellow-400"
          />
        </div>
        <button
          disabled={submitting || !title.trim()}
          className="rounded-lg bg-yellow-400 px-5 py-2.5 font-semibold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50"
        >
          {submitting ? "Criando…" : "Criar galeria"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </form>
  );
}
