import PageSpinner from "@/components/PageSpinner";

// Fallback das trocas de aba dentro do painel: mantém o cabeçalho e a
// navegação do dashboard visíveis enquanto a página carrega.
export default function Loading() {
  return <PageSpinner className="min-h-[40vh]" />;
}
