import Link from "next/link";
import { formatarPreco } from "@/lib/moeda";
import { rotuloCategoria } from "@/lib/categorias";
import { IconeCamera } from "@/components/Icones";

export default function CardEvento({ evento }) {
  return (
    <Link
      href={`/eventos/${evento._id}`}
      className="group overflow-hidden rounded-2xl border border-white/5 bg-zinc-900 transition hover:border-yellow-400/40"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-800">
        {evento.capa ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/fotos/${evento.capa}/preview`}
            alt={evento.titulo}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-600">
            <IconeCamera tamanho={40} />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-yellow-400 backdrop-blur">
          a partir de {formatarPreco(evento.precoPadraoCentavos)}
        </span>
      </div>
      <div className="p-4">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
          {rotuloCategoria(evento.categoria)}
        </p>
        <h3 className="font-display font-semibold tracking-tight group-hover:text-yellow-400">
          {evento.titulo}
        </h3>
        <p className="mt-1 text-sm text-zinc-400">
          {evento.cidade && (
            <span>
              {evento.cidade}
              {evento.estado && ` – ${evento.estado}`} ·{" "}
            </span>
          )}
          {evento.data &&
            new Date(evento.data).toLocaleDateString("pt-BR", {
              timeZone: "UTC",
            })}
        </p>
        <p className="mt-1.5 text-xs text-zinc-500">
          por {evento.fotografo?.nome || "fotógrafo"}
        </p>
      </div>
    </Link>
  );
}
