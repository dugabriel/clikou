"use client";

import { useState } from "react";
import { IconeX } from "@/components/Icones";

export default function BuscaRosto({ eventoId, aoFiltrar, filtroAtivo }) {
  const [status, setStatus] = useState("");
  const [erro, setErro] = useState("");

  async function aoEscolher(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;

    setErro("");
    setStatus("Analisando sua selfie…");
    try {
      const { extrairDescritores } = await import("@/lib/face");
      const rostos = await extrairDescritores(arquivo);
      if (rostos.length === 0) {
        setErro(
          "Não encontrei um rosto nessa imagem. Tente uma selfie de frente, bem iluminada."
        );
        setStatus("");
        return;
      }

      setStatus("Procurando você nas fotos do evento…");
      const res = await fetch(`/api/eventos/${eventoId}/busca-rosto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descritor: rostos[0] }),
      });
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.erro || "Erro na busca.");
      aoFiltrar(dados.fotoIds);
    } catch (err) {
      setErro(err.message || "Erro ao processar a imagem.");
    }
    setStatus("");
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 px-5 py-4">
      <div className="mr-auto">
        <p className="font-semibold">Ache suas fotos com uma selfie</p>
        <p className="text-sm text-zinc-400">
          A busca acontece no seu navegador e vale só para as fotos deste
          evento — sua selfie não é enviada nem guardada.
        </p>
        {status && <p className="mt-1 text-sm text-yellow-400">{status}</p>}
        {erro && <p className="mt-1 text-sm text-red-400">{erro}</p>}
      </div>

      {filtroAtivo ? (
        <button
          onClick={() => aoFiltrar(null)}
          className="flex items-center gap-2 rounded-full border border-zinc-600 px-5 py-2.5 text-sm font-semibold hover:border-zinc-400"
        >
          <IconeX tamanho={15} /> Limpar filtro
        </button>
      ) : (
        <label
          className={`cursor-pointer rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-yellow-300 ${
            status ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {status ? "Buscando…" : "Enviar selfie"}
          <input
            type="file"
            accept="image/*"
            capture="user"
            onChange={aoEscolher}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
