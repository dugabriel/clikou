"use client";

import { useState } from "react";
import { CheckIcon } from "@/components/Icons";

export default function CopyLinkButton({ path, label = "Copiar link" }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}${path}`;
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
    <button
      onClick={copy}
      className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
        copied
          ? "bg-emerald-500 text-zinc-950"
          : "bg-yellow-400 text-zinc-950 hover:bg-yellow-300"
      }`}
    >
      {copied ? (
        <>
          <CheckIcon size={16} /> Link copiado!
        </>
      ) : (
        label
      )}
    </button>
  );
}
