"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { field, label, primaryButton } from "@/components/ui";
import CityPicker from "@/components/CityPicker";
import { CATEGORIES } from "@/lib/categories";

export default function EventForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

      {error && <p className="text-sm text-red-400">{error}</p>}
      <button disabled={submitting} className={`${primaryButton} w-full`}>
        {submitting ? "Criando…" : "Criar evento"}
      </button>
    </form>
  );
}
