"use client";

import { useState } from "react";
import { IconeCheck } from "@/components/Icones";

export default function BotaoCopiarLink({ caminho }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    const url = `${window.location.origin}${caminho}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback para contextos sem clipboard API (http)
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  return (
    <button
      onClick={copiar}
      className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
        copiado
          ? "bg-emerald-500 text-zinc-950"
          : "bg-yellow-400 text-zinc-950 hover:bg-yellow-300"
      }`}
    >
      {copiado ? (
        <>
          <IconeCheck tamanho={16} /> Link copiado!
        </>
      ) : (
        "Copiar link do evento"
      )}
    </button>
  );
}
