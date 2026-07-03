import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import Usuario from "@/models/Usuario";
import Evento from "@/models/Evento";
import Foto from "@/models/Foto";
import CardEvento from "@/components/CardEvento";
import { MarcaIcone } from "@/components/Logo";
import {
  IconeGlobo,
  IconeInstagram,
  IconeWhatsApp,
  IconeCamera,
  IconeSeta,
} from "@/components/Icones";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { usuario } = await params;
  await dbConnect();
  const perfil = await Usuario.findOne({ usuario }).select("nome sobre").lean();
  if (!perfil) return { title: "Perfil não encontrado — Clikou" };
  return {
    title: `${perfil.nome} — fotógrafo na Clikou`,
    description: perfil.sobre || `Fotos de eventos por ${perfil.nome}.`,
  };
}

export default async function PerfilPublico({ params }) {
  const { usuario } = await params;
  await dbConnect();
  const perfil = await Usuario.findOne({ usuario })
    .select("nome sobre cidade website instagram whatsapp portfolio avatarUrl")
    .lean();
  if (!perfil) notFound();

  const [eventos, totalFotos] = await Promise.all([
    Evento.find({ fotografo: perfil._id, publicado: true })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean(),
    Foto.countDocuments({ fotografo: perfil._id }),
  ]);

  const sociais = [
    perfil.instagram && {
      Icone: IconeInstagram,
      rotulo: `@${perfil.instagram}`,
      href: `https://instagram.com/${perfil.instagram}`,
    },
    perfil.whatsapp && {
      Icone: IconeWhatsApp,
      rotulo: "WhatsApp",
      href: `https://wa.me/${perfil.whatsapp}`,
    },
    perfil.website && {
      Icone: IconeGlobo,
      rotulo: perfil.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
      href: perfil.website,
    },
  ].filter(Boolean);

  return (
    <div className="relative overflow-hidden">
      {/* brilho de fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl"
      />

      {/* Cabeçalho do perfil */}
      <section className="relative mx-auto max-w-4xl px-4 pt-20 text-center">
        {perfil.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={perfil.avatarUrl}
            alt={perfil.nome}
            className="mx-auto h-28 w-28 rounded-full object-cover ring-4 ring-yellow-400"
          />
        ) : (
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-zinc-800 text-4xl font-bold text-yellow-400 ring-4 ring-yellow-400">
            {perfil.nome[0]?.toUpperCase()}
          </div>
        )}

        <h1 className="font-display mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
          {perfil.nome}
        </h1>
        <p className="mt-2 text-yellow-400">
          clikou/f/{usuario}
          {perfil.cidade && (
            <span className="text-zinc-500"> · {perfil.cidade}</span>
          )}
        </p>

        {perfil.sobre && (
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-zinc-300">
            {perfil.sobre}
          </p>
        )}

        {sociais.length > 0 && (
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {sociais.map(({ Icone, rotulo, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-5 py-2.5 text-sm font-medium transition hover:border-yellow-400 hover:text-yellow-400"
              >
                <Icone tamanho={17} />
                {rotulo}
              </a>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center gap-10 text-center">
          <div>
            <p className="font-display text-3xl font-bold text-yellow-400">
              {eventos.length}
            </p>
            <p className="text-sm text-zinc-500">
              evento{eventos.length !== 1 && "s"}
            </p>
          </div>
          <div className="w-px bg-zinc-800" />
          <div>
            <p className="font-display text-3xl font-bold text-yellow-400">
              {totalFotos}
            </p>
            <p className="text-sm text-zinc-500">
              foto{totalFotos !== 1 && "s"} à venda
            </p>
          </div>
        </div>
      </section>

      {/* Portfólio */}
      {perfil.portfolio.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pt-20">
          <h2 className="font-display mb-6 flex items-center gap-2.5 text-2xl font-bold tracking-tight">
            <IconeCamera tamanho={24} className="text-yellow-400" />
            Portfólio
          </h2>
          <div className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] sm:grid-cols-4">
            {perfil.portfolio.map((chave, i) => (
              <div
                key={chave}
                className={`overflow-hidden rounded-2xl border border-white/5 ${
                  i === 0 ? "col-span-2 row-span-2" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/${chave}`}
                  alt={`Portfólio de ${perfil.nome}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Eventos */}
      {eventos.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pt-20">
          <h2 className="font-display mb-6 text-2xl font-bold tracking-tight">
            Eventos com fotos à venda
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eventos.map((e) => (
              <CardEvento
                key={e._id.toString()}
                evento={{ ...e, fotografo: { nome: perfil.nome } }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Rodapé da página do fotógrafo */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <Link
          href="/painel"
          className="inline-flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/80 px-6 py-3 text-sm text-zinc-400 transition hover:border-yellow-400 hover:text-yellow-400"
        >
          <MarcaIcone tamanho={20} />
          Fotografa? Crie sua página grátis na clikou
          <IconeSeta tamanho={15} />
        </Link>
      </section>
    </div>
  );
}
