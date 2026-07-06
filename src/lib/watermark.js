import sharp from "sharp";

// Aviso anti-remoção: além de marcar a prévia, o texto explícito serve de
// guardrail — editores de IA tendem a recusar imagens com a instrução
// visível, e a violação fica inequívoca (Lei 9.610/98, direitos autorais).
const TILE_WARNING = "NÃO REMOVA A MARCA D'ÁGUA · DO NOT REMOVE WATERMARK";
const FOOTER_NOTICE =
  "© do fotógrafo · é proibido remover a marca d'água sem autorização (Lei 9.610/98) · clikou.click";

function watermarkSvg(w, h) {
  const step = Math.max(Math.floor(w / 4), 200);
  const brandSize = Math.floor(step / 6);
  const warnSize = Math.max(Math.floor(brandSize / 2.4), 10);

  // Mosaico diagonal alternando a marca e o aviso — sobrevive a recortes.
  let texts = "";
  let row = 0;
  for (let y = 0; y < h + step; y += step, row++) {
    const offset = (row % 2) * (step / 2);
    for (let x = -step; x < w + step; x += step) {
      const anchor = `${x + offset} ${y}`;
      texts +=
        row % 2 === 1
          ? `<text x="${x + offset}" y="${y}" font-size="${warnSize}" fill="rgba(255,255,255,0.34)" stroke="rgba(0,0,0,0.12)" stroke-width="0.6" transform="rotate(-30 ${anchor})" font-family="DejaVu Sans, Arial, sans-serif" font-weight="bold">${TILE_WARNING}</text>`
          : `<text x="${x + offset}" y="${y}" font-size="${brandSize}" fill="rgba(255,255,255,0.38)" stroke="rgba(0,0,0,0.15)" stroke-width="1" transform="rotate(-30 ${anchor})" font-family="DejaVu Sans, Arial, sans-serif" font-weight="bold">clikou</text>`;
    }
  }

  // Faixa inferior legível com o aviso legal.
  const footSize = Math.max(9, Math.min(20, Math.floor(w / 62)));
  const barHeight = Math.floor(footSize * 2.4);
  const footer = `<rect x="0" y="${h - barHeight}" width="${w}" height="${barHeight}" fill="rgba(0,0,0,0.55)"/><text x="${w / 2}" y="${h - barHeight / 2 + footSize * 0.35}" text-anchor="middle" font-size="${footSize}" fill="rgba(255,255,255,0.92)" font-family="DejaVu Sans, Arial, sans-serif">${FOOTER_NOTICE}</text>`;

  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${texts}${footer}</svg>`;
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
