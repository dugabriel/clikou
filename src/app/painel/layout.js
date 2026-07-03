import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/auth";
import PainelNav from "@/components/PainelNav";

export default async function PainelLayout({ children }) {
  const sessao = await obterSessao();
  if (!sessao) redirect("/login?voltar=/painel");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Área do fotógrafo
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Olá, {sessao.nome?.split(" ")[0]} — seus eventos, vendas e página
            pública.
          </p>
        </div>
        <PainelNav />
      </div>
      {children}
    </div>
  );
}
