import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Event from "@/models/Event";
import "@/models/Photo";
import "@/models/User";
import EventCard from "@/components/EventCard";
import {
  CameraIcon,
  CartIcon,
  WalletIcon,
  ArrowIcon,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function Home() {
  await dbConnect();
  const events = await Event.find({ published: true })
    .sort({ createdAt: -1 })
    .limit(8)
    .populate("photographer", "name")
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
                href="/events"
                className="group flex items-center gap-2 rounded-full bg-yellow-400 px-7 py-3.5 font-semibold text-zinc-950 transition hover:bg-yellow-300"
              >
                Encontrar minhas fotos
                <ArrowIcon
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-white/30 bg-black/30 px-7 py-3.5 font-semibold text-white backdrop-blur transition hover:border-yellow-400 hover:text-yellow-400"
              >
                Quero vender fotos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Diferencial: a foto acha o cliente */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid items-center gap-10 rounded-3xl border border-white/5 bg-zinc-900/60 p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-400">
              Feito para quem fotografa evento
            </p>
            <h2 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Você fotografa.{" "}
              <span className="text-yellow-400">A foto acha o cliente.</span>
            </h2>
            <p className="mt-4 leading-relaxed text-zinc-400">
              Fotografar nunca foi o problema — é fazer cada participante achar
              a própria foto no meio de milhares. Aqui, quem estava lá envia uma
              selfie e o reconhecimento facial mostra só as fotos em que a
              pessoa aparece. Quem se vê, compra.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2 text-sm">
              {[
                "Selfie encontra o cliente na hora",
                "Print localiza a foto exata",
                "Marca d'água automática",
                "Sua página de portfólio",
              ].map((chip) => (
                <li
                  key={chip}
                  className="rounded-full border border-yellow-400/25 bg-yellow-400/5 px-4 py-1.5 text-zinc-300"
                >
                  {chip}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-yellow-400 px-7 py-3.5 font-semibold text-zinc-950 transition hover:bg-yellow-300"
            >
              Publicar meu primeiro evento
              <ArrowIcon
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* Mock da busca por selfie: as fotos "encontradas" acesas */}
          <div className="relative pt-6">
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 12 }).map((_, i) => {
                const found = {
                  2: "/finder/found-1.jpg",
                  5: "/finder/found-2.jpg",
                  11: "/finder/found-3.jpg",
                }[i];
                return found ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={found}
                    alt="Foto do evento encontrada pela busca por selfie"
                    loading="lazy"
                    className="aspect-[3/4] w-full rounded-lg object-cover ring-2 ring-yellow-400"
                  />
                ) : (
                  <div key={i} className="aspect-[3/4] rounded-lg bg-zinc-800" />
                );
              })}
            </div>
            <div className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap rounded-full border border-yellow-400/40 bg-zinc-950 px-4 py-2 text-sm shadow-lg">
              🤳 Selfie enviada ·{" "}
              <span className="font-semibold text-yellow-400">
                3 fotos suas encontradas
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Eventos recentes */}
      {events.length > 0 && (
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
              href="/events"
              className="hidden items-center gap-1.5 text-sm font-medium text-yellow-400 hover:text-yellow-300 sm:flex"
            >
              Ver todos <ArrowIcon size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((e) => (
              <EventCard key={e._id.toString()} event={e} />
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
                CameraIcon,
                "Crie o evento e suba as fotos",
                "A marca d'água é aplicada automaticamente nos previews. Você define o preço de cada foto.",
              ],
              [
                CartIcon,
                "Compartilhe o link",
                "Mande o link do evento no grupo, no story, onde quiser. Quem estava lá encontra as próprias fotos.",
              ],
              [
                WalletIcon,
                "Receba na carteira",
                "A cada venda, sua parte cai na carteira. Saque via Pix quando quiser.",
              ],
            ].map(([Icon, title, text], i) => (
              <div
                key={title}
                className="relative rounded-2xl border border-white/5 bg-zinc-950 p-7"
              >
                <span className="font-display absolute right-6 top-5 text-5xl font-bold text-zinc-800">
                  {i + 1}
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {text}
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
            href="/dashboard"
            className="shrink-0 rounded-full bg-zinc-950 px-8 py-4 font-semibold text-yellow-400 transition hover:bg-zinc-800"
          >
            Começar agora
          </Link>
        </div>
      </section>
    </div>
  );
}
