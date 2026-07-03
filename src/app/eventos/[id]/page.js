import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import Evento from "@/models/Evento";
import Foto from "@/models/Foto";
import Pedido from "@/models/Pedido";
import "@/models/Usuario";
import { obterSessao } from "@/lib/auth";
import GaleriaCompra from "@/components/GaleriaCompra";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export default async function PaginaEvento({ params }) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await dbConnect();
  const evento = await Evento.findById(id)
    .populate("fotografo", "nome usuario")
    .lean();
  if (!evento || !evento.publicado) notFound();

  const fotos = await Foto.find({ evento: id })
    .sort({ createdAt: 1 })
    .select("precoCentavos largura altura")
    .lean();

  // Fotos que o usuário logado já comprou neste evento
  const sessao = await obterSessao();
  let compradas = [];
  if (sessao) {
    const pedidos = await Pedido.find({
      cliente: sessao.id,
      status: "pago",
      "itens.foto": { $in: fotos.map((f) => f._id) },
    })
      .select("itens.foto")
      .lean();
    compradas = pedidos.flatMap((p) => p.itens.map((i) => i.foto.toString()));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{evento.titulo}</h1>
        <p className="mt-1 text-zinc-400">
          {evento.cidade && (
            <span>
              {evento.cidade}
              {evento.estado && ` – ${evento.estado}`} ·{" "}
            </span>
          )}
          {evento.data &&
            new Date(evento.data).toLocaleDateString("pt-BR", {
              timeZone: "UTC",
            })}{" "}
          · por{" "}
          {evento.fotografo?.usuario ? (
            <Link
              href={`/f/${evento.fotografo.usuario}`}
              className="text-yellow-400 hover:underline"
            >
              {evento.fotografo.nome}
            </Link>
          ) : (
            evento.fotografo?.nome
          )}
        </p>
        {evento.descricao && (
          <p className="mt-3 max-w-2xl text-zinc-300">{evento.descricao}</p>
        )}
      </div>

      <GaleriaCompra
        fotos={fotos.map((f) => ({
          id: f._id.toString(),
          precoCentavos: f.precoCentavos,
        }))}
        compradas={compradas}
        logado={!!sessao}
        eventoId={id}
      />
    </div>
  );
}
