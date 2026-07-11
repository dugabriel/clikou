"use client";

import { useEffect, useState } from "react";

// Mesmo cooldown do servidor (route.js NOTIFY_COOLDOWN_MS): evita spam de
// e-mail por cliques repetidos.
const COOLDOWN_MS = 10 * 60 * 1000;

// Envia o link da galeria por e-mail pro cliente.
export default function GalleryNotify({ galleryId, clientEmail, notifiedAt }) {
  const [email, setEmail] = useState(clientEmail || "");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState(
    notifiedAt
      ? {
          kind: "info",
          text: `Último aviso em ${new Date(notifiedAt).toLocaleDateString(
            "pt-BR"
          )}.`,
        }
      : null
  );
  // E-mail que recebeu o último aviso e até quando o reenvio fica travado.
  const [lastNotifiedEmail, setLastNotifiedEmail] = useState(clientEmail || "");
  const [cooldownUntil, setCooldownUntil] = useState(
    notifiedAt ? new Date(notifiedAt).getTime() + COOLDOWN_MS : 0
  );
  const [now, setNow] = useState(() => Date.now());

  // Só mantém o timer vivo enquanto há cooldown pra correr.
  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [cooldownUntil]);

  const remainingMs = Math.max(0, cooldownUntil - now);
  // O cooldown só vale pro mesmo destinatário — trocar o e-mail libera.
  const cooling = remainingMs > 0 && email.trim() === lastNotifiedEmail;

  async function send(e) {
    e.preventDefault();
    if (cooling) return;
    setSending(true);
    setMsg(null);
    const res = await fetch(`/api/galleries/${galleryId}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);

    if (res.status === 429) {
      // Servidor recusou por cooldown — sincroniza o timer local com ele.
      if (data.retryAfterSeconds) {
        setLastNotifiedEmail(email.trim());
        setCooldownUntil(Date.now() + data.retryAfterSeconds * 1000);
        setNow(Date.now());
      }
      setMsg({ kind: "error", text: data.error || "Aguarde para reenviar." });
      return;
    }
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
    // Enviou: arma o cooldown pra este destinatário.
    setLastNotifiedEmail(email.trim());
    setCooldownUntil(Date.now() + COOLDOWN_MS);
    setNow(Date.now());
    setMsg({ kind: "ok", text: `Link enviado para ${email} ✓` });
  }

  const color =
    msg?.kind === "ok"
      ? "text-emerald-400"
      : msg?.kind === "error"
        ? "text-red-400"
        : "text-zinc-500";

  // Contagem regressiva formatada (ex.: "9m 42s").
  const totalSec = Math.ceil(remainingMs / 1000);
  const mmss = `${Math.floor(totalSec / 60)}m ${totalSec % 60}s`;

  // Sem cartão próprio: vive dentro do bloco "Entregue ao cliente" da página
  // da galeria, junto das outras formas de entrega.
  return (
    <form onSubmit={send}>
      <div className="flex flex-wrap items-end gap-3">
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
          disabled={sending || !email.trim() || cooling}
          className="rounded-lg bg-yellow-400 px-5 py-2.5 font-semibold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50"
        >
          {sending ? "Enviando…" : cooling ? `Reenviar em ${mmss}` : "Enviar link"}
        </button>
      </div>
      {cooling ? (
        <p className="mt-3 text-sm text-zinc-500">
          Já avisamos {lastNotifiedEmail} agora há pouco. Você pode reenviar em{" "}
          {mmss} — ou trocar o e-mail para avisar outro contato na hora.
        </p>
      ) : (
        msg && <p className={`mt-3 text-sm ${color}`}>{msg.text}</p>
      )}
    </form>
  );
}
