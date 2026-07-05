"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { field, label, primaryButton } from "@/components/ui";

export default function WithdrawalForm({ savedPixKey }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setOk(false);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: form.get("amount"),
        pixKey: form.get("pixKey"),
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Erro ao solicitar saque.");
      return;
    }
    setOk(true);
    e.target.reset();
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      <div>
        <label className={label}>Valor do saque (R$)</label>
        <input
          name="amount"
          required
          inputMode="decimal"
          placeholder="Mínimo R$ 20,00"
          className={field}
        />
      </div>
      <div>
        <label className={label}>Chave Pix</label>
        <input
          name="pixKey"
          required
          defaultValue={savedPixKey}
          placeholder="CPF, e-mail, telefone ou chave aleatória"
          className={field}
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {ok && (
        <p className="text-sm text-emerald-400">
          Saque solicitado! O pagamento cai na sua conta em até 2 dias úteis.
        </p>
      )}
      <button disabled={submitting} className={`${primaryButton} w-full`}>
        {submitting ? "Enviando…" : "Solicitar saque via Pix"}
      </button>
    </form>
  );
}
