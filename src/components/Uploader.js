"use client";

import { useEffect, useState } from "react";
import { useUploader } from "@/components/UploadManager";

// Upload de fotos de evento: define o preço do lote e enfileira no
// gerenciador global (UploadManager) — o envio roda em segundo plano com a
// marca d'água aplicada no servidor e os rostos extraídos no navegador para
// a busca por selfie.
// promo: evento de divulgação — fotos gratuitas, sem campo de preço.
export default function Uploader({ eventId, eventTitle, defaultPrice, existing, promo }) {
  const uploader = useUploader();
  const [price, setPrice] = useState(defaultPrice);

  // Baixa os modelos de rosto agora, não na hora do primeiro envio.
  useEffect(() => {
    import("@/lib/face").then((m) => m.warmupFaceModels()).catch(() => {});
  }, []);

  function onSelect(e) {
    const files = [...e.target.files];
    e.target.value = "";
    if (files.length === 0) return;
    uploader.enqueue({
      endpoint: `/api/events/${eventId}/photos`,
      files,
      label: eventTitle,
      fields: promo ? {} : { price },
      indexFaces: true,
      existing,
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      {!promo && (
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
      )}
      <label className="cursor-pointer rounded-lg bg-yellow-400 px-5 py-2.5 font-semibold text-zinc-950 hover:bg-yellow-300">
        Selecionar fotos
        {/* .heic explícito: o iOS entrega o original sem transcodificar no
            seletor — a seleção de centenas de fotos deixa de travar. */}
        <input
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          onChange={onSelect}
          className="hidden"
        />
      </label>
    </div>
  );
}
