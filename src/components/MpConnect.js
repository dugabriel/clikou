"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Conexão da conta Mercado Pago do fotógrafo (split automático).
// `result` é o ?mp= da volta do OAuth (connected | denied | error).
export default function MpConnect({ connected, result }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function disconnect() {
    setBusy(true);
    await fetch("/api/mp/connect", { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold">Recebimento automático</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {connected
              ? "Conta Mercado Pago conectada: o valor das suas vendas (já descontada a taxa) cai direto nela, sem precisar de saque."
              : "Conecte sua conta Mercado Pago e receba cada venda na hora, direto nela — sem esperar saque."}
          </p>
        </div>
        {connected ? (
          <button
            onClick={disconnect}
            disabled={busy}
            className="shrink-0 rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
          >
            {busy ? "Desconectando…" : "Desconectar"}
          </button>
        ) : (
          <a
            href="/api/mp/connect"
            className="shrink-0 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-yellow-300"
          >
            Conectar Mercado Pago
          </a>
        )}
      </div>
      {connected && (
        <p className="mt-3 text-xs text-zinc-500">
          Compras que misturam fotos de outros fotógrafos ainda entram no seu
          saldo aqui e saem via saque Pix.
        </p>
      )}
      {result === "connected" && (
        <p className="mt-3 text-sm text-emerald-400">
          Conta conectada! Suas próximas vendas já caem direto no Mercado Pago.
        </p>
      )}
      {(result === "denied" || result === "error") && (
        <p className="mt-3 text-sm text-red-400">
          {result === "denied"
            ? "A autorização foi cancelada. Tente conectar de novo."
            : "Não foi possível conectar sua conta. Tente de novo em instantes."}
        </p>
      )}
    </div>
  );
}
