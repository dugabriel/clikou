import mongoose from "mongoose";

const WithdrawalSchema = new mongoose.Schema(
  {
    photographer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amountCents: { type: Number, required: true },
    pixKey: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Withdrawal ||
  mongoose.model("Withdrawal", WithdrawalSchema);
