"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import GoogleButton from "@/components/GoogleButton";
import { BrandIcon } from "@/components/Logo";
import { MailIcon } from "@/components/Icons";
import { field, label, primaryButton, card } from "@/components/ui";
import { trackEvent } from "@/lib/analytics";

export default function SignupForm() {
  const params = useSearchParams();
  const next = params.get("next");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [challenge, setChallenge] = useState(null); // { question, token }
  const [sentEmail, setSentEmail] = useState("");
  const [emailFailed, setEmailFailed] = useState(false);

  async function loadCaptcha() {
    setChallenge(null);
    try {
      const res = await fetch("/api/captcha");
      setChallenge(await res.json());
    } catch {
      setError("Não foi possível carregar a verificação. Recarregue a página.");
    }
  }

  useEffect(() => {
    loadCaptcha();
  }, []);

  async function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    if (form.get("password") !== form.get("confirmPassword")) {
      setError("As senhas não conferem.");
      return;
    }

    setSubmitting(true);
    setError("");
    const email = form.get("email");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email,
        password: form.get("password"),
        captcha: form.get("captcha"),
        captchaToken: challenge?.token,
        website: form.get("website"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao criar conta.");
      setSubmitting(false);
      // Cada desafio vale uma tentativa: busca outro.
      loadCaptcha();
      return;
    }
    // Conversão: conta criada com sucesso (vale pros dois caminhos).
    trackEvent("sign_up", { method: "email" });
    if (data.verify) {
      setSentEmail(email);
      setEmailFailed(data.emailSent === false);
      return;
    }
    window.location.href = next || "/events";
  }

  if (sentEmail) {
    return (
      <div className="relative mx-auto max-w-md px-4 py-16">
        <div className={card}>
          <BrandIcon size={40} />
          {emailFailed ? (
            <>
              <h1 className="font-display mt-5 text-3xl font-bold tracking-tight">
                Conta criada, mas…
              </h1>
              <p className="mt-3 text-sm text-zinc-400">
                Não conseguimos enviar o e-mail de confirmação para{" "}
                <strong className="text-zinc-200">{sentEmail}</strong> agora.
                Sua conta existe, mas ainda precisa ser confirmada.
              </p>
              <p className="mt-3 text-sm text-zinc-500">
                Tente novamente mais tarde pelo{" "}
                <Link href="/login" className="text-yellow-400 hover:underline">
                  login
                </Link>{" "}
                (ele reenvia o link), ou entre com o Google — não precisa de
                confirmação.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display mt-5 flex items-center gap-2.5 text-3xl font-bold tracking-tight">
                <MailIcon size={28} className="shrink-0 text-yellow-400" />
                Confira seu e-mail
              </h1>
              <p className="mt-3 text-sm text-zinc-400">
                Enviamos um link de confirmação para{" "}
                <strong className="text-zinc-200">{sentEmail}</strong>. Clique
                nele para ativar sua conta — vale por 48 horas.
              </p>
              <p className="mt-3 text-sm text-zinc-500">
                Não chegou? Olhe a caixa de spam ou tente{" "}
                <Link href="/login" className="text-yellow-400 hover:underline">
                  entrar
                </Link>{" "}
                para receber um novo link.
              </p>
            </>
          )}
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

      <div className={card}>
        <BrandIcon size={40} />
        <h1 className="font-display mt-5 text-3xl font-bold tracking-tight">
          Criar conta
        </h1>
        <p className="mt-1.5 text-sm text-zinc-400">
          Uma conta só: compre fotos dos eventos que você foi e venda as que
          você fez.
        </p>

        <div className="mt-7">
          <GoogleButton next={next || ""} />
        </div>
        <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-zinc-600">
          <span className="h-px flex-1 bg-white/10" />
          ou com e-mail
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className={label}>Nome</label>
            <input
              name="name"
              required
              placeholder="Seu nome"
              className={field}
            />
          </div>
          <div>
            <label className={label}>E-mail</label>
            <input
              name="email"
              type="email"
              required
              placeholder="voce@email.com"
              className={field}
            />
          </div>
          <div>
            <label className={label}>Senha</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              className={field}
            />
          </div>
          <div>
            <label className={label}>Repita a senha</label>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              placeholder="A mesma senha de novo"
              className={field}
            />
          </div>

          {/* Honeypot anti-robô: fica invisível e deve seguir vazio */}
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />

          <div>
            <label className={label}>
              Verificação anti-spam
              {challenge ? ` — ${challenge.question}` : ""}
            </label>
            <input
              name="captcha"
              required
              inputMode="numeric"
              autoComplete="off"
              placeholder={challenge ? "Sua resposta" : "Carregando…"}
              disabled={!challenge}
              className={`${field} disabled:opacity-50`}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            disabled={submitting || !challenge}
            className={`${primaryButton} w-full`}
          >
            {submitting ? "Criando…" : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Já tem conta?{" "}
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
            className="font-medium text-yellow-400 hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
