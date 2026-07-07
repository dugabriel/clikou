import mongoose from "mongoose";

// Coleção do portfólio Pro: um "tipo de projeto" nomeado pelo fotógrafo
// (ex.: "Casamentos", "Corridas") com suas fotos (chaves no storage).
const CollectionSchema = new mongoose.Schema(
  {
    name: { type: String, default: "", trim: true },
    photos: { type: [String], default: [] },
  },
  { _id: true }
);

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
    // Taxa da plataforma para este fotógrafo; null usa COMMISSION_PERCENT.
    // Ignorada para assinantes Pro (comissão sempre zero) — ver lib/plan.js.
    commissionPercent: { type: Number, default: null, min: 0, max: 100 },
    // Assinatura: "free" vende com comissão; "pro" (R$ 49/mês) tem comissão
    // zero + portfólio por coleções. planCurrentPeriodEnd guarda o fim do
    // ciclo pago; mpPreapprovalId liga à assinatura recorrente do MP (etapa 2).
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
      index: true,
    },
    planCurrentPeriodEnd: { type: Date },
    planCycle: { type: String, enum: ["monthly", "annual"], default: "monthly" },
    planTrialEnd: { type: Date },
    mpPreapprovalId: { type: String },
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
    // Personalização Pro da página pública (white-label): cor de destaque
    // (hex; vazio usa o amarelo da clikou) e imagem de capa (chave no storage).
    brandColor: { type: String, default: "" },
    coverKey: { type: String, default: "" },
    // Métricas de divulgação (Pro): contadores da página pública.
    stats: {
      profileViews: { type: Number, default: 0 },
      waClicks: { type: Number, default: 0 },
      igClicks: { type: Number, default: 0 },
      siteClicks: { type: Number, default: 0 },
    },
    // Portfólio por coleções: grátis usa uma única coleção sem nome; Pro
    // organiza em várias nomeadas por tipo de projeto.
    collections: { type: [CollectionSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
