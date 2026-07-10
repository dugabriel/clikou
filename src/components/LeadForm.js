"use client";

import { useState } from "react";
import { field, label } from "@/components/ui";
import { CheckIcon } from "@/components/Icons";

// Formulário "peça um orçamento" no perfil público (recurso Pro). A cor de
// destaque vem por CSS var (--brand) herdada da página.
export default function LeadForm({ username }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setSending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/f/${username}/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        contact: form.get("contact"),
        message: form.get("message"),
        website: form.get("website"), // honeypot
      }),
    });
    setSending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Não foi possível enviar. Tente de novo.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 text-center">
        <p className="flex items-center justify-center gap-2 text-lg font-semibold text-[color:var(--brand)]">
          <CheckIcon size={20} /> Pedido enviado!
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          O fotógrafo vai receber seu contato e responder em breve.
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
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Seu nome</label>
          <input name="name" required placeholder="Como te chamar" className={field} />
        </div>
        <div>
          <label className={label}>Seu contato</label>
          <input
            name="contact"
            required
            placeholder="WhatsApp ou e-mail"
            className={field}
          />
        </div>
      </div>
      <div className="mt-4">
        <label className={label}>Mensagem</label>
        <textarea
          name="message"
          rows={3}
          placeholder="Conte sobre o evento, data e local…"
          className={field}
        />
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      <button
        disabled={sending}
        className="mt-5 w-full rounded-full bg-[color:var(--brand)] py-3 font-semibold text-zinc-950 transition hover:opacity-90 disabled:opacity-50"
      >
        {sending ? "Enviando…" : "Enviar pedido de orçamento"}
      </button>
    </form>
  );
}
