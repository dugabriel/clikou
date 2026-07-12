"use client";

import { useEffect, useRef, useState } from "react";
import { DownloadIcon } from "@/components/Icons";

// "Baixar todas" com ZIP pré-gerado no bucket: se já está pronto, o link
// baixa direto (URL assinada). Senão, um clique dispara o preparo no
// servidor (com cache e trava de concorrência) e o botão acompanha até o
// link ficar disponível na página.
export default function DownloadAllZip({ slug, initialReady }) {
  const [phase, setPhase] = useState(initialReady ? "ready" : "idle");
  const [error, setError] = useState("");
  const pollRef = useRef(null);

  useEffect(() => () => clearTimeout(pollRef.current), []);

  const href = `/api/g/${slug}/download-all`;

  async function prepare(fromPoll = false) {
    if (!fromPoll) {
      setPhase("preparing");
      setError("");
    }
    let res;
    try {
      res = await fetch(href, { method: "POST" });
    } catch {
      setPhase("idle");
      setError("Falha de rede — tente de novo.");
      return;
    }
    if (res.status === 202) {
      // Outro preparo em andamento (ex.: outra pessoa da galeria) — espera.
      pollRef.current = setTimeout(() => prepare(true), 5000);
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPhase("idle");
      setError(data.error || "Não foi possível preparar o ZIP.");
      return;
    }
    setPhase("ready");
    // Preparou agora? Já dispara o download — o link continua na página.
    if (!fromPoll || data.ready) window.location.href = href;
  }

  if (phase === "ready") {
    return (
      <a
        href={href}
        className="flex items-center gap-1.5 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-yellow-300"
      >
        <DownloadIcon size={16} /> Baixar todas (ZIP)
      </a>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={() => prepare()}
        disabled={phase === "preparing"}
        className="flex items-center gap-1.5 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-yellow-300 disabled:opacity-60"
      >
        {phase === "preparing" ? (
          <>
            <span
              aria-hidden
              className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950"
            />
            Preparando ZIP…
          </>
        ) : (
          <>
            <DownloadIcon size={16} /> Baixar todas
          </>
        )}
      </button>
      {phase === "preparing" && (
        <span className="text-xs text-zinc-500">
          Montando o arquivo — pode levar um minuto.
        </span>
      )}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
