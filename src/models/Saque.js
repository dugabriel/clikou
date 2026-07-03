import mongoose from "mongoose";

const SaqueSchema = new mongoose.Schema(
  {
    fotografo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true,
    },
    valorCentavos: { type: Number, required: true },
    chavePix: { type: String, required: true },
    status: {
      type: String,
      enum: ["pendente", "pago", "recusado"],
      default: "pendente",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Saque || mongoose.model("Saque", SaqueSchema);
