import sharp from "sharp";

function svgMarcaDagua(w, h) {
  const passo = Math.max(Math.floor(w / 4), 200);
  const fonte = Math.floor(passo / 6);
  let textos = "";
  for (let y = 0; y < h + passo; y += passo) {
    const desloca = ((y / passo) % 2) * (passo / 2);
    for (let x = -passo; x < w + passo; x += passo) {
      textos += `<text x="${x + desloca}" y="${y}" font-size="${fonte}" fill="rgba(255,255,255,0.38)" stroke="rgba(0,0,0,0.15)" stroke-width="1" transform="rotate(-30 ${x + desloca} ${y})" font-family="Arial, sans-serif" font-weight="bold">clikou</text>`;
    }
  }
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${textos}</svg>`;
}

// Gera a versão de preview (reduzida + marca d'água) a partir do original.
export async function gerarPreview(bufferOriginal) {
  const base = await sharp(bufferOriginal)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 72 })
    .toBuffer();

  const { width, height } = await sharp(base).metadata();
  const preview = await sharp(base)
    .composite([{ input: Buffer.from(svgMarcaDagua(width, height)) }])
    .jpeg({ quality: 72 })
    .toBuffer();

  return { preview, largura: width, altura: height };
}
