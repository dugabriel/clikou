import Pedido from "@/models/Pedido";
import Usuario from "@/models/Usuario";
import { COMISSAO_PORCENTO } from "@/lib/mp";

// Marca o pedido como pago e credita a parte de cada fotógrafo na carteira.
// Idempotente: se o pedido já está pago, não credita de novo.
export async function aprovarPedido(pedidoId, mpPaymentId = null) {
  const pedido = await Pedido.findOneAndUpdate(
    { _id: pedidoId, status: "pendente" },
    { status: "pago", ...(mpPaymentId ? { mpPaymentId } : {}) },
    { new: true }
  );
  if (!pedido) return null;

  // Taxa individual do fotógrafo, se definida; senão a padrão da plataforma.
  const fotografoIds = [...new Set(pedido.itens.map((i) => i.fotografo.toString()))];
  const fotografos = await Usuario.find({ _id: { $in: fotografoIds } })
    .select("comissaoPorcento")
    .lean();
  const taxas = new Map(
    fotografos.map((f) => [f._id.toString(), f.comissaoPorcento ?? COMISSAO_PORCENTO])
  );

  let comissaoTotal = 0;
  const creditos = new Map();
  for (const item of pedido.itens) {
    const porcento = taxas.get(item.fotografo.toString()) ?? COMISSAO_PORCENTO;
    const comissao = Math.round((item.precoCentavos * porcento) / 100);
    comissaoTotal += comissao;
    const id = item.fotografo.toString();
    creditos.set(id, (creditos.get(id) || 0) + item.precoCentavos - comissao);
  }

  for (const [fotografoId, valor] of creditos) {
    await Usuario.updateOne(
      { _id: fotografoId },
      { $inc: { saldoCentavos: valor } }
    );
  }

  pedido.comissaoCentavos = comissaoTotal;
  await pedido.save();
  return pedido;
}

// Confere se o usuário comprou (pedido pago) a foto.
export async function compraLiberada(usuarioId, fotoId) {
  const pedido = await Pedido.findOne({
    cliente: usuarioId,
    status: "pago",
    "itens.foto": fotoId,
  }).select("_id");
  return !!pedido;
}
