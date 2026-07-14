"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { field, label, primaryButton } from "@/components/ui";
import CityPicker from "@/components/CityPicker";
import { CATEGORIES } from "@/lib/categories";

export default function EventForm({ pro = false }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [promo, setPromo] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description"),
        date: form.get("date"),
        city: form.get("city"),
        state: form.get("state"),
        category: form.get("category"),
        defaultPrice: form.get("defaultPrice"),
        promo,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao criar evento.");
      setSubmitting(false);
      return;
    }
    router.push(`/dashboard/events/${data.id}`);
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      <div>
        <label className={label}>Nome do evento *</label>
        <input
          name="title"
          required
          placeholder="Ex.: Corrida Noturna de São Paulo 2026"
          className={field}
        />
      </div>

      <div>
        <label className={label}>Data</label>
        <input name="date" type="date" className={field} />
      </div>

      <div>
        <label className={label}>Categoria *</label>
        <select name="category" required defaultValue="" className={field}>
          <option value="" disabled>
            Escolha a categoria
          </option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <CityPicker />

      <div>
        <label className={label}>Descrição</label>
        <textarea
          name="description"
          rows={3}
          placeholder="Detalhes que ajudem as pessoas a encontrarem o evento (opcional)"
          className={field}
        />
      </div>

      {pro ? (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
          <input
            type="checkbox"
            checked={promo}
            onChange={(e) => setPromo(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-yellow-400"
          />
          <span className="text-sm">
            <span className="font-semibold">Evento de divulgação</span>
            <span className="ml-2 rounded-full bg-yellow-400/15 px-2 py-0.5 text-xs font-semibold text-yellow-400">
              Pro
            </span>
            <span className="mt-1 block text-zinc-400">
              Fotos gratuitas e sem marca d&apos;água — quem estava lá baixa de
              graça. A escolha não pode ser alterada depois.
            </span>
          </span>
        </label>
      ) : (
        <p className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-500">
          No plano{" "}
          <Link href="/dashboard/plan" className="text-yellow-400 hover:underline">
            Pro
          </Link>{" "}
          você também pode criar eventos de divulgação: fotos gratuitas e sem
          marca d&apos;água para promover sua cobertura.
        </p>
      )}

      {!promo && (
        <div>
          <label className={label}>Preço padrão por foto (R$)</label>
          <input
            name="defaultPrice"
            defaultValue="10,00"
            inputMode="decimal"
            className={field}
          />
          <p className="mt-1.5 text-xs text-zinc-500">
            Você pode ajustar o preço em cada envio de fotos.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
      <button disabled={submitting} className={`${primaryButton} w-full`}>
        {submitting ? "Criando…" : "Criar evento"}
      </button>
    </form>
  );
}
