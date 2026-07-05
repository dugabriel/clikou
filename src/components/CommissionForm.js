"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CommissionForm({ userId, currentRate, defaultRate }) {
  const router = useRouter();
  const [value, setValue] = useState(currentRate ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const changed = String(value) !== String(currentRate ?? "");

  async function save(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    const res = await fetch(`/api/admin/photographers/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commissionPercent: value === "" ? null : value }),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(true);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={save} className="flex items-center gap-1.5">
      <div className="relative">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="decimal"
          placeholder={String(defaultRate)}
          title="Taxa de comissão (%)"
          className={`w-20 rounded-lg border bg-zinc-950/60 px-3 py-1.5 pr-7 text-right text-sm outline-none transition focus:border-yellow-400/60 ${
            error ? "border-red-500/60" : "border-white/10"
          } ${currentRate == null && !changed ? "text-zinc-500" : ""}`}
        />
        <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-zinc-500">
          %
        </span>
      </div>
      {changed && (
        <button
          disabled={submitting}
          className="rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-yellow-300 disabled:pointer-events-none disabled:opacity-50"
        >
          {submitting ? "…" : "Salvar"}
        </button>
      )}
    </form>
  );
}
