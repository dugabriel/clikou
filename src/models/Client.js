import mongoose from "mongoose";

// Cliente do fotógrafo (mini-CRM): cadastro central para vincular entregas e
// guardar contato/endereço. Diferente do Lead (pedido de orçamento vindo do
// perfil público), aqui é o fotógrafo quem cadastra e mantém.
//
// Galerias guardam clientName/clientEmail denormalizados: o nome sincroniza
// quando o cliente é renomeado; o e-mail é copiado só no vínculo (e se a
// galeria não tiver um) — o notify pode sobrescrever por entrega sem mexer
// no cadastro.
const ClientSchema = new mongoose.Schema(
  {
    photographer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    // Sem o "@" — a UI o exibe.
    instagram: { type: String, default: "", trim: true },
    street: { type: String, default: "", trim: true }, // rua e número
    neighborhood: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    state: { type: String, default: "", trim: true }, // UF
    zip: { type: String, default: "", trim: true }, // CEP
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

// Para listar/buscar por fotógrafo em ordem alfabética. Não-único: duplicado
// é barrado na API com regex sem acento (unique aqui não pegaria "João"/"Joao").
ClientSchema.index({ photographer: 1, name: 1 });

export default mongoose.models.Client || mongoose.model("Client", ClientSchema);
