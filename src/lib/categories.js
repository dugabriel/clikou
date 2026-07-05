// Categorias de evento — o valor vai pro banco, o rótulo pra tela.
export const CATEGORIES = [
  { value: "sports", label: "Esportes" },
  { value: "automotive", label: "Automotivo" },
  { value: "shows", label: "Shows e festas" },
  { value: "graduations", label: "Casamentos e formaturas" },
  { value: "others", label: "Outros eventos" },
];

export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value);

export function categoryLabel(value) {
  return CATEGORIES.find((c) => c.value === value)?.label || "Outros eventos";
}
