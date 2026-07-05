"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WithdrawalActions({ withdrawalId }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function act(action) {
    if (
      action === "reject" &&
      !confirm("Recusar o saque e devolver o valor à carteira do fotógrafo?")
    ) {
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/admin/withdrawals/${withdrawalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao processar.");
      setSubmitting(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-400">{error}</span>}
      <button
        disabled={submitting}
        onClick={() => act("pay")}
        className="rounded-full bg-emerald-500/15 px-4 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/25 disabled:pointer-events-none disabled:opacity-50"
      >
        Marcar pago
      </button>
      <button
        disabled={submitting}
        onClick={() => act("reject")}
        className="rounded-full bg-red-500/15 px-4 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/25 disabled:pointer-events-none disabled:opacity-50"
      >
        Recusar
      </button>
    </div>
  );
}
