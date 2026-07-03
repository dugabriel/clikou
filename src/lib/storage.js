import fs from "fs/promises";
import path from "path";

// Se GCS_BUCKET estiver definido usa o Google Cloud Storage;
// senão salva em .data/uploads (modo desenvolvimento local).
const BUCKET = process.env.GCS_BUCKET;
const DIR_LOCAL = path.join(process.cwd(), ".data", "uploads");

export const usandoGCS = !!BUCKET;

let _bucket = null;
async function bucket() {
  if (!_bucket) {
    const { Storage } = await import("@google-cloud/storage");
    _bucket = new Storage().bucket(BUCKET);
  }
  return _bucket;
}

export async function salvarArquivo(chave, buffer, contentType) {
  if (BUCKET) {
    const b = await bucket();
    await b.file(chave).save(buffer, { contentType, resumable: false });
  } else {
    const destino = path.join(DIR_LOCAL, chave);
    await fs.mkdir(path.dirname(destino), { recursive: true });
    await fs.writeFile(destino, buffer);
  }
}

export async function removerArquivo(chave) {
  try {
    if (BUCKET) {
      const b = await bucket();
      await b.file(chave).delete();
    } else {
      await fs.unlink(path.join(DIR_LOCAL, chave));
    }
  } catch {
    // arquivo já removido ou inexistente — ignora
  }
}

export async function lerArquivo(chave) {
  if (BUCKET) {
    const b = await bucket();
    const [buf] = await b.file(chave).download();
    return buf;
  }
  return fs.readFile(path.join(DIR_LOCAL, chave));
}

// URL assinada para download do original. Se não der para assinar
// (ex.: dev com credenciais de usuário, sem chave privada), retorna null
// e a rota de download faz o streaming do arquivo.
export async function urlDownloadAssinada(chave, nomeArquivo) {
  if (!BUCKET) return null;
  try {
    const b = await bucket();
    const [url] = await b.file(chave).getSignedUrl({
      action: "read",
      expires: Date.now() + 15 * 60 * 1000,
      responseDisposition: `attachment; filename="${nomeArquivo}"`,
    });
    return url;
  } catch {
    return null;
  }
}
