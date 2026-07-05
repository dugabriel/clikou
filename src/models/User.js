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
    avatarUrl: { type: String, default: "" },
    balanceCents: { type: Number, default: 0 },
    pixKey: { type: String, default: "" },
    // Taxa da plataforma para este fotógrafo; null usa COMMISSION_PERCENT
    commissionPercent: { type: Number, default: null, min: 0, max: 100 },
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
