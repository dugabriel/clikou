import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import Evento from "@/models/Evento";
import Foto from "@/models/Foto";
import { obterSessao } from "@/lib/auth";
import { formatarPreco } from "@/lib/moeda";
import Uploader from "@/components/Uploader";
import BotaoCopiarLink from "@/components/BotaoCopiarLink";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export default async function GerenciarEvento({ params }) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  const sessao = await obterSessao();
  await dbConnect();
  const evento = await Evento.findById(id).lean();
  if (!evento || evento.fotografo.toString() !== sessao.id) notFound();

  const fotos = await Foto.find({ evento: id })
    .sort({ createdAt: -1 })
    .select("precoCentavos")
    .lean();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{evento.titulo}</h2>
          <p className="text-sm text-zinc-400">
            {fotos.length} fotos · preço padrão{" "}
            {formatarPreco(evento.precoPadraoCentavos)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/eventos/${id}`}
            className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-medium hover:border-zinc-500"
          >
            Ver página pública
          </Link>
          <BotaoCopiarLink caminho={`/eventos/${id}`} />
        </div>
      </div>

      <p className="mt-3 rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-4 py-3 text-sm text-zinc-300">
        Divulgue! Mande o link do evento no grupo do WhatsApp ou poste no
        story — quem estava lá encontra as próprias fotos e compra direto.
      </p>

      <Uploader
        eventoId={id}
        precoPadrao={(evento.precoPadraoCentavos / 100)
          .toFixed(2)
          .replace(".", ",")}
      />

      {fotos.length > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {fotos.map((f) => (
            <div
              key={f._id.toString()}
              className="overflow-hidden rounded-lg border border-zinc-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/fotos/${f._id}/preview`}
                alt="Foto do evento"
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
              <p className="bg-zinc-900 px-2 py-1 text-center text-xs text-zinc-400">
                {formatarPreco(f.precoCentavos)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
