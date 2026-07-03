export function formatarPreco(centavos) {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// "12,50" ou "12.50" -> 1250
export function paraCentavos(texto) {
  const n = parseFloat(String(texto).replace(/\./g, "").replace(",", "."));
  if (Number.isNaN(n) || n < 0) return null;
  return Math.round(n * 100);
}
