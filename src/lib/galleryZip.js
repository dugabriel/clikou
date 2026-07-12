import { once } from "events";
import { ZipArchive } from "archiver";
import GalleryPhoto from "@/models/GalleryPhoto";
import { readFile, saveStream, deleteFile } from "@/lib/storage";

// ZIP "baixar todas" pré-gerado: montado uma vez, salvo no bucket em
// gallery-zips/ e baixado direto por URL assinada. Guardrails: cache por
// estado das fotos, trava contra gerações concorrentes e teto de tamanho.

// Teto do zip — protege o tempo/custo da geração. 300 fotos de celular
// (~8 MB) dão ~2,4 GB, então o teto precisa ser maior que isso.
export const MAX_ZIP_BYTES = 6 * 1024 * 1024 * 1024; // 6 GB

// O lifecycle do bucket apaga gallery-zips/ com 7 dias; consideramos o
// cache vencido antes disso para nunca apontar para um objeto já colhido.
const ZIP_MAX_AGE_MS = 6 * 24 * 60 * 60 * 1000; // 6 dias

// Trava de geração: outra requisição no meio de um build recebe "preparando".
// Passado o prazo, o build é considerado morto e outro pode assumir.
export const BUILD_LOCK_MS = 15 * 60 * 1000;

// O zip vale enquanto o conjunto de fotos não mudou: mesma contagem e
// nenhuma foto criada depois dele (remover + adicionar muda o createdAt).
export async function zipIsCurrent(gallery) {
  if (!gallery.zipKey || !gallery.zipBuiltAt) return false;
  if (Date.now() - new Date(gallery.zipBuiltAt).getTime() > ZIP_MAX_AGE_MS) {
    return false;
  }
  const [count, newer] = await Promise.all([
    GalleryPhoto.countDocuments({ gallery: gallery._id }),
    GalleryPhoto.exists({
      gallery: gallery._id,
      createdAt: { $gt: gallery.zipBuiltAt },
    }),
  ]);
  return count > 0 && count === gallery.zipPhotoCount && !newer;
}

// Monta o zip (store, sem recomprimir) e grava em streaming no bucket —
// memória de ~1 foto por vez. Atualiza o cache na galeria e apaga o zip
// anterior. Chamar com a trava (zipBuildingAt) já tomada.
export async function buildGalleryZip(gallery) {
  const photos = await GalleryPhoto.find({ gallery: gallery._id })
    .sort({ createdAt: 1 })
    .select("originalKey fileName");

  const key = `gallery-zips/${gallery._id}/${Date.now()}.zip`;
  const archive = new ZipArchive({ store: true });
  const saving = saveStream(key, archive, "application/zip");

  const used = new Map();
  for (const p of photos) {
    let name = p.fileName || `foto-${p._id}.jpg`;
    const n = (used.get(name) || 0) + 1;
    used.set(name, n);
    if (n > 1) {
      const dot = name.lastIndexOf(".");
      name =
        dot > 0
          ? `${name.slice(0, dot)}-${n}${name.slice(dot)}`
          : `${name}-${n}`;
    }
    let buf;
    try {
      buf = await readFile(p.originalKey);
    } catch {
      continue; // arquivo sumiu do storage — pula
    }
    archive.append(buf, { name });
    await once(archive, "entry"); // contrapressão: uma foto por vez na RAM
  }
  archive.finalize();
  await saving;

  const oldKey = gallery.zipKey;
  gallery.zipKey = key;
  gallery.zipBuiltAt = new Date();
  gallery.zipBytes = archive.pointer();
  gallery.zipPhotoCount = photos.length;
  gallery.zipBuildingAt = undefined;
  await gallery.save();

  if (oldKey) await deleteFile(oldKey); // o lifecycle é só rede de segurança

  return { key, bytes: gallery.zipBytes };
}
