import mongoose from "mongoose";
import crypto from "crypto";

// Slug secreto que vai na URL de entrega (/g/<slug>). É o segredo do link —
// não-adivinhável, então quem tem o link entra (PIN é 2º fator opcional).
function makeSlug() {
  return crypto.randomBytes(9).toString("base64url"); // 12 chars
}

// Galeria de entrega: o fotógrafo sobe um trabalho (ensaio/casamento) e manda
// o link pro cliente, que não tem conta no clikou. Diferente do Event (venda
// pública com busca por rosto), aqui é privado e o download é a entrega.
const GallerySchema = new mongoose.Schema(
  {
    photographer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    // Cliente do CRM (opcional). clientName/clientEmail abaixo continuam como
    // denormalização: o nome sincroniza quando o cadastro é renomeado; o
    // e-mail é copiado só no vínculo (se vazio) e pode ser sobrescrito por
    // entrega no notify. Galerias antigas ficam só com o texto livre.
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      index: true,
    },
    clientName: { type: String, default: "" },
    // E-mail do cliente (para avisar que a galeria chegou). Opcional.
    clientEmail: { type: String, default: "" },
    // Quando o link foi enviado ao cliente pela última vez.
    notifiedAt: { type: Date },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: makeSlug,
    },
    // PIN opcional (2º fator). Vazio = só o link basta.
    pin: { type: String, default: "" },
    cover: { type: mongoose.Schema.Types.ObjectId, ref: "GalleryPhoto" },
    // null = sem expiração.
    expiresAt: { type: Date },
    downloadEnabled: { type: Boolean, default: true },
    allowFavorites: { type: Boolean, default: true },
    // Prova pré-pagamento pode querer marca d'água; entrega final não.
    watermarkPreviews: { type: Boolean, default: false },
    // Quem recebeu o link pode se achar por selfie (útil em grupos grandes).
    // Desligado, o upload nem calcula os descritores de rosto.
    faceSearch: { type: Boolean, default: true },
    // ZIP "baixar todas" pré-gerado no bucket (gallery-zips/, TTL por
    // lifecycle). Vale enquanto as fotos não mudam; zipBuildingAt é a trava
    // contra gerações concorrentes.
    zipKey: { type: String, default: "" },
    zipBuiltAt: { type: Date },
    zipBytes: { type: Number, default: 0 },
    zipPhotoCount: { type: Number, default: 0 },
    zipBuildingAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Gallery ||
  mongoose.model("Gallery", GallerySchema);
