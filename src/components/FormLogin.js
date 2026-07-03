"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import BotaoGoogle from "@/components/BotaoGoogle";
import { MarcaIcone } from "@/components/Logo";
import { campo, rotulo, botaoPrimario, cartao } from "@/components/ui";

export default function FormLogin() {
  const params = useSearchParams();
  const voltar = params.get("voltar");
  const [erro, setErro] = useState(
    params.get("erro") === "google"
      ? "Não foi possível entrar com o Google. Tente de novo."
      : params.get("erro") === "verificacao"
        ? "Link de confirmação inválido ou expirado. Entre com e-mail e senha para receber um novo."
        : ""
  );
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        senha: form.get("senha"),
      }),
    });
    const dados = await res.json();
    if (!res.ok) {
      setErro(dados.erro || "Erro ao entrar.");
      setEnviando(false);
      return;
    }
    window.location.href = voltar || "/eventos";
  }

  return (
    <div className="relative mx-auto max-w-md px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl"
      />

      <div className={cartao}>
        <MarcaIcone tamanho={40} />
        <h1 className="font-display mt-5 text-3xl font-bold tracking-tight">
          Bem-vindo de volta
        </h1>
        <p className="mt-1.5 text-sm text-zinc-400">
          Entre para comprar suas fotos ou vender as que você fez.
        </p>

        <div className="mt-7">
          <BotaoGoogle voltar={voltar || ""} />
        </div>
        <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-zinc-600">
          <span className="h-px flex-1 bg-white/10" />
          ou com e-mail
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={enviar} className="space-y-5">
          <div>
            <label className={rotulo}>E-mail</label>
            <input
              name="email"
              type="email"
              required
              placeholder="voce@email.com"
              className={campo}
            />
          </div>
          <div>
            <label className={rotulo}>Senha</label>
            <input
              name="senha"
              type="password"
              required
              placeholder="••••••••"
              className={campo}
            />
          </div>
          {erro && <p className="text-sm text-red-400">{erro}</p>}
          <button disabled={enviando} className={`${botaoPrimario} w-full`}>
            {enviando ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Não tem conta?{" "}
          <Link
            href={
              voltar
                ? `/cadastro?voltar=${encodeURIComponent(voltar)}`
                : "/cadastro"
            }
            className="font-medium text-yellow-400 hover:underline"
          >
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  );
}
