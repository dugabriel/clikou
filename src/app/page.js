import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Evento from "@/models/Evento";
import "@/models/Foto";
import "@/models/Usuario";
import CardEvento from "@/components/CardEvento";
import {
  IconeCamera,
  IconeCarrinho,
  IconeCarteira,
  IconeDownload,
  IconeSeta,
} from "@/components/Icones";

export const dynamic = "force-dynamic";

export default async function Home() {
  await dbConnect();
  const eventos = await Evento.find({ publicado: true })
    .sort({ createdAt: -1 })
    .limit(8)
    .populate("fotografo", "nome")
    .lean();

  return (
    <div>
      {/* Hero com vídeo */}
      <section className="mx-auto max-w-6xl px-4 pt-6">
        <div className="relative overflow-hidden rounded-3xl">
          <video
            autoPlay
            muted
            loop
            playsInline
            src="/hero.mp4"
            className="h-[70svh] min-h-[480px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-14">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-400">
              Fotos de evento, direto de quem fotografou
            </p>
            <h1 className="font-display mt-4 max-w-4xl text-5xl font-bold uppercase leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl">
              O momento foi seu.
              <br />
              <span className="text-yellow-400">A foto também.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-zinc-300 sm:text-lg">
              Corrida, formatura, festa, campeonato — alguém fotografou. Aqui
              você encontra, compra e baixa em alta resolução, sem marca
              d&apos;água.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/eventos"
                className="group flex items-center gap-2 rounded-full bg-yellow-400 px-7 py-3.5 font-semibold text-zinc-950 transition hover:bg-yellow-300"
              >
                Encontrar minhas fotos
                <IconeSeta
                  tamanho={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/painel"
                className="rounded-full border border-white/30 bg-black/30 px-7 py-3.5 font-semibold text-white backdrop-blur transition hover:border-yellow-400 hover:text-yellow-400"
              >
                Quero vender fotos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Números */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            [IconeCarteira, "80%", "da venda fica com quem fotografou"],
            [IconeDownload, "Na hora", "download em alta liberado após o pagamento"],
            [IconeCamera, "Pra todos", "não precisa ser fotógrafo profissional"],
          ].map(([Icone, numero, texto]) => (
            <div
              key={numero}
              className="flex items-center gap-4 rounded-2xl border border-white/5 bg-zinc-900/60 p-6"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-zinc-950">
                <Icone tamanho={22} />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-white">
                  {numero}
                </p>
                <p className="text-sm text-zinc-400">{texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Eventos recentes */}
      {eventos.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight">
                Eventos recentes
              </h2>
              <p className="mt-1 text-zinc-400">
                Talvez você esteja em uma dessas fotos.
              </p>
            </div>
            <Link
              href="/eventos"
              className="hidden items-center gap-1.5 text-sm font-medium text-yellow-400 hover:text-yellow-300 sm:flex"
            >
              Ver todos <IconeSeta tamanho={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {eventos.map((e) => (
              <CardEvento key={e._id.toString()} evento={e} />
            ))}
          </div>
        </section>
      )}

      {/* Como funciona — 1, 2, 3 */}
      <section className="border-y border-white/5 bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="font-display text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Vender suas fotos é <span className="text-yellow-400">1-2-3</span>
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-zinc-400">
            Fotografou um evento — de celular, de câmera, tanto faz. Em minutos
            suas fotos estão à venda.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              [
                IconeCamera,
                "Crie o evento e suba as fotos",
                "A marca d'água é aplicada automaticamente nos previews. Você define o preço de cada foto.",
              ],
              [
                IconeCarrinho,
                "Compartilhe o link",
                "Mande o link do evento no grupo, no story, onde quiser. Quem estava lá encontra as próprias fotos.",
              ],
              [
                IconeCarteira,
                "Receba na carteira",
                "A cada venda, sua parte cai na carteira. Saque via Pix quando quiser.",
              ],
            ].map(([Icone, titulo, texto], i) => (
              <div
                key={titulo}
                className="relative rounded-2xl border border-white/5 bg-zinc-950 p-7"
              >
                <span className="font-display absolute right-6 top-5 text-5xl font-bold text-zinc-800">
                  {i + 1}
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
                  <Icone tamanho={22} />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-yellow-400 p-10 sm:flex-row sm:items-center sm:p-14">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              Tem fotos de um evento paradas no cartão?
            </h2>
            <p className="mt-2 max-w-xl text-zinc-800">
              Elas valem dinheiro. Publique na clikou e transforme cada clique
              em renda — sem mensalidade, você só paga quando vende.
            </p>
          </div>
          <Link
            href="/painel"
            className="shrink-0 rounded-full bg-zinc-950 px-8 py-4 font-semibold text-yellow-400 transition hover:bg-zinc-800"
          >
            Começar agora
          </Link>
        </div>
      </section>
    </div>
  );
}
