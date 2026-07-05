"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Uploader({ eventId, defaultPrice }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [price, setPrice] = useState(defaultPrice);
  const [queue, setQueue] = useState(null); // { total, done, errors: [] }

  async function uploadFiles(e) {
    const files = [...e.target.files];
    if (files.length === 0) return;

    const state = { total: files.length, done: 0, errors: [] };
    setQueue({ ...state });

    for (const file of files) {
      const form = new FormData();
      form.append("file", file);
      form.append("price", price);
      // Extrai os rostos no navegador para habilitar a busca por selfie.
      // Se falhar (modelo não carregou etc.), a foto sobe sem busca facial.
      try {
        const { extractDescriptors } = await import("@/lib/face");
        const faces = await extractDescriptors(file);
        if (faces.length > 0) {
          form.append("faces", JSON.stringify(faces.slice(0, 30)));
        }
      } catch {}
      try {
        const res = await fetch(`/api/events/${eventId}/photos`, {
          method: "POST",
          body: form,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          state.errors.push(`${file.name}: ${data.error || res.status}`);
        }
      } catch {
        state.errors.push(`${file.name}: falha de rede`);
      }
      state.done++;
      setQueue({ ...state });
    }

    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  const uploading = queue && queue.done < queue.total;

  return (
    <div className="mt-6 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm text-zinc-400">
            Preço por foto neste envio (R$)
          </label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputMode="decimal"
            className="w-32 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-yellow-400"
          />
        </div>
        <label
          className={`cursor-pointer rounded-lg bg-yellow-400 px-5 py-2.5 font-semibold text-zinc-950 hover:bg-yellow-300 ${
            uploading ? "pointer-events-none opacity-50" : ""
          }`}
        >
          {uploading
            ? `Enviando ${queue.done + 1}/${queue.total}…`
            : "Selecionar fotos"}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={uploadFiles}
            className="hidden"
          />
        </label>
        <p className="text-sm text-zinc-500">
          A marca d&apos;água é aplicada automaticamente e os rostos são
          detectados para a busca por selfie.
        </p>
      </div>

      {queue && (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-yellow-400 transition-all"
              style={{ width: `${(queue.done / queue.total) * 100}%` }}
            />
          </div>
          {!uploading && queue.errors.length === 0 && (
            <p className="mt-2 text-sm text-emerald-400">
              {queue.total} foto{queue.total > 1 ? "s" : ""} enviada
              {queue.total > 1 ? "s" : ""} com sucesso ✓
            </p>
          )}
          {queue.errors.map((error) => (
            <p key={error} className="mt-1 text-sm text-red-400">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
