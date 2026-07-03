"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FormTaxa({ usuarioId, taxaAtual, taxaPadrao }) {
  const router = useRouter();
  const [valor, setValor] = useState(taxaAtual ?? "");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(false);

  const alterado = String(valor) !== String(taxaAtual ?? "");

  async function salvar(e) {
    e.preventDefault();
    setEnviando(true);
    setErro(false);
    const res = await fetch(`/api/admin/fotografos/${usuarioId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comissaoPorcento: valor === "" ? null : valor }),
    });
    setEnviando(false);
    if (!res.ok) {
      setErro(true);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="flex items-center gap-1.5">
      <div className="relative">
        <input
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          inputMode="decimal"
          placeholder={String(taxaPadrao)}
          title="Taxa de comissão (%)"
          className={`w-20 rounded-lg border bg-zinc-950/60 px-3 py-1.5 pr-7 text-right text-sm outline-none transition focus:border-yellow-400/60 ${
            erro ? "border-red-500/60" : "border-white/10"
          } ${taxaAtual == null && !alterado ? "text-zinc-500" : ""}`}
        />
        <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-zinc-500">
          %
        </span>
      </div>
      {alterado && (
        <button
          disabled={enviando}
          className="rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-yellow-300 disabled:pointer-events-none disabled:opacity-50"
        >
          {enviando ? "…" : "Salvar"}
        </button>
      )}
    </form>
  );
}
