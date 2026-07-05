// Helpers da busca de eventos: casar com/sem acento e reconhecer estados.

export function normalize(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

// Regex que ignora acentos: "sao" também encontra "São".
const VARIANTS = {
  a: "[aáàâãä]",
  e: "[eéèê]",
  i: "[iíì]",
  o: "[oóòôõö]",
  u: "[uúùû]",
  c: "[cç]",
};

export function accentInsensitiveRegex(text) {
  const pattern = normalize(text)
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/[aeiouc]/g, (l) => VARIANTS[l]);
  return new RegExp(pattern, "i");
}

const STATE_BY_NAME = {
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

const STATE_CODES = new Set(Object.values(STATE_BY_NAME));

// "SP", "sp", "São Paulo", "parana"… -> "SP"/"PR"; senão null.
export function stateFromText(text) {
  const clean = normalize(text);
  if (clean.length === 2 && STATE_CODES.has(clean.toUpperCase())) {
    return clean.toUpperCase();
  }
  return STATE_BY_NAME[clean] || null;
}
