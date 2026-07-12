import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    date: { type: Date },
    city: { type: String, default: "" },
    state: { type: String, default: "" }, // UF (2 letras)
    category: {
      type: String,
      enum: ["sports", "automotive", "shows", "graduations", "others"],
      default: "others",
      index: true,
    },
    photographer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    defaultPriceCents: { type: Number, default: 1000 },
    cover: { type: mongoose.Schema.Types.ObjectId, ref: "Photo" },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// A vitrine pública filtra published e ordena por createdAt desc — sem este
// índice a consulta vira scan + sort quando o catálogo crescer.
EventSchema.index({ published: 1, createdAt: -1 });

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
