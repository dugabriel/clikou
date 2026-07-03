"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BotaoCopiarLink from "@/components/BotaoCopiarLink";
import { IconeX } from "@/components/Icones";
import { campo, rotulo, botaoPrimario, botaoSecundario } from "@/components/ui";

export default function FormPerfil({ perfil }) {
  const router = useRouter();
  const [slug, setSlug] = useState(perfil.usuario);
  const [portfolio, setPortfolio] = useState(perfil.portfolio);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [subindo, setSubindo] = useState(false);

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setOk(false);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario: form.get("usuario"),
        sobre: form.get("sobre"),
        cidade: form.get("cidade"),
        website: form.get("website"),
        instagram: form.get("instagram"),
        whatsapp: form.get("whatsapp"),
      }),
    });
    const dados = await res.json();
    setSalvando(false);
    if (!res.ok) {
      setErro(dados.erro || "Erro ao salvar.");
      return;
    }
    setSlug(dados.usuario);
    setOk(true);
    router.refresh();
  }

  async function subirFotos(e) {
    const arquivos = [...e.target.files];
    e.target.value = "";
    setSubindo(true);
    setErro("");
    for (const arquivo of arquivos) {
      const form = new FormData();
      form.append("arquivo", arquivo);
      const res = await fetch("/api/perfil/portfolio", {
        method: "POST",
        body: form,
      });
      const dados = await res.json();
      if (!res.ok) {
        setErro(dados.erro || "Erro no upload.");
        break;
      }
      setPortfolio((atual) => [...atual, dados.chave]);
    }
    setSubindo(false);
  }

  async function removerFoto(chave) {
    setPortfolio((atual) => atual.filter((c) => c !== chave));
    await fetch("/api/perfil/portfolio", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chave }),
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form onSubmit={salvar} className="space-y-4">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Sobre mim
        </h2>
        <p className="-mt-2 text-sm text-zinc-400">
          Sua vitrine na clikou — perfeita para colocar na bio do Instagram.
        </p>

        <div>
          <label className={rotulo}>Nome de usuário (define seu link)</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">clikou/f/</span>
            <input
              name="usuario"
              defaultValue={perfil.usuario}
              placeholder="seunome"
              className={campo}
            />
          </div>
        </div>

        <div>
          <label className={rotulo}>Sobre você</label>
          <textarea
            name="sobre"
            rows={4}
            defaultValue={perfil.sobre}
            placeholder="Conte quem você é, o que fotografa, seus equipamentos…"
            className={campo}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={rotulo}>Cidade</label>
            <input
              name="cidade"
              defaultValue={perfil.cidade}
              placeholder="Sua cidade"
              className={campo}
            />
          </div>
          <div>
            <label className={rotulo}>Site</label>
            <input
              name="website"
              defaultValue={perfil.website}
              placeholder="seusite.com"
              className={campo}
            />
          </div>
          <div>
            <label className={rotulo}>Instagram</label>
            <input
              name="instagram"
              defaultValue={perfil.instagram}
              placeholder="sem o @"
              className={campo}
            />
          </div>
          <div>
            <label className={rotulo}>WhatsApp</label>
            <input
              name="whatsapp"
              defaultValue={perfil.whatsapp}
              placeholder="DDD + número"
              className={campo}
            />
          </div>
        </div>

        {erro && <p className="text-sm text-red-400">{erro}</p>}
        {ok && <p className="text-sm text-emerald-400">Perfil salvo!</p>}

        <div className="flex flex-wrap items-center gap-3">
          <button disabled={salvando} className={botaoPrimario}>
            {salvando ? "Salvando…" : "Salvar perfil"}
          </button>
          {slug && (
            <>
              <a
                href={`/f/${slug}`}
                target="_blank"
                className={`${botaoSecundario} px-5 py-2.5 text-sm`}
              >
                Ver minha página
              </a>
              <BotaoCopiarLink caminho={`/f/${slug}`} />
            </>
          )}
        </div>
      </form>

      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Portfólio
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Até 8 fotos do seu melhor trabalho — aparecem na sua página pública
          (sem marca d&apos;água, não estão à venda).
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {portfolio.map((chave) => (
            <div
              key={chave}
              className="group relative overflow-hidden rounded-xl border border-zinc-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/${chave}`}
                alt="Foto do portfólio"
                className="aspect-square w-full object-cover"
              />
              <button
                onClick={() => removerFoto(chave)}
                title="Remover"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-zinc-300 opacity-0 transition hover:text-white group-hover:opacity-100"
              >
                <IconeX tamanho={14} />
              </button>
            </div>
          ))}

          {portfolio.length < 8 && (
            <label
              className={`flex aspect-square cursor-pointer items-center justify-center rounded-xl border border-dashed border-zinc-700 text-sm text-zinc-500 transition hover:border-yellow-400 hover:text-yellow-400 ${
                subindo ? "pointer-events-none opacity-50" : ""
              }`}
            >
              {subindo ? "Enviando…" : "+ Adicionar"}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={subirFotos}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
