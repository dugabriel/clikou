"use client";

import { useUploader } from "@/components/UploadManager";

// Botão de seleção de fotos da galeria de entrega. Só enfileira no
// gerenciador global (UploadManager): o envio roda em segundo plano com o
// progresso no cartão flutuante, e continua mesmo saindo desta tela.
export default function GalleryUploader({ galleryId, galleryTitle, indexFaces }) {
  const uploader = useUploader();

  function onSelect(e) {
    const files = [...e.target.files];
    e.target.value = "";
    if (files.length === 0) return;
    uploader.enqueue({
      endpoint: `/api/galleries/${galleryId}/photos`,
      files,
      label: galleryTitle,
      indexFaces,
    });
  }

  return (
    <label className="cursor-pointer rounded-lg bg-yellow-400 px-5 py-2.5 font-semibold text-zinc-950 hover:bg-yellow-300">
      Selecionar fotos
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={onSelect}
        className="hidden"
      />
    </label>
  );
}
