"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BrandIcon } from "@/components/Logo";
import { field, label, primaryButton, card } from "@/components/ui";

export default function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [error, setError] = useState(
    token ? "" : "Link incompleto — abra o endereço exatamente como veio no e-mail."
  );
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (form.get("password") !== form.get("confirmPassword")) {
      setError("As senhas não conferem.");
      return;
    }

    setSubmitting(true);
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: form.get("password") }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao redefinir a senha.");
      setSubmitting(false);
      return;
    }
    // Senha trocada e sessão criada — segue para os eventos.
    window.location.href = "/events";
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
          Criar nova senha
        </h1>
        <p className="mt-1.5 text-sm text-zinc-400">
          Escolha a senha nova da sua conta — você já entra direto.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-5">
          <div>
            <label className={label}>Nova senha</label>
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
            <label className={label}>Repita a nova senha</label>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              placeholder="A mesma senha de novo"
              className={field}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            disabled={submitting || !token}
            className={`${primaryButton} w-full`}
          >
            {submitting ? "Salvando…" : "Salvar nova senha"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Link expirado?{" "}
          <Link
            href="/forgot-password"
            className="font-medium text-yellow-400 hover:underline"
          >
            Pedir um novo
          </Link>
        </p>
      </div>
    </div>
  );
}
