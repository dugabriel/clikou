import mongoose from "mongoose";

const UsuarioSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    senhaHash: { type: String }, // opcional: contas Google não têm senha
    googleId: { type: String, index: true, sparse: true },
    // false só para cadastro por senha aguardando o link de confirmação
    emailVerificado: { type: Boolean, default: true },
    verificacaoEnviadaEm: { type: Date },
    avatarUrl: { type: String, default: "" },
    saldoCentavos: { type: Number, default: 0 },
    chavePix: { type: String, default: "" },
    // Taxa da plataforma para este fotógrafo; null usa COMISSAO_PORCENTO
    comissaoPorcento: { type: Number, default: null, min: 0, max: 100 },
    // Perfil público (/f/[usuario])
    usuario: { type: String, unique: true, sparse: true, lowercase: true },
    sobre: { type: String, default: "" },
    cidade: { type: String, default: "" },
    website: { type: String, default: "" },
    instagram: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    portfolio: { type: [String], default: [] }, // chaves no storage
  },
  { timestamps: true }
);

export default mongoose.models.Usuario ||
  mongoose.model("Usuario", UsuarioSchema);
