"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { primaryButton, secondaryButton } from "@/components/ui";
import { trackEvent } from "@/lib/analytics";

const PLAN_VALUE = { monthly: 49, annual: 490 };

export default function PlanActions({ pro }) {
  const router = useRouter();
  const params = useSearchParams();
  const [cycle, setCycle] = useState("monthly");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // O MP redireciona de volta com ?sub=ok após autorizar — conversão real.
  useEffect(() => {
    if (params.get("sub") === "ok") {
      trackEvent("subscribe", { currency: "BRL" });
    }
  }, [params]);

  async function subscribe() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cycle }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Não foi possível assinar agora.");
      return;
    }
    // Modo dev devolve uma rota interna; o MP real devolve o init_point (http).
    if (data.url?.startsWith("http")) {
      window.location.href = data.url;
    } else {
      // Modo dev: virou Pro na hora — conta a conversão aqui (o retorno real
      // ?sub=ok cobre o fluxo do MP).
      trackEvent("subscribe", {
        currency: "BRL",
        value: PLAN_VALUE[cycle],
        cycle,
      });
      router.refresh();
    }
  }

  async function cancel() {
    if (!confirm("Cancelar o Pro? Você volta a pagar comissão nas vendas.")) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/billing", { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao cancelar.");
      return;
    }
    router.refresh();
  }

  if (pro) {
    return (
      <div className="mt-6">
        <button onClick={cancel} disabled={busy} className={secondaryButton}>
          {busy ? "Processando…" : "Cancelar assinatura"}
        </button>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="mb-4 inline-flex rounded-full border border-white/10 bg-zinc-950/60 p-1 text-sm">
        {[
          ["monthly", "Mensal · R$ 49"],
          ["annual", "Anual · R$ 490"],
        ].map(([value, text]) => (
          <button
            key={value}
            type="button"
            onClick={() => setCycle(value)}
            className={`rounded-full px-4 py-1.5 font-medium transition ${
              cycle === value
                ? "bg-yellow-400 text-zinc-950"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {text}
          </button>
        ))}
      </div>
      <button onClick={subscribe} disabled={busy} className={`${primaryButton} w-full`}>
        {busy
          ? "Processando…"
          : cycle === "annual"
            ? "Assinar Pro anual — 14 dias grátis"
            : "Assinar Pro — 14 dias grátis"}
      </button>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
