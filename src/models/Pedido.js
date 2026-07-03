import mongoose from "mongoose";

const PedidoSchema = new mongoose.Schema(
  {
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true,
    },
    itens: [
      {
        foto: { type: mongoose.Schema.Types.ObjectId, ref: "Foto" },
        fotografo: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
        precoCentavos: Number,
      },
    ],
    totalCentavos: { type: Number, required: true },
    comissaoCentavos: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pendente", "pago", "cancelado"],
      default: "pendente",
      index: true,
    },
    mpPreferenceId: String,
    mpPaymentId: String,
  },
  { timestamps: true }
);

export default mongoose.models.Pedido || mongoose.model("Pedido", PedidoSchema);
