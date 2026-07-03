import mongoose from "mongoose";

const EventoSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    descricao: { type: String, default: "" },
    data: { type: Date },
    cidade: { type: String, default: "" },
    estado: { type: String, default: "" }, // UF (2 letras)
    categoria: {
      type: String,
      enum: ["esportes", "automotivo", "shows", "formaturas", "outros"],
      default: "outros",
      index: true,
    },
    fotografo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true,
    },
    precoPadraoCentavos: { type: Number, default: 1000 },
    capa: { type: mongoose.Schema.Types.ObjectId, ref: "Foto" },
    publicado: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Evento || mongoose.model("Evento", EventoSchema);
