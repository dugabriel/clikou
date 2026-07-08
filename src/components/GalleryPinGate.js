"use client";

import { useState } from "react";
import { BrandIcon } from "@/components/Logo";

// Portão de PIN da galeria de entrega. Ao acertar, o servidor grava o cookie
// de acesso e recarregamos a página.
export default function GalleryPinGate({ slug, title }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/g/${slug}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "PIN incorreto.");
      setSubmitting(false);
      return;
    }
    window.location.reload();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-24 text-center">
      <BrandIcon size={40} />
      <h1 className="font-display mt-5 text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Esta galeria é protegida. Digite o PIN que o fotógrafo enviou.
      </p>
      <form onSubmit={submit} className="mt-6">
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          inputMode="numeric"
          autoFocus
          placeholder="PIN"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-center text-lg tracking-widest outline-none focus:border-yellow-400"
        />
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button
          disabled={submitting || !pin.trim()}
          className="mt-4 w-full rounded-lg bg-yellow-400 px-5 py-3 font-semibold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50"
        >
          {submitting ? "Verificando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
