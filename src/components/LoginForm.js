"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import GoogleButton from "@/components/GoogleButton";
import { BrandIcon } from "@/components/Logo";
import { field, label, primaryButton, card } from "@/components/ui";

export default function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next");
  const [error, setError] = useState(
    params.get("error") === "google"
      ? "Não foi possível entrar com o Google. Tente de novo."
      : params.get("error") === "verification"
        ? "Link de confirmação inválido ou expirado. Entre com e-mail e senha para receber um novo."
        : ""
  );
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao entrar.");
      setSubmitting(false);
      return;
    }
    window.location.href = next || "/events";
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
          Bem-vindo de volta
        </h1>
        <p className="mt-1.5 text-sm text-zinc-400">
          Entre para comprar suas fotos ou vender as que você fez.
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
            <div className="flex items-baseline justify-between">
              <label className={label}>Senha</label>
              <Link
                href="/forgot-password"
                className="text-xs text-zinc-500 hover:text-yellow-400"
              >
                Esqueci minha senha
              </Link>
            </div>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className={field}
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button disabled={submitting} className={`${primaryButton} w-full`}>
            {submitting ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Não tem conta?{" "}
          <Link
            href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
            className="font-medium text-yellow-400 hover:underline"
          >
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  );
}
