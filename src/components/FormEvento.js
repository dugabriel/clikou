"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { campo, rotulo, botaoPrimario } from "@/components/ui";
import SeletorCidade from "@/components/SeletorCidade";
import { CATEGORIAS } from "@/lib/categorias";

export default function FormEvento() {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: form.get("titulo"),
        descricao: form.get("descricao"),
        data: form.get("data"),
        cidade: form.get("cidade"),
        estado: form.get("estado"),
        categoria: form.get("categoria"),
        precoPadrao: form.get("precoPadrao"),
      }),
    });
    const dados = await res.json();
    if (!res.ok) {
      setErro(dados.erro || "Erro ao criar evento.");
      setEnviando(false);
      return;
    }
    router.push(`/painel/eventos/${dados.id}`);
  }

  return (
    <form onSubmit={enviar} className="mt-8 space-y-5">
      <div>
        <label className={rotulo}>Nome do evento *</label>
        <input
          name="titulo"
          required
          placeholder="Ex.: Corrida Noturna de São Paulo 2026"
          className={campo}
        />
      </div>

      <div>
        <label className={rotulo}>Data</label>
        <input name="data" type="date" className={campo} />
      </div>

      <div>
        <label className={rotulo}>Categoria *</label>
        <select name="categoria" required defaultValue="" className={campo}>
          <option value="" disabled>
            Escolha a categoria
          </option>
          {CATEGORIAS.map((c) => (
            <option key={c.valor} value={c.valor}>
              {c.rotulo}
            </option>
          ))}
        </select>
      </div>

      <SeletorCidade />

      <div>
        <label className={rotulo}>Descrição</label>
        <textarea
          name="descricao"
          rows={3}
          placeholder="Detalhes que ajudem as pessoas a encontrarem o evento (opcional)"
          className={campo}
        />
      </div>

      <div>
        <label className={rotulo}>Preço padrão por foto (R$)</label>
        <input
          name="precoPadrao"
          defaultValue="10,00"
          inputMode="decimal"
          className={campo}
        />
        <p className="mt-1.5 text-xs text-zinc-500">
          Você pode ajustar o preço em cada envio de fotos.
        </p>
      </div>

      {erro && <p className="text-sm text-red-400">{erro}</p>}
      <button disabled={enviando} className={`${botaoPrimario} w-full`}>
        {enviando ? "Criando…" : "Criar evento"}
      </button>
    </form>
  );
}
