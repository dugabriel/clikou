import mongoose from "mongoose";

const PhotoSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    photographer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    priceCents: { type: Number, required: true },
    originalKey: { type: String, required: true },
    previewKey: { type: String, required: true },
    width: Number,
    height: Number,
    fileName: { type: String, default: "foto.jpg" },
    // Descritores faciais (128 números por rosto) extraídos no navegador
    // durante o upload — usados na busca por selfie dentro do evento.
    faces: { type: [[Number]], default: [] },
    // Hashes perceptuais do preview (hex de 64 bits) — usados na busca
    // por print ("tenho uma imagem dessa foto"). Fotos antigas sem hash
    // são preenchidas sob demanda pela rota de busca.
    dhash: { type: String },
    phash: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Photo || mongoose.model("Photo", PhotoSchema);
