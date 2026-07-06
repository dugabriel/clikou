import sharp from "sharp";

// Hashes perceptuais para achar uma foto a partir de um print dela.
// dHash (gradientes) e pHash (DCT) são robustos a recompressão, redimensão
// e marca d'água; a combinação dos dois reduz falsos positivos.

// dHash 64 bits: 9x8 em cinza, cada bit compara pixels vizinhos na linha.
export async function dhash(buffer) {
  const { data } = await sharp(buffer)
    .grayscale()
    .resize(9, 8, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let bits = 0n;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      bits = (bits << 1n) | (data[y * 9 + x] < data[y * 9 + x + 1] ? 1n : 0n);
    }
  }
  return bits.toString(16).padStart(16, "0");
}

// pHash 64 bits: DCT 2D de 32x32 em cinza; bloco 8x8 de baixa frequência
// vira bits comparando com a mediana (o termo DC é descartado).
export async function phash(buffer) {
  const N = 32;
  const { data } = await sharp(buffer)
    .grayscale()
    .resize(N, N, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const cos = [];
  for (let k = 0; k < 8; k++) {
    cos.push(
      Array.from({ length: N }, (_, n) =>
        Math.cos(((2 * n + 1) * k * Math.PI) / (2 * N))
      )
    );
  }

  const coefficients = [];
  for (let u = 0; u < 8; u++) {
    for (let v = 0; v < 8; v++) {
      let sum = 0;
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          sum += data[y * N + x] * cos[v][x] * cos[u][y];
        }
      }
      coefficients.push(sum);
    }
  }

  const ac = coefficients.slice(1);
  const median = [...ac].sort((a, b) => a - b)[Math.floor(ac.length / 2)];
  let bits = 0n;
  for (const c of ac) bits = (bits << 1n) | (c > median ? 1n : 0n);
  return bits.toString(16).padStart(16, "0");
}

export async function imageHashes(buffer) {
  const [d, p] = await Promise.all([dhash(buffer), phash(buffer)]);
  return { dhash: d, phash: p };
}

// Distância de Hamming entre dois hashes em hex (0 = idênticos, máx. 64).
export function hamming(hexA, hexB) {
  let x = BigInt(`0x${hexA}`) ^ BigInt(`0x${hexB}`);
  let n = 0;
  while (x) {
    n += Number(x & 1n);
    x >>= 1n;
  }
  return n;
}
