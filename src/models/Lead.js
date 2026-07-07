import mongoose from "mongoose";

// Pedido de orçamento enviado pelo formulário de contato do perfil público
// (recurso Pro): quem quer contratar o fotógrafo deixa nome, contato e mensagem.
const LeadSchema = new mongoose.Schema(
  {
    photographer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true }, // e-mail ou telefone
    message: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
