import PageSpinner from "@/components/PageSpinner";

// Fallback global de navegação: aparece na hora do clique enquanto a página
// de destino renderiza no servidor (navbar e rodapé ficam no lugar).
export default function Loading() {
  return <PageSpinner />;
}
