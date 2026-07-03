// Guardrails de conteúdo: palavras proibidas em textos e
// imagens inapropriadas via Google Cloud Vision SafeSearch.

const PALAVRAS_PROIBIDAS = [
  "caralho", "carai", "krl", "porra", "buceta", "boceta", "bucetinha",
  "cuzao", "cuzinho", "arrombado", "arrombada", "foder", "fodase", "foda",
  "fodido", "fodida", "puta", "putinha", "putaria", "piroca", "boquete",
  "punheta", "punheteiro", "siririca", "xoxota", "xereca", "xana",
  "cacete", "caceta", "viado", "baitola", "boiola", "sapatao", "traveco",
  "merda", "bosta", "pau no cu", "vai tomar no cu", "filho da puta",
  "porno", "pornografia", "pornografico", "putona",
  "pedofilia", "pedofilo", "estupro", "estuprador", "zoofilia", "incesto",
];

function normalizar(texto) {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/@/g, "a")
    .replace(/\$/g, "s");
}

export function contemPalavraProibida(...textos) {
  const norm = normalizar(textos.filter(Boolean).join(" "));
  return PALAVRAS_PROIBIDAS.some((p) =>
    new RegExp(`(^|[^a-z])${p}($|[^a-z])`).test(norm)
  );
}

// ----- Imagens (Vision SafeSearch) -----

const NIVEL_BLOQUEIO = new Set(["LIKELY", "VERY_LIKELY"]);
let _vision = null;

// Retorna { bloqueada, motivo }. Se a API estiver indisponível,
// libera o upload e registra o erro (não derruba a plataforma).
export async function imagemInapropriada(buffer) {
  if (process.env.MODERACAO_IMAGENS === "0") return { bloqueada: false };
  try {
    if (!_vision) {
      const { ImageAnnotatorClient } = await import("@google-cloud/vision");
      _vision = new ImageAnnotatorClient();
    }
    const [res] = await _vision.safeSearchDetection({
      image: { content: buffer },
    });
    const s = res.safeSearchAnnotation;
    if (!s) return { bloqueada: false };

    if (NIVEL_BLOQUEIO.has(s.adult)) {
      return { bloqueada: true, motivo: "conteúdo adulto/nudez" };
    }
    if (s.racy === "VERY_LIKELY") {
      return { bloqueada: true, motivo: "conteúdo sexualmente sugestivo" };
    }
    if (s.violence === "VERY_LIKELY") {
      return { bloqueada: true, motivo: "violência explícita" };
    }
    return { bloqueada: false };
  } catch (e) {
    console.error("Moderação de imagem indisponível:", e.message);
    return { bloqueada: false };
  }
}
