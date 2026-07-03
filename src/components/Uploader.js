"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Uploader({ eventoId, precoPadrao }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [preco, setPreco] = useState(precoPadrao);
  const [fila, setFila] = useState(null); // { total, feitas, erros: [] }

  async function enviarArquivos(e) {
    const arquivos = [...e.target.files];
    if (arquivos.length === 0) return;

    const estado = { total: arquivos.length, feitas: 0, erros: [] };
    setFila({ ...estado });

    for (const arquivo of arquivos) {
      const form = new FormData();
      form.append("arquivo", arquivo);
      form.append("preco", preco);
      // Extrai os rostos no navegador para habilitar a busca por selfie.
      // Se falhar (modelo não carregou etc.), a foto sobe sem busca facial.
      try {
        const { extrairDescritores } = await import("@/lib/face");
        const rostos = await extrairDescritores(arquivo);
        if (rostos.length > 0) {
          form.append("rostos", JSON.stringify(rostos.slice(0, 30)));
        }
      } catch {}
      try {
        const res = await fetch(`/api/eventos/${eventoId}/fotos`, {
          method: "POST",
          body: form,
        });
        if (!res.ok) {
          const dados = await res.json().catch(() => ({}));
          estado.erros.push(`${arquivo.name}: ${dados.erro || res.status}`);
        }
      } catch {
        estado.erros.push(`${arquivo.name}: falha de rede`);
      }
      estado.feitas++;
      setFila({ ...estado });
    }

    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  const enviando = fila && fila.feitas < fila.total;

  return (
    <div className="mt-6 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm text-zinc-400">
            Preço por foto neste envio (R$)
          </label>
          <input
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            inputMode="decimal"
            className="w-32 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-yellow-400"
          />
        </div>
        <label
          className={`cursor-pointer rounded-lg bg-yellow-400 px-5 py-2.5 font-semibold text-zinc-950 hover:bg-yellow-300 ${
            enviando ? "pointer-events-none opacity-50" : ""
          }`}
        >
          {enviando
            ? `Enviando ${fila.feitas + 1}/${fila.total}…`
            : "Selecionar fotos"}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={enviarArquivos}
            className="hidden"
          />
        </label>
        <p className="text-sm text-zinc-500">
          A marca d&apos;água é aplicada automaticamente e os rostos são
          detectados para a busca por selfie.
        </p>
      </div>

      {fila && (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-yellow-400 transition-all"
              style={{ width: `${(fila.feitas / fila.total) * 100}%` }}
            />
          </div>
          {!enviando && fila.erros.length === 0 && (
            <p className="mt-2 text-sm text-emerald-400">
              {fila.total} foto{fila.total > 1 ? "s" : ""} enviada
              {fila.total > 1 ? "s" : ""} com sucesso ✓
            </p>
          )}
          {fila.erros.map((erro) => (
            <p key={erro} className="mt-1 text-sm text-red-400">
              {erro}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
