"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatarPreco } from "@/lib/moeda";
import BuscaRosto from "@/components/BuscaRosto";
import VisualizadorFotos from "@/components/VisualizadorFotos";

export default function GaleriaCompra({ fotos, compradas, logado, eventoId }) {
  const router = useRouter();
  const [selecionadas, setSelecionadas] = useState(new Set());
  const [comprando, setComprando] = useState(false);
  const [erro, setErro] = useState("");
  const [filtroRosto, setFiltroRosto] = useState(null); // null = sem filtro
  const [visor, setVisor] = useState(null); // índice da foto aberta no lightbox
  const jaCompradas = useMemo(() => new Set(compradas), [compradas]);

  const fotosVisiveis = filtroRosto
    ? fotos.filter((f) => filtroRosto.has(f.id))
    : fotos;

  function alternar(id) {
    setSelecionadas((atual) => {
      const novo = new Set(atual);
      novo.has(id) ? novo.delete(id) : novo.add(id);
      return novo;
    });
  }

  const total = fotos
    .filter((f) => selecionadas.has(f.id))
    .reduce((s, f) => s + f.precoCentavos, 0);

  async function comprar() {
    if (!logado) {
      router.push(`/login?voltar=/eventos/${eventoId}`);
      return;
    }
    setComprando(true);
    setErro("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fotoIds: [...selecionadas] }),
      });
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.erro || "Erro no checkout.");
      window.location.href = dados.url;
    } catch (e) {
      setErro(e.message);
      setComprando(false);
    }
  }

  if (fotos.length === 0) {
    return (
      <p className="py-20 text-center text-zinc-500">
        O fotógrafo ainda não publicou fotos neste evento.
      </p>
    );
  }

  return (
    <div className="pb-24">
      <BuscaRosto
        eventoId={eventoId}
        filtroAtivo={!!filtroRosto}
        aoFiltrar={(ids) => {
          setFiltroRosto(ids ? new Set(ids) : null);
          setVisor(null); // a lista visível muda, fecha o lightbox
        }}
      />

      {filtroRosto && (
        <p className="mb-4 text-sm text-zinc-300">
          {fotosVisiveis.length === 0
            ? "Nenhuma foto sua encontrada neste evento. Tente outra selfie ou limpe o filtro para ver todas."
            : `Encontramos você em ${fotosVisiveis.length} foto${
                fotosVisiveis.length > 1 ? "s" : ""
              }:`}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {fotosVisiveis.map((f, i) => {
          const comprada = jaCompradas.has(f.id);
          const marcada = selecionadas.has(f.id);
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setVisor(i)}
              className={`group relative overflow-hidden rounded-lg border text-left transition ${
                marcada
                  ? "border-yellow-400 ring-2 ring-yellow-400"
                  : "border-zinc-800 hover:border-zinc-600"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/fotos/${f.id}/preview`}
                alt="Foto do evento"
                loading="lazy"
                className="aspect-[4/3] w-full bg-zinc-900 object-cover transition group-hover:scale-[1.03]"
              />
              {/* Dica de que o clique abre a foto grande */}
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 text-xs font-semibold uppercase tracking-widest text-white opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                Ver foto
              </span>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-3 py-2 text-sm">
                <span className="font-medium">
                  {formatarPreco(f.precoCentavos)}
                </span>
                {comprada ? (
                  <a
                    href={`/api/fotos/${f.id}/download`}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-zinc-950"
                  >
                    Baixar ✓
                  </a>
                ) : (
                  <span
                    role="button"
                    aria-label={marcada ? "Remover da seleção" : "Selecionar para compra"}
                    onClick={(e) => {
                      e.stopPropagation();
                      alternar(f.id);
                    }}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs transition ${
                      marcada
                        ? "border-yellow-400 bg-yellow-400 text-zinc-950"
                        : "border-zinc-300 text-transparent hover:border-yellow-400 hover:bg-yellow-400/20"
                    }`}
                  >
                    ✓
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {visor !== null && (
        <VisualizadorFotos
          fotos={fotosVisiveis}
          indice={Math.min(visor, fotosVisiveis.length - 1)}
          aoFechar={() => setVisor(null)}
          aoNavegar={setVisor}
          selecionadas={selecionadas}
          aoAlternar={alternar}
          compradas={jaCompradas}
          totalCentavos={total}
          aoComprar={comprar}
          comprando={comprando}
          logado={logado}
        />
      )}

      {selecionadas.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-700 bg-zinc-900/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
            <div>
              <span className="font-semibold">
                {selecionadas.size} foto{selecionadas.size > 1 ? "s" : ""}
              </span>
              <span className="ml-2 text-zinc-400">
                Total: {formatarPreco(total)}
              </span>
              {erro && <p className="text-sm text-red-400">{erro}</p>}
            </div>
            <button
              onClick={comprar}
              disabled={comprando}
              className="rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50"
            >
              {comprando ? "Aguarde…" : logado ? "Comprar" : "Entrar para comprar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
