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
  },
  { timestamps: true }
);

export default mongoose.models.Photo || mongoose.model("Photo", PhotoSchema);
