"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AcoesSaque({ saqueId }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function agir(acao) {
    if (
      acao === "recusar" &&
      !confirm("Recusar o saque e devolver o valor à carteira do fotógrafo?")
    ) {
      return;
    }
    setEnviando(true);
    setErro("");
    const res = await fetch(`/api/admin/saques/${saqueId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao }),
    });
    if (!res.ok) {
      const dados = await res.json().catch(() => ({}));
      setErro(dados.erro || "Erro ao processar.");
      setEnviando(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {erro && <span className="text-xs text-red-400">{erro}</span>}
      <button
        disabled={enviando}
        onClick={() => agir("pagar")}
        className="rounded-full bg-emerald-500/15 px-4 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/25 disabled:pointer-events-none disabled:opacity-50"
      >
        Marcar pago
      </button>
      <button
        disabled={enviando}
        onClick={() => agir("recusar")}
        className="rounded-full bg-red-500/15 px-4 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/25 disabled:pointer-events-none disabled:opacity-50"
      >
        Recusar
      </button>
    </div>
  );
}
