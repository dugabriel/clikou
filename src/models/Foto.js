import mongoose from "mongoose";

const FotoSchema = new mongoose.Schema(
  {
    evento: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evento",
      required: true,
      index: true,
    },
    fotografo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true,
    },
    precoCentavos: { type: Number, required: true },
    chaveOriginal: { type: String, required: true },
    chavePreview: { type: String, required: true },
    largura: Number,
    altura: Number,
    nomeArquivo: { type: String, default: "foto.jpg" },
    // Descritores faciais (128 números por rosto) extraídos no navegador
    // durante o upload — usados na busca por selfie dentro do evento.
    rostos: { type: [[Number]], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Foto || mongoose.model("Foto", FotoSchema);
