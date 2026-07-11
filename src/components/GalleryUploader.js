"use client";

import { useEffect } from "react";
import { useUploader } from "@/components/UploadManager";

// Botão de seleção de fotos da galeria de entrega. Só enfileira no
// gerenciador global (UploadManager): o envio roda em segundo plano com o
// progresso no cartão flutuante, e continua mesmo saindo desta tela.
// `existing` (nome + tamanho do que já está na galeria) faz o reenvio da
// mesma seleção pular o que já subiu.
export default function GalleryUploader({
  galleryId,
  galleryTitle,
  indexFaces,
  existing,
}) {
  const uploader = useUploader();

  // Baixa os modelos de rosto agora, não na hora do primeiro envio.
  useEffect(() => {
    if (!indexFaces) return;
    import("@/lib/face").then((m) => m.warmupFaceModels()).catch(() => {});
  }, [indexFaces]);

  function onSelect(e) {
    const files = [...e.target.files];
    e.target.value = "";
    if (files.length === 0) return;
    uploader.enqueue({
      endpoint: `/api/galleries/${galleryId}/photos`,
      files,
      label: galleryTitle,
      indexFaces,
      existing,
    });
  }

  return (
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
  );
}
