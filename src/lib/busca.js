// Helpers da busca de eventos: casar com/sem acento e reconhecer estados.

export function normalizar(texto) {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Regex que ignora acentos: "sao" também encontra "São".
const VARIANTES = {
  a: "[aáàâãä]",
  e: "[eéèê]",
  i: "[iíì]",
  o: "[oóòôõö]",
  u: "[uúùû]",
  c: "[cç]",
};

export function regexSemAcento(texto) {
  const padrao = normalizar(texto)
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/[aeiouc]/g, (l) => VARIANTES[l]);
  return new RegExp(padrao, "i");
}

const UF_POR_NOME = {
  acre: "AC",
  alagoas: "AL",
  amapa: "AP",
  amazonas: "AM",
  bahia: "BA",
  ceara: "CE",
  "distrito federal": "DF",
  "espirito santo": "ES",
  goias: "GO",
  maranhao: "MA",
  "mato grosso": "MT",
  "mato grosso do sul": "MS",
  "minas gerais": "MG",
  para: "PA",
  paraiba: "PB",
  parana: "PR",
  pernambuco: "PE",
  piaui: "PI",
  "rio de janeiro": "RJ",
  "rio grande do norte": "RN",
  "rio grande do sul": "RS",
  rondonia: "RO",
  roraima: "RR",
  "santa catarina": "SC",
  "sao paulo": "SP",
  sergipe: "SE",
  tocantins: "TO",
};

const SIGLAS = new Set(Object.values(UF_POR_NOME));

// "SP", "sp", "São Paulo", "parana"… -> "SP"/"PR"; senão null.
export function ufDeTexto(texto) {
  const limpo = normalizar(texto);
  if (limpo.length === 2 && SIGLAS.has(limpo.toUpperCase())) {
    return limpo.toUpperCase();
  }
  return UF_POR_NOME[limpo] || null;
}
