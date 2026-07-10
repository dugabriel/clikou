"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandIcon } from "@/components/Logo";
import { MailIcon } from "@/components/Icons";
import { field, label, primaryButton, card } from "@/components/ui";

export default function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [challenge, setChallenge] = useState(null); // { question, token }
  const [sent, setSent] = useState(false);

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
    setSubmitting(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        captcha: form.get("captcha"),
        captchaToken: challenge?.token,
        website: form.get("website"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao pedir a redefinição.");
      setSubmitting(false);
      // Cada desafio vale uma tentativa: busca outro.
      loadCaptcha();
      return;
    }
    setSent(true);
  }

  return (
    <div className="relative mx-auto max-w-md px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl"
      />

      <div className={card}>
        <BrandIcon size={40} />
        {sent ? (
          <>
            <h1 className="font-display mt-5 flex items-center gap-2.5 text-3xl font-bold tracking-tight">
              <MailIcon size={28} className="shrink-0 text-yellow-400" />
              Confira seu e-mail
            </h1>
            <p className="mt-3 text-sm text-zinc-400">
              Se existir uma conta com esse e-mail, enviamos um link para
              criar uma senha nova. Ele vale por 1 hora e só funciona uma
              vez.
            </p>
            <p className="mt-3 text-sm text-zinc-500">
              Não chegou? Olhe a caixa de spam ou aguarde 1 minuto para pedir
              de novo.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display mt-5 text-3xl font-bold tracking-tight">
              Esqueceu a senha?
            </h1>
            <p className="mt-1.5 text-sm text-zinc-400">
              Sem drama: diga seu e-mail e mandamos um link para criar uma
              nova.
            </p>

            <form onSubmit={submit} className="mt-7 space-y-5">
              <div>
                <label className={label}>E-mail da conta</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="voce@email.com"
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
                {submitting ? "Enviando…" : "Enviar link de redefinição"}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-zinc-400">
          Lembrou a senha?{" "}
          <Link href="/login" className="font-medium text-yellow-400 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
