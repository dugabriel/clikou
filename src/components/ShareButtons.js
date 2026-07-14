"use client";

import { useState } from "react";
import {
  FacebookIcon,
  WhatsAppIcon,
  LinkIcon,
  CheckIcon,
} from "@/components/Icons";

const button =
  "flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/30 text-zinc-200 backdrop-blur transition hover:border-yellow-400/60 hover:text-yellow-400";

// Compartilhamento da página pública do evento: WhatsApp, Facebook e copiar
// link — os canais onde o link realmente circula. `url` vem absoluta do
// servidor (APP_URL) pra âncora funcionar já no SSR.
export default function ShareButtons({ url, title }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback para contextos sem clipboard API (http)
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">
        Divulgue
      </span>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartilhar no WhatsApp"
        title="Compartilhar no WhatsApp"
        className={button}
      >
        <WhatsAppIcon size={17} />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartilhar no Facebook"
        title="Compartilhar no Facebook"
        className={button}
      >
        <FacebookIcon size={17} />
      </a>
      <button
        onClick={copy}
        aria-label="Copiar link"
        title="Copiar link"
        className={`${button} ${copied ? "border-emerald-500/60 text-emerald-400" : ""}`}
      >
        {copied ? <CheckIcon size={17} /> : <LinkIcon size={17} />}
      </button>
      {copied && (
        <span className="text-xs font-medium text-emerald-400">
          Link copiado!
        </span>
      )}
    </div>
  );
}
