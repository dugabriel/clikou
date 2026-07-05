import sharp from "sharp";

function watermarkSvg(w, h) {
  const step = Math.max(Math.floor(w / 4), 200);
  const fontSize = Math.floor(step / 6);
  let texts = "";
  for (let y = 0; y < h + step; y += step) {
    const offset = ((y / step) % 2) * (step / 2);
    for (let x = -step; x < w + step; x += step) {
      texts += `<text x="${x + offset}" y="${y}" font-size="${fontSize}" fill="rgba(255,255,255,0.38)" stroke="rgba(0,0,0,0.15)" stroke-width="1" transform="rotate(-30 ${x + offset} ${y})" font-family="Arial, sans-serif" font-weight="bold">clikou</text>`;
    }
  }
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${texts}</svg>`;
}

// Gera a versão de preview (reduzida + marca d'água) a partir do original.
export async function generatePreview(originalBuffer) {
  const base = await sharp(originalBuffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 72 })
    .toBuffer();

  const { width, height } = await sharp(base).metadata();
  const preview = await sharp(base)
    .composite([{ input: Buffer.from(watermarkSvg(width, height)) }])
    .jpeg({ quality: 72 })
    .toBuffer();

  return { preview, width, height };
}
