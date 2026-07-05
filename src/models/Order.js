import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [
      {
        photo: { type: mongoose.Schema.Types.ObjectId, ref: "Photo" },
        photographer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        priceCents: Number,
      },
    ],
    totalCents: { type: Number, required: true },
    commissionCents: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "canceled"],
      default: "pending",
      index: true,
    },
    mpPreferenceId: String,
    mpPaymentId: String,
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
