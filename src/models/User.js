import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String }, // opcional: contas Google não têm senha
    googleId: { type: String, index: true, sparse: true },
    // false só para cadastro por senha aguardando o link de confirmação
    emailVerified: { type: Boolean, default: true },
    verificationSentAt: { type: Date },
    resetSentAt: { type: Date }, // cooldown do "esqueci minha senha"
    avatarUrl: { type: String, default: "" },
    balanceCents: { type: Number, default: 0 },
    pixKey: { type: String, default: "" },
    // Conta Mercado Pago conectada via OAuth (split automático nas vendas)
    mpUserId: { type: String },
    mpAccessToken: { type: String },
    mpRefreshToken: { type: String },
    mpTokenExpiresAt: { type: Date },
    // Taxa da plataforma para este fotógrafo; null usa COMMISSION_PERCENT
    commissionPercent: { type: Number, default: null, min: 0, max: 100 },
    // Dados cadastrais exigidos para vender (identificação legal do
    // vendedor — não aparecem no perfil público)
    cpf: { type: String, default: "" }, // só dígitos
    birthDate: { type: Date },
    phone: { type: String, default: "" },
    address: {
      cep: { type: String, default: "" },
      street: { type: String, default: "" },
      number: { type: String, default: "" },
      complement: { type: String, default: "" },
      district: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
    },
    // Perfil público (/f/[username])
    username: { type: String, unique: true, sparse: true, lowercase: true },
    bio: { type: String, default: "" },
    city: { type: String, default: "" },
    website: { type: String, default: "" },
    instagram: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    portfolio: { type: [String], default: [] }, // chaves no storage
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
