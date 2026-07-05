// Guardrails de conteúdo: palavras proibidas em textos e
// imagens inapropriadas via Google Cloud Vision SafeSearch.

const FORBIDDEN_WORDS = [
  "caralho", "carai", "krl", "porra", "buceta", "boceta", "bucetinha",
  "cuzao", "cuzinho", "arrombado", "arrombada", "foder", "fodase", "foda",
  "fodido", "fodida", "puta", "putinha", "putaria", "piroca", "boquete",
  "punheta", "punheteiro", "siririca", "xoxota", "xereca", "xana",
  "cacete", "caceta", "viado", "baitola", "boiola", "sapatao", "traveco",
  "merda", "bosta", "pau no cu", "vai tomar no cu", "filho da puta",
  "porno", "pornografia", "pornografico", "putona",
  "pedofilia", "pedofilo", "estupro", "estuprador", "zoofilia", "incesto",
];

function normalize(text) {
  return String(text)
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

export function containsForbiddenWord(...texts) {
  const norm = normalize(texts.filter(Boolean).join(" "));
  return FORBIDDEN_WORDS.some((w) =>
    new RegExp(`(^|[^a-z])${w}($|[^a-z])`).test(norm)
  );
}

// ----- Imagens (Vision SafeSearch) -----

const BLOCK_LEVELS = new Set(["LIKELY", "VERY_LIKELY"]);
let _vision = null;

// Retorna { blocked, reason }. Se a API estiver indisponível,
// libera o upload e registra o erro (não derruba a plataforma).
export async function isImageInappropriate(buffer) {
  if (process.env.IMAGE_MODERATION === "0") return { blocked: false };
  try {
    if (!_vision) {
      const { ImageAnnotatorClient } = await import("@google-cloud/vision");
      _vision = new ImageAnnotatorClient();
    }
    const [res] = await _vision.safeSearchDetection({
      image: { content: buffer },
    });
    const s = res.safeSearchAnnotation;
    if (!s) return { blocked: false };

    if (BLOCK_LEVELS.has(s.adult)) {
      return { blocked: true, reason: "conteúdo adulto/nudez" };
    }
    if (s.racy === "VERY_LIKELY") {
      return { blocked: true, reason: "conteúdo sexualmente sugestivo" };
    }
    if (s.violence === "VERY_LIKELY") {
      return { blocked: true, reason: "violência explícita" };
    }
    return { blocked: false };
  } catch (e) {
    console.error("Moderação de imagem indisponível:", e.message);
    return { blocked: false };
  }
}
