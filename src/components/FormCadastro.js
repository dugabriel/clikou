"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import BotaoGoogle from "@/components/BotaoGoogle";
import { MarcaIcone } from "@/components/Logo";
import { campo, rotulo, botaoPrimario, cartao } from "@/components/ui";

export default function FormCadastro() {
  const params = useSearchParams();
  const voltar = params.get("voltar");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [desafio, setDesafio] = useState(null); // { pergunta, token }
  const [emailEnviado, setEmailEnviado] = useState("");

  async function carregarCaptcha() {
    setDesafio(null);
    try {
      const res = await fetch("/api/captcha");
      setDesafio(await res.json());
    } catch {
      setErro("Não foi possível carregar a verificação. Recarregue a página.");
    }
  }

  useEffect(() => {
    carregarCaptcha();
  }, []);

  async function enviar(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    if (form.get("senha") !== form.get("confirmarSenha")) {
      setErro("As senhas não conferem.");
      return;
    }

    setEnviando(true);
    setErro("");
    const email = form.get("email");
    const res = await fetch("/api/auth/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: form.get("nome"),
        email,
        senha: form.get("senha"),
        captcha: form.get("captcha"),
        captchaToken: desafio?.token,
        site: form.get("site"),
      }),
    });
    const dados = await res.json();
    if (!res.ok) {
      setErro(dados.erro || "Erro ao criar conta.");
      setEnviando(false);
      // Cada desafio vale uma tentativa: busca outro.
      carregarCaptcha();
      return;
    }
    if (dados.verificar) {
      setEmailEnviado(email);
      return;
    }
    window.location.href = voltar || "/eventos";
  }

  if (emailEnviado) {
    return (
      <div className="relative mx-auto max-w-md px-4 py-16">
        <div className={cartao}>
          <MarcaIcone tamanho={40} />
          <h1 className="font-display mt-5 text-3xl font-bold tracking-tight">
            Confira seu e-mail 📬
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            Enviamos um link de confirmação para{" "}
            <strong className="text-zinc-200">{emailEnviado}</strong>. Clique
            nele para ativar sua conta — vale por 48 horas.
          </p>
          <p className="mt-3 text-sm text-zinc-500">
            Não chegou? Olhe a caixa de spam ou tente{" "}
            <Link href="/login" className="text-yellow-400 hover:underline">
              entrar
            </Link>{" "}
            para receber um novo link.
          </p>
        </div>
      </div>
    );
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
          Criar conta
        </h1>
        <p className="mt-1.5 text-sm text-zinc-400">
          Uma conta só: compre fotos dos eventos que você foi e venda as que
          você fez.
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
            <label className={rotulo}>Nome</label>
            <input
              name="nome"
              required
              placeholder="Seu nome"
              className={campo}
            />
          </div>
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
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              className={campo}
            />
          </div>
          <div>
            <label className={rotulo}>Repita a senha</label>
            <input
              name="confirmarSenha"
              type="password"
              required
              minLength={6}
              placeholder="A mesma senha de novo"
              className={campo}
            />
          </div>

          {/* Honeypot anti-robô: fica invisível e deve seguir vazio */}
          <input
            name="site"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />

          <div>
            <label className={rotulo}>
              Verificação anti-spam
              {desafio ? ` — ${desafio.pergunta}` : ""}
            </label>
            <input
              name="captcha"
              required
              inputMode="numeric"
              autoComplete="off"
              placeholder={desafio ? "Sua resposta" : "Carregando…"}
              disabled={!desafio}
              className={`${campo} disabled:opacity-50`}
            />
          </div>

          {erro && <p className="text-sm text-red-400">{erro}</p>}
          <button
            disabled={enviando || !desafio}
            className={`${botaoPrimario} w-full`}
          >
            {enviando ? "Criando…" : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Já tem conta?{" "}
          <Link
            href={
              voltar ? `/login?voltar=${encodeURIComponent(voltar)}` : "/login"
            }
            className="font-medium text-yellow-400 hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
