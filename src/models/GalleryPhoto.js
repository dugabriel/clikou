import mongoose from "mongoose";

// Foto de uma galeria de entrega. Sem preço (download é a entrega, sem venda
// avulsa no MVP); guarda descritores de rosto para o "ache-se por selfie"
// dentro da galeria, quando a opção está ligada.
const GalleryPhotoSchema = new mongoose.Schema(
  {
    gallery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gallery",
      required: true,
      index: true,
    },
    photographer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalKey: { type: String, required: true },
    previewKey: { type: String, required: true },
    width: Number,
    height: Number,
    fileName: { type: String, default: "foto.jpg" },
    // Tamanho original em bytes — com o nome, identifica reenvio do mesmo
    // arquivo para pular fotos já enviadas.
    fileSize: { type: Number, default: 0 },
    // Favorita do cliente (uma galeria = um cliente, então basta um booleano).
    favorited: { type: Boolean, default: false },
    // Descritores faciais (128 números por rosto), calculados no navegador
    // durante o upload — mesmo esquema das fotos de evento.
    faces: { type: [[Number]], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.GalleryPhoto ||
  mongoose.model("GalleryPhoto", GalleryPhotoSchema);
