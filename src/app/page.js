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
  GlobeIcon,
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
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
          <div className="relative flex min-h-[70svh] flex-col justify-end p-6 pt-24 sm:p-14">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-400">
              A ferramenta dos fotógrafos de evento
            </p>
            <h1 className="font-display mt-4 max-w-4xl text-5xl font-bold uppercase leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl">
              Divulgue seu trabalho.
              <br />
              <span className="text-yellow-400">Venda sem comissão.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-zinc-300 sm:text-lg">
              Uma página profissional pra colar na bio, galerias pra entregar
              trabalhos ao cliente e suas fotos à venda com busca por selfie.
              Grátis pra começar; no Pro você fica com 100% de cada venda.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup?next=/dashboard/profile"
                className="group flex items-center gap-2 rounded-full bg-yellow-400 px-7 py-3.5 font-semibold text-zinc-950 transition hover:bg-yellow-300"
              >
                Criar minha página grátis
                <ArrowIcon
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/portfolio"
                className="rounded-full border border-white/30 bg-black/30 px-7 py-3.5 font-semibold text-white backdrop-blur transition hover:border-yellow-400 hover:text-yellow-400"
              >
                Ver planos
              </Link>
            </div>
            <p className="mt-4 text-sm text-zinc-300">
              🎫 Comprou entrada num evento?{" "}
              <Link
                href="/events"
                className="font-semibold text-yellow-400 underline-offset-2 hover:underline"
              >
                Ache suas fotos aqui
              </Link>
              .
            </p>
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

          {/* Mock da busca por selfie: grid cheio de fotos, só as "encontradas" acesas */}
          <div className="relative pt-6">
            <div className="grid grid-cols-3 gap-2">
              {[
                { src: "/finder/other-1.jpg" },
                { src: "/finder/found-1.jpg", found: true },
                { src: "/finder/other-2.jpg" },
                { src: "/finder/found-2.jpg", found: true },
                { src: "/finder/other-3.jpg" },
                { src: "/finder/other-4.jpg" },
                { src: "/finder/other-5.jpg" },
                { src: "/finder/other-6.jpg" },
                { src: "/finder/found-3.jpg", found: true },
              ].map(({ src, found }) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt={
                    found
                      ? "Foto do evento encontrada pela busca por selfie"
                      : "Foto do evento de outro participante"
                  }
                  loading="lazy"
                  className={`aspect-[3/4] w-full rounded-lg object-cover ${
                    found
                      ? "ring-2 ring-yellow-400"
                      : "opacity-10"
                  }`}
                />
              ))}
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

      {/* Kit do fotógrafo */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-400">
            Tudo num lugar só
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            O kit completo de quem vive da{" "}
            <span className="text-yellow-400">fotografia</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Do primeiro clique ao pagamento: divulgar, entregar e vender o seu
            trabalho sem juntar mil ferramentas.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            [
              "🖼️",
              "Portfólio pra bio",
              "Sua página clikou.click/f/seunome com suas melhores fotos, sua história e seus contatos — pronta pra colar no Instagram.",
            ],
            [
              "📦",
              "Galeria de entrega",
              "Entregue ensaios e casamentos num link privado com PIN. O cliente favorita e baixa em alta, uma a uma ou tudo em ZIP.",
            ],
            [
              "🤳",
              "Busca por selfie e print",
              "No evento, o cliente manda uma selfie (ou o print de uma foto) e acha na hora as fotos em que aparece.",
            ],
            [
              "💸",
              "Venda sem comissão",
              "Pagamento online com download em alta liberado na hora. No Pro, você fica com 100% de cada venda.",
            ],
            [
              "🎨",
              "Página com a sua cara",
              "No Pro, use a sua cor e a sua capa e esconda a marca clikou — a página fica com o seu branding.",
            ],
            [
              "📈",
              "Orçamentos e métricas",
              "Receba pedidos de contratação pela sua página e acompanhe visitas e cliques nos seus contatos.",
            ],
          ].map(([emoji, title, text]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/5 bg-zinc-900/60 p-6 transition hover:border-yellow-400/30"
            >
              <div className="text-3xl">{emoji}</div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/signup?next=/dashboard/profile"
            className="group inline-flex items-center gap-2 rounded-full bg-yellow-400 px-7 py-3.5 font-semibold text-zinc-950 transition hover:bg-yellow-300"
          >
            Criar minha conta grátis
            <ArrowIcon
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
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

      {/* Por que vender na clikou */}
      <section className="border-y border-white/5 bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="font-display text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Do cartão de memória <span className="text-yellow-400">pro Pix</span>
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-zinc-400">
            Sem montar site, sem correr atrás de comprador. Grátis pra começar;
            no Pro, zero comissão. Celular ou câmera, tanto faz.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {[
              [
                CameraIcon,
                "Publique em minutos",
                "Crie o evento e arraste as fotos: preview com marca d'água e proteção contra cópia, tudo automático. O preço é você quem define — e só paga quando vende.",
              ],
              [
                CartIcon,
                "O cliente se acha sozinho",
                "Compartilhe um link no story ou no grupo do evento. Quem estava lá envia uma selfie e vê só as fotos em que aparece — acabou o \"tem foto minha?\".",
              ],
              [
                WalletIcon,
                "Venda enquanto dorme",
                "Pagamento aprovado libera o download em alta na hora e sua parte cai na carteira, sem você mover um dedo. Saque via Pix quando quiser.",
              ],
            ].map(([Icon, title, text]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/5 bg-zinc-950 p-7 transition hover:border-yellow-400/30"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {text}
                </p>
              </div>
            ))}

            {/* Card destaque: portfólio (tem landing própria) */}
            <Link
              href="/portfolio"
              className="group flex flex-col rounded-2xl border border-yellow-400/40 bg-yellow-400/5 p-7 transition hover:border-yellow-400 hover:bg-yellow-400/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-zinc-950">
                  <GlobeIcon size={22} />
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/demo-avatar.jpg"
                  alt="Exemplo de portfólio na clikou"
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-yellow-400"
                />
              </div>
              <h3 className="mt-5 text-lg font-semibold">
                Seu portfólio, pronto pra bio
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Sua página pública reúne seus eventos, melhores fotos e
                contatos. Compartilhe como portfólio profissional e receba
                pedidos de contratação.
              </p>
              <p className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-block rounded-full border border-yellow-400/30 bg-zinc-950 px-3.5 py-1.5 font-mono text-xs text-yellow-400">
                  clikou.click/f/seunome
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-yellow-400">
                  Conhecer o portfólio
                  <ArrowIcon
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </p>
            </Link>
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full border border-yellow-400/40 px-7 py-3 font-semibold text-yellow-400 transition hover:bg-yellow-400 hover:text-zinc-950"
            >
              Começar a vender — leva 2 minutos
              <ArrowIcon
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
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
              em renda — grátis pra começar, e no Pro você fica com 100%.
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
