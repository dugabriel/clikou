import mongoose from "mongoose";

// Contador do guardrail anti-spam (ver lib/ratelimit.js). Cada documento é um
// balde "ação + identificador + janela"; o índice TTL apaga os baldes vencidos.
const RateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});

// TTL: o próprio Mongo remove o documento quando expiresAt passa.
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.RateLimit ||
  mongoose.model("RateLimit", RateLimitSchema);
