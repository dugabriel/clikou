// Converte HEIC/HEIF (fotos de iPhone) para JPEG na entrada dos uploads.
// A decodificação usa o libheif compilado para WASM (heic-decode) porque o
// sharp pré-compilado não lê HEIC — e assim nada muda na imagem Docker.
// Import dinâmico: o WASM (~1 MB) só carrega quando chega um HEIC de fato.

// Marcas ISO-BMFF de HEIF/HEIC ("ftyp" + brand). AVIF fica de fora — o
// sharp decodifica AVIF nativamente.
const HEIF_BRANDS = new Set([
  "heic",
  "heix",
  "hevc",
  "hevx",
  "heim",
  "heis",
  "hevm",
  "hevs",
  "mif1",
  "msf1",
]);

export function isHeic(buffer) {
  if (!buffer || buffer.length < 12) return false;
  if (buffer.toString("latin1", 4, 8) !== "ftyp") return false;
  return HEIF_BRANDS.has(buffer.toString("latin1", 8, 12).toLowerCase());
}

// Retorna { buffer, converted }: JPEG quando a entrada era HEIC, o buffer
// original intocado quando não era. Lança se o HEIC estiver corrompido —
// o chamador responde "não é uma imagem válida".
export async function normalizeImage(buffer) {
  if (!isHeic(buffer)) return { buffer, converted: false };

  const { default: decode } = await import("heic-decode");
  const { width, height, data } = await decode({ buffer });

  const { default: sharp } = await import("sharp");
  const jpeg = await sharp(Buffer.from(data), {
    raw: { width, height, channels: 4 },
  })
    .jpeg({ quality: 90 })
    .toBuffer();

  return { buffer: jpeg, converted: true };
}

// "IMG_001.HEIC" -> "IMG_001.jpg" (o conteúdo salvo passou a ser JPEG).
export function jpegFileName(name) {
  return `${String(name).replace(/\.[^.]+$/, "")}.jpg`;
}
