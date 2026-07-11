"use client";

import { useUploader } from "@/components/UploadManager";

// Sobe fotos para uma galeria de entrega. A seleção só enfileira no
// gerenciador global (UploadManager): o envio roda em segundo plano com o
// progresso no cartão flutuante, e continua mesmo saindo desta tela.
export default function GalleryUploader({ galleryId, galleryTitle }) {
  const uploader = useUploader();

  function onSelect(e) {
    const files = [...e.target.files];
    e.target.value = "";
    if (files.length === 0) return;
    uploader.enqueue({ galleryId, files, label: galleryTitle });
  }

  return (
    <div className="mt-6 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-6">
      <div className="flex flex-wrap items-center gap-4">
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
        <p className="text-sm text-zinc-500">
          O envio continua em segundo plano — acompanhe no cartão no canto da
          tela e navegue à vontade, só não feche a aba. O cliente vê as fotos
          em alta e baixa direto — sem marca d&apos;água, a menos que você
          tenha ativado a prova protegida.
        </p>
      </div>
    </div>
  );
}
