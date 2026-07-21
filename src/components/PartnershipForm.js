"use client";

import { useEffect, useState } from "react";
import { field, label, primaryButton } from "@/components/ui";
import { CheckIcon } from "@/components/Icons";

// Formulário de pedido de parceria (Pro grátis) na landing de anúncio.
// Público, sem login — o fotógrafo pode nem ter conta ainda. Tráfego pago
// costuma atrair bot em volume maior que um lead comum, então além do
// honeypot e do limite por IP (na rota) tem captcha, igual ao cadastro.
export default function PartnershipForm() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [challenge, setChallenge] = useState(null); // { question, token }

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
    setSending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/partnership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        instagram: form.get("instagram"),
        facebook: form.get("facebook"),
        website: form.get("website"),
        empresa: form.get("empresa"), // honeypot
        captcha: form.get("captcha"),
        captchaToken: challenge?.token,
      }),
    });
    setSending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Não foi possível enviar. Tente de novo.");
      loadCaptcha(); // cada desafio vale uma tentativa só
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/[0.04] p-8 text-center">
        <p className="flex items-center justify-center gap-2 text-lg font-semibold text-yellow-400">
          <CheckIcon size={20} /> Pedido enviado!
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-400">
          Vamos dar uma olhada no seu trabalho e responder por e-mail. Se
          ainda não tem conta no clikou, crie a sua grátis com o mesmo e-mail
          enquanto isso.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 text-left sm:p-8"
    >
      <input
        type="text"
        name="empresa"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <div>
        <label className={label}>Seu e-mail de cadastro no clikou</label>
        <input
          type="email"
          name="email"
          required
          placeholder="voce@email.com"
          className={field}
        />
        <p className="mt-1.5 text-xs text-zinc-500">
          Ainda não tem conta?{" "}
          <a
            href="/signup"
            target="_blank"
            rel="noreferrer"
            className="text-yellow-400 hover:underline"
          >
            Crie grátis
          </a>{" "}
          e use o mesmo e-mail aqui.
        </p>
      </div>

      <p className={`${label} mt-5`}>
        Instagram, Facebook, site ou portfólio — pelo menos um
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <input
          name="instagram"
          placeholder="Instagram"
          className={field}
        />
        <input name="facebook" placeholder="Facebook" className={field} />
        <input
          name="website"
          placeholder="Site ou portfólio"
          className={field}
        />
      </div>

      <div className="mt-5">
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

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      <button
        disabled={sending || !challenge}
        className={`${primaryButton} mt-5 w-full`}
      >
        {sending ? "Enviando…" : "Solicitar Pro grátis"}
      </button>
    </form>
  );
}
