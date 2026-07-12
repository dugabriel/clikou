"use client";

import { useState } from "react";
import { XIcon } from "@/components/Icons";
import SearchingOverlay from "@/components/SearchingOverlay";

// Duas formas de achar fotos no evento: selfie (reconhecimento facial,
// roda no navegador) e print (imagem da própria foto, comparada no
// servidor por hash perceptual). Ambas filtram a galeria via onFilter.
export default function PhotoFinder({ eventId, onFilter, filterActive }) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function onPickSelfie(e) {
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
      onFilter(data.photoIds, "face");
    } catch (err) {
      setError(err.message || "Erro ao processar a imagem.");
    }
    setStatus("");
  }

  async function onPickPrint(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");
    setStatus("Comparando seu print com as fotos do evento…");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/events/${eventId}/photo-match`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro na busca.");
      onFilter(data.photoIds, "print");
    } catch (err) {
      setError(err.message || "Erro ao processar a imagem.");
    }
    setStatus("");
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 px-5 py-4">
      <SearchingOverlay message={status} />
      <div className="mr-auto">
        <p className="font-semibold">Ache suas fotos</p>
        <p className="text-sm text-zinc-400">
          Envie uma <strong>selfie</strong> para achar as fotos em que você
          aparece (a análise acontece no seu navegador, nada é guardado) ou um{" "}
          <strong>print</strong> de uma foto que te mandaram para localizá-la
          aqui.
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
        <div className={`flex gap-2 ${status ? "pointer-events-none opacity-60" : ""}`}>
          <label className="cursor-pointer rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-yellow-300">
            Enviar selfie
            <input
              type="file"
              accept="image/*"
              capture="user"
              onChange={onPickSelfie}
              className="hidden"
            />
          </label>
          <label className="cursor-pointer rounded-full border border-yellow-400/60 px-5 py-2.5 text-sm font-semibold text-yellow-400 transition hover:bg-yellow-400/10">
            Tenho um print
            <input type="file" accept="image/*" onChange={onPickPrint} className="hidden" />
          </label>
        </div>
      )}
    </div>
  );
}
