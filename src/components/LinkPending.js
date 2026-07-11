"use client";

import { useLinkStatus } from "next/link";

// Feedback imediato de clique em rede lenta: enquanto a navegação do <Link>
// pai está pendente, o rótulo pulsa. Só opacidade — nada de shift de layout.
// Complementa o loading.js das rotas, que assume assim que o fallback chega.
export default function LinkPending({ children }) {
  const { pending } = useLinkStatus();
  return <span className={pending ? "animate-pulse" : ""}>{children}</span>;
}
