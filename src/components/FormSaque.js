"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { campo, rotulo, botaoPrimario } from "@/components/ui";

export default function FormSaque({ chavePixSalva }) {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    setOk(false);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/saques", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        valor: form.get("valor"),
        chavePix: form.get("chavePix"),
      }),
    });
    const dados = await res.json();
    setEnviando(false);
    if (!res.ok) {
      setErro(dados.erro || "Erro ao solicitar saque.");
      return;
    }
    setOk(true);
    e.target.reset();
    router.refresh();
  }

  return (
    <form onSubmit={enviar} className="mt-8 space-y-5">
      <div>
        <label className={rotulo}>Valor do saque (R$)</label>
        <input
          name="valor"
          required
          inputMode="decimal"
          placeholder="Mínimo R$ 20,00"
          className={campo}
        />
      </div>
      <div>
        <label className={rotulo}>Chave Pix</label>
        <input
          name="chavePix"
          required
          defaultValue={chavePixSalva}
          placeholder="CPF, e-mail, telefone ou chave aleatória"
          className={campo}
        />
      </div>
      {erro && <p className="text-sm text-red-400">{erro}</p>}
      {ok && (
        <p className="text-sm text-emerald-400">
          Saque solicitado! O pagamento cai na sua conta em até 2 dias úteis.
        </p>
      )}
      <button disabled={enviando} className={`${botaoPrimario} w-full`}>
        {enviando ? "Enviando…" : "Solicitar saque via Pix"}
      </button>
    </form>
  );
}
