"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "clikou_cookie_consent";

// Banner de consentimento (LGPD) integrado ao Consent Mode do Google. O gtag
// entra negado por padrão (ver GoogleAnalytics); aqui liberamos se aceitar.
export default function CookieConsent() {
  const [show, setShow] = useState(false);

  function updateConsent(state) {
    if (typeof window.gtag !== "function") return;
    window.gtag("consent", "update", {
      ad_storage: state,
      analytics_storage: state,
      ad_user_data: state,
      ad_personalization: state,
    });
  }

  function choose(state) {
    try {
      localStorage.setItem(KEY, state);
    } catch {}
    updateConsent(state);
    setShow(false);
  }

  // Anuncia quando o banner está na tela: ele é um overlay z-50 rente ao
  // rodapé, então quem também vive ali (bolinha de suporte) sai da frente.
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("clikou:consent-visible", { detail: show })
    );
  }, [show]);

  useEffect(() => {
    let choice = null;
    try {
      choice = localStorage.getItem(KEY);
    } catch {}

    if (choice === "granted") updateConsent("granted");

    // Link "Cookies" do rodapé reabre o banner para revogar/alterar.
    const onOpen = () => setShow(true);
    window.addEventListener("clikou:open-consent", onOpen);

    // Mostra o banner na primeira visita — deferido para não chamar setState
    // de forma síncrona no corpo do efeito.
    let raf;
    if (!choice) raf = requestAnimationFrame(() => setShow(true));

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("clikou:open-consent", onOpen);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-zinc-300">
          Usamos cookies para entender como o site é usado e melhorar sua
          experiência (Google Analytics). Você pode aceitar ou recusar — os
          detalhes estão na nossa{" "}
          <Link href="/privacy" className="text-yellow-400 hover:underline">
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={() => choose("denied")}
            className="rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-400"
          >
            Recusar
          </button>
          <button
            onClick={() => choose("granted")}
            className="rounded-full bg-yellow-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-yellow-300"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
