"use client";

import { useCallback, useEffect, useRef } from "react";
import { formatarPreco } from "@/lib/moeda";

// Lightbox da galeria: foto grande, navegação por setas/teclado/swipe e
// seleção para compra sem sair da visualização.
export default function VisualizadorFotos({
  fotos,
  indice,
  aoFechar,
  aoNavegar,
  selecionadas,
  aoAlternar,
  compradas,
  totalCentavos,
  aoComprar,
  comprando,
  logado,
}) {
  const toqueX = useRef(null);
  const foto = fotos[indice];
  const marcada = foto && selecionadas.has(foto.id);
  const comprada = foto && compradas.has(foto.id);

  const anterior = useCallback(() => {
    if (indice > 0) aoNavegar(indice - 1);
  }, [indice, aoNavegar]);
  const proxima = useCallback(() => {
    if (indice < fotos.length - 1) aoNavegar(indice + 1);
  }, [indice, fotos.length, aoNavegar]);

  useEffect(() => {
    function teclas(e) {
      if (e.key === "Escape") aoFechar();
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "ArrowRight") proxima();
    }
    window.addEventListener("keydown", teclas);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", teclas);
      document.body.style.overflow = "";
    };
  }, [aoFechar, anterior, proxima]);

  // Pré-carrega as vizinhas pra navegação não "piscar".
  useEffect(() => {
    [indice - 1, indice + 1].forEach((i) => {
      if (fotos[i]) new Image().src = `/api/fotos/${fotos[i].id}/preview`;
    });
  }, [indice, fotos]);

  if (!foto) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-zinc-950/95 backdrop-blur-sm"
      onClick={aoFechar}
      role="dialog"
      aria-modal="true"
      aria-label="Visualização da foto"
    >
      {/* Topo: contador + fechar */}
      <div
        className="flex items-center justify-between px-4 py-3 text-sm text-zinc-400"
        onClick={(e) => e.stopPropagation()}
      >
        <span>
          {indice + 1} / {fotos.length}
        </span>
        <button
          onClick={aoFechar}
          aria-label="Fechar"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-lg text-zinc-300 transition hover:border-yellow-400/60 hover:text-yellow-400"
        >
          ✕
        </button>
      </div>

      {/* Foto + setas */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2 py-3"
        onTouchStart={(e) => (toqueX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (toqueX.current === null) return;
          const delta = e.changedTouches[0].clientX - toqueX.current;
          toqueX.current = null;
          if (delta > 50) anterior();
          else if (delta < -50) proxima();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={foto.id}
          src={`/api/fotos/${foto.id}/preview`}
          alt="Foto do evento em tamanho grande"
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
          className="max-h-full max-w-full select-none rounded-lg object-contain shadow-2xl shadow-black/60"
        />

        {indice > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              anterior();
            }}
            aria-label="Foto anterior"
            className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-zinc-900/70 text-xl text-zinc-200 backdrop-blur transition hover:border-yellow-400/60 hover:text-yellow-400"
          >
            ‹
          </button>
        )}
        {indice < fotos.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              proxima();
            }}
            aria-label="Próxima foto"
            className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-zinc-900/70 text-xl text-zinc-200 backdrop-blur transition hover:border-yellow-400/60 hover:text-yellow-400"
          >
            ›
          </button>
        )}
      </div>

      {/* Rodapé: preço + ações de compra */}
      <div
        className="border-t border-white/10 bg-zinc-900/80 px-4 py-4 backdrop-blur"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3 sm:justify-between">
          <div className="text-sm">
            <p className="text-lg font-bold text-yellow-400">
              {formatarPreco(foto.precoCentavos)}
            </p>
            <p className="text-zinc-500">
              Alta resolução, sem marca d&apos;água
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {comprada ? (
              <a
                href={`/api/fotos/${foto.id}/download`}
                className="rounded-full bg-emerald-500 px-6 py-2.5 font-semibold text-zinc-950 transition hover:bg-emerald-400"
              >
                Baixar ✓
              </a>
            ) : (
              <button
                onClick={() => aoAlternar(foto.id)}
                className={`rounded-full px-6 py-2.5 font-semibold transition ${
                  marcada
                    ? "border border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
                    : "bg-yellow-400 text-zinc-950 hover:bg-yellow-300"
                }`}
              >
                {marcada ? "Selecionada ✓ — remover" : "Quero esta foto"}
              </button>
            )}

            {selecionadas.size > 0 && (
              <button
                onClick={aoComprar}
                disabled={comprando}
                className="rounded-full border border-white/15 px-6 py-2.5 font-medium text-zinc-200 transition hover:border-yellow-400/60 hover:text-yellow-400 disabled:pointer-events-none disabled:opacity-50"
              >
                {comprando
                  ? "Aguarde…"
                  : `${logado ? "Comprar" : "Entrar e comprar"} ${
                      selecionadas.size
                    } foto${selecionadas.size > 1 ? "s" : ""} · ${formatarPreco(
                      totalCentavos
                    )}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
