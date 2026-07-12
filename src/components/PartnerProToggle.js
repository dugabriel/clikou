"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Liga/desliga o Pro de parceria de um fotógrafo (admin). Assinatura paga
// (vencimento futuro) só aparece como badge — quem gerencia é o Mercado
// Pago. `status` vem calculado do servidor: "paid" | "partner" | "free".
export default function PartnerProToggle({ userId, status }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const paid = status === "paid";
  const partner = status === "partner";

  async function setPartnerPro(next) {
    const question = next
      ? "Tornar este fotógrafo Pro por parceria (sem cobrança, sem vencimento)?"
      : "Remover o Pro de parceria deste fotógrafo? Ele volta ao plano grátis.";
    if (!confirm(question)) return;
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/admin/photographers/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerPro: next }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Não foi possível alterar o plano.");
      return;
    }
    router.refresh();
  }

  if (paid) {
    return (
      <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">
        Pro · assinatura
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {partner ? (
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-yellow-400/15 px-3 py-1 text-xs font-semibold text-yellow-400">
            Pro · parceria
          </span>
          <button
            onClick={() => setPartnerPro(false)}
            disabled={submitting}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-50"
          >
            {submitting ? "…" : "Remover"}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setPartnerPro(true)}
          disabled={submitting}
          className="rounded-lg border border-yellow-400/40 px-3 py-1.5 text-xs font-semibold text-yellow-400 transition hover:bg-yellow-400/10 disabled:opacity-50"
        >
          {submitting ? "…" : "Tornar Pro (parceria)"}
        </button>
      )}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
