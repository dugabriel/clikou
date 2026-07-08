import mongoose from "mongoose";

// Foto de uma galeria de entrega. Não guarda faces/hashes (galeria privada
// não é buscável) nem preço (download é a entrega, sem venda avulsa no MVP).
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
    // Favorita do cliente (uma galeria = um cliente, então basta um booleano).
    favorited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.GalleryPhoto ||
  mongoose.model("GalleryPhoto", GalleryPhotoSchema);
