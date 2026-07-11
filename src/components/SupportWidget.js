"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SupportIcon, XIcon } from "@/components/Icons";
import { field, primaryButton } from "@/components/ui";

const CATEGORIES = ["Problema", "Sugestão", "Outro assunto"];

// Bolinha de suporte no canto inferior direito. Fica fora das páginas
// white-label (/f e /g), onde quem navega é o cliente do fotógrafo — o
// suporte da clikou é para o usuário da plataforma.
export default function SupportWidget({ loggedIn }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Problema");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);

  // Sai da frente enquanto o banner de cookies (z-50, rente ao rodapé) está
  // na tela — ele cobriria a bolinha e roubaria o clique.
  useEffect(() => {
    const onConsent = (e) => setConsentOpen(!!e.detail);
    window.addEventListener("clikou:consent-visible", onConsent);
    return () => window.removeEventListener("clikou:consent-visible", onConsent);
  }, []);

  if (pathname.startsWith("/f/") || pathname.startsWith("/g/")) return null;
  if (consentOpen) return null;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, message, page: pathname }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Não deu certo agora. Tente de novo.");
      return;
    }
    setDone(true);
    setMessage("");
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-40 w-[min(92vw,360px)] rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl shadow-black/60">
          {!loggedIn ? (
            <>
              <p className="font-semibold">Fale com o suporte</p>
              <p className="mt-2 text-sm text-zinc-400">
                Entre na sua conta para relatar um problema ou mandar uma
                sugestão — a resposta chega no seu e-mail.
              </p>
              <Link
                href={`/login?next=${encodeURIComponent(pathname)}`}
                className={`${primaryButton} mt-4 w-full`}
              >
                Entrar para continuar
              </Link>
            </>
          ) : done ? (
            <>
              <p className="font-semibold">Recebido!</p>
              <p className="mt-2 text-sm text-zinc-400">
                Seu ticket foi aberto e você recebeu uma cópia por e-mail. A
                resposta do suporte chega nessa mesma conversa.
              </p>
              <button
                type="button"
                onClick={() => {
                  setDone(false);
                  setOpen(false);
                }}
                className={`${primaryButton} mt-4 w-full`}
              >
                Fechar
              </button>
            </>
          ) : (
            <form onSubmit={submit}>
              <p className="font-semibold">Fale com o suporte</p>
              <p className="mt-1 text-sm text-zinc-400">
                Achou um erro ou tem uma sugestão? Te respondemos por e-mail.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      category === c
                        ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                        : "border-white/15 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={3000}
                placeholder="Descreva o que aconteceu ou sua ideia…"
                className={`${field} mt-3 resize-none`}
                required
              />
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className={`${primaryButton} mt-3 w-full`}
              >
                {busy ? "Enviando…" : "Enviar ticket"}
              </button>
            </form>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar suporte" : "Abrir suporte"}
        className="fixed bottom-4 right-4 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-yellow-400 text-zinc-950 shadow-lg shadow-black/40 transition hover:scale-105 hover:bg-yellow-300"
      >
        {open ? <XIcon size={24} /> : <SupportIcon size={26} />}
      </button>
    </>
  );
}
