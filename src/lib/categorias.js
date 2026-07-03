// Categorias de evento — o valor vai pro banco, o rótulo pra tela.
export const CATEGORIAS = [
  { valor: "esportes", rotulo: "Esportes" },
  { valor: "automotivo", rotulo: "Automotivo" },
  { valor: "shows", rotulo: "Shows e festas" },
  { valor: "formaturas", rotulo: "Casamentos e formaturas" },
  { valor: "outros", rotulo: "Outros eventos" },
];

export const VALORES_CATEGORIA = CATEGORIAS.map((c) => c.valor);

export function rotuloCategoria(valor) {
  return CATEGORIAS.find((c) => c.valor === valor)?.rotulo || "Outros eventos";
}
