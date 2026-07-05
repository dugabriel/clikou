import fs from "fs/promises";
import path from "path";

// Se GCS_BUCKET estiver definido usa o Google Cloud Storage;
// senão salva em .data/uploads (modo desenvolvimento local).
const BUCKET = process.env.GCS_BUCKET;
const LOCAL_DIR = path.join(process.cwd(), ".data", "uploads");

export const usingGCS = !!BUCKET;

let _bucket = null;
async function bucket() {
  if (!_bucket) {
    const { Storage } = await import("@google-cloud/storage");
    _bucket = new Storage().bucket(BUCKET);
  }
  return _bucket;
}

export async function saveFile(key, buffer, contentType) {
  if (BUCKET) {
    const b = await bucket();
    await b.file(key).save(buffer, { contentType, resumable: false });
  } else {
    const target = path.join(LOCAL_DIR, key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, buffer);
  }
}

export async function deleteFile(key) {
  try {
    if (BUCKET) {
      const b = await bucket();
      await b.file(key).delete();
    } else {
      await fs.unlink(path.join(LOCAL_DIR, key));
    }
  } catch {
    // arquivo já removido ou inexistente — ignora
  }
}

export async function readFile(key) {
  if (BUCKET) {
    const b = await bucket();
    const [buf] = await b.file(key).download();
    return buf;
  }
  return fs.readFile(path.join(LOCAL_DIR, key));
}

// URL assinada para download do original. Se não der para assinar
// (ex.: dev com credenciais de usuário, sem chave privada), retorna null
// e a rota de download faz o streaming do arquivo.
export async function signedDownloadUrl(key, fileName) {
  if (!BUCKET) return null;
  try {
    const b = await bucket();
    const [url] = await b.file(key).getSignedUrl({
      action: "read",
      expires: Date.now() + 15 * 60 * 1000,
      responseDisposition: `attachment; filename="${fileName}"`,
    });
    return url;
  } catch {
    return null;
  }
}
