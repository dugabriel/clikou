"use client";

import { useState } from "react";

// Envia o link da galeria por e-mail pro cliente.
export default function GalleryNotify({ galleryId, clientEmail, notifiedAt }) {
  const [email, setEmail] = useState(clientEmail || "");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState(
    notifiedAt
      ? {
          kind: "info",
          text: `Enviado em ${new Date(notifiedAt).toLocaleDateString("pt-BR")}.`,
        }
      : null
  );

  async function send(e) {
    e.preventDefault();
    setSending(true);
    setMsg(null);
    const res = await fetch(`/api/galleries/${galleryId}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) {
      setMsg({ kind: "error", text: data.error || "Não foi possível enviar." });
      return;
    }
    if (data.disabled) {
      setMsg({
        kind: "error",
        text: "Envio de e-mail não está configurado. Copie o link e mande pelo WhatsApp.",
      });
      return;
    }
    if (data.emailSent === false) {
      setMsg({
        kind: "error",
        text: "O provedor recusou o envio agora. Tente mais tarde ou mande o link pelo WhatsApp.",
      });
      return;
    }
    setMsg({ kind: "ok", text: `Link enviado para ${email} ✓` });
  }

  const color =
    msg?.kind === "ok"
      ? "text-emerald-400"
      : msg?.kind === "error"
        ? "text-red-400"
        : "text-zinc-500";

  return (
    <form
      onSubmit={send}
      className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6"
    >
      <h3 className="font-semibold">Avisar o cliente por e-mail</h3>
      <p className="mt-1 text-sm text-zinc-400">
        Mandamos o link (e o PIN, se houver) direto pro e-mail do cliente.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-sm text-zinc-400">
            E-mail do cliente
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="cliente@email.com"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-yellow-400"
          />
        </div>
        <button
          disabled={sending || !email.trim()}
          className="rounded-lg bg-yellow-400 px-5 py-2.5 font-semibold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50"
        >
          {sending ? "Enviando…" : "Enviar link"}
        </button>
      </div>
      {msg && <p className={`mt-3 text-sm ${color}`}>{msg.text}</p>}
    </form>
  );
}
