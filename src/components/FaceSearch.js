"use client";

import { useState } from "react";
import { XIcon } from "@/components/Icons";

export default function FaceSearch({ eventId, onFilter, filterActive }) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function onPick(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");
    setStatus("Analisando sua selfie…");
    try {
      const { extractDescriptors } = await import("@/lib/face");
      const faces = await extractDescriptors(file);
      if (faces.length === 0) {
        setError(
          "Não encontrei um rosto nessa imagem. Tente uma selfie de frente, bem iluminada."
        );
        setStatus("");
        return;
      }

      setStatus("Procurando você nas fotos do evento…");
      const res = await fetch(`/api/events/${eventId}/face-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor: faces[0] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro na busca.");
      onFilter(data.photoIds);
    } catch (err) {
      setError(err.message || "Erro ao processar a imagem.");
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
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      </div>

      {filterActive ? (
        <button
          onClick={() => onFilter(null)}
          className="flex items-center gap-2 rounded-full border border-zinc-600 px-5 py-2.5 text-sm font-semibold hover:border-zinc-400"
        >
          <XIcon size={15} /> Limpar filtro
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
            onChange={onPick}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
