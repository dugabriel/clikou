import Link from "next/link";
import { CameraIcon, CartIcon, GlobeIcon, WalletIcon, ArrowIcon } from "@/components/Icons";

export const metadata = {
  title: "Portfólio grátis para fotógrafos — link pra bio que vende — Clikou",
  description:
    "Crie seu portfólio profissional de fotógrafo em 2 minutos, grátis: página com suas melhores fotos, contatos para contratação e seus eventos à venda. Perfeito para a bio do Instagram.",
  keywords: [
    "portfólio de fotógrafo",
    "portfólio fotógrafo grátis",
    "link para bio fotógrafo",
    "página de fotógrafo",
    "site para fotógrafo grátis",
  ],
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Seu portfólio profissional de fotógrafo — grátis, em 2 minutos",
    description:
      "Página com suas melhores fotos, contatos e seus eventos à venda. Perfeita para a bio.",
    url: "/portfolio",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "clikou" }],
  },
};

const DEMO_THUMBS = [1, 2, 3, 4, 5, 6].map((n) => `/demo/thumb-${n}.jpg`);

export default function PortfolioLanding() {
  return (
    <div>
      {/* Hero + mock ao vivo */}
      <section className="mx-auto max-w-6xl px-4 pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-400">
              Portfólio + vitrine de vendas
            </p>
            <h1 className="font-display mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              Seu portfólio profissional,{" "}
              <span className="text-yellow-400">pronto em 2 minutos</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-zinc-300">
              Uma página só sua com suas melhores fotos, seus contatos e seus
              eventos à venda. Grátis, sem código, sem mensalidade — feita para
              colar na bio do Instagram.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup?next=/dashboard/profile"
                className="group flex items-center gap-2 rounded-full bg-yellow-400 px-7 py-3.5 font-semibold text-zinc-950 transition hover:bg-yellow-300"
              >
                Criar meu portfólio grátis
                <ArrowIcon size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/f/demo"
                className="rounded-full border border-zinc-700 px-7 py-3.5 font-semibold text-zinc-200 transition hover:border-yellow-400 hover:text-yellow-400"
              >
                Ver um exemplo ao vivo
              </Link>
            </div>
          </div>

          {/* Mock navegável do perfil demo */}
          <Link
            href="/f/demo"
            className="group block overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl transition hover:border-yellow-400/40"
          >
            {/* barra de navegador */}
            <div className="flex items-center gap-2 border-b border-white/5 bg-zinc-950 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="ml-3 rounded-full bg-zinc-900 px-4 py-1 font-mono text-xs text-zinc-400">
                clikou.click/f/<span className="text-yellow-400">demo</span>
              </span>
            </div>
            {/* miniatura do perfil */}
            <div className="px-6 pb-6 pt-7 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/demo-avatar.jpg"
                alt="Marina Duarte, fotógrafa de eventos esportivos"
                className="mx-auto h-20 w-20 rounded-full object-cover ring-4 ring-yellow-400"
              />
              <p className="font-display mt-4 text-2xl font-bold">Marina Duarte</p>
              <p className="mt-1 text-sm text-yellow-400">
                clikou/f/demo <span className="text-zinc-500">· São Paulo, SP</span>
              </p>
              <p className="mx-auto mt-3 max-w-sm text-sm text-zinc-400">
                Fotografo corridas de rua e eventos esportivos em São Paulo há
                6 anos…
              </p>
              <div className="mt-5 grid grid-cols-3 gap-1.5">
                {DEMO_THUMBS.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt="Foto do portfólio de exemplo"
                    loading="lazy"
                    className="aspect-square w-full rounded-md object-cover"
                  />
                ))}
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-zinc-500 transition group-hover:text-yellow-400">
                Clique para ver o perfil de verdade →
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Por que ele é diferente */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="font-display text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Não é só portfólio. <span className="text-yellow-400">É portfólio que vende.</span>
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-zinc-400">
          Linktree mostra links. Site próprio custa caro e dá trabalho. A sua
          página na clikou faz as duas coisas — e ainda fecha negócio.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {[
            [
              GlobeIcon,
              "Um link só pra bio",
              "clikou.click/f/seunome: suas 8 melhores fotos, sua história e sua cidade, num endereço fácil de falar em voz alta.",
            ],
            [
              CartIcon,
              "Seus eventos à venda na mesma página",
              "Quem chega pelo portfólio já vê as galerias dos seus eventos e compra na hora — o portfólio vira canal de venda, não só cartão de visita.",
            ],
            [
              CameraIcon,
              "Contratação sem fricção",
              "Botões de WhatsApp, Instagram e site direto no topo. Organizador de evento gostou do trabalho? Fala com você em um toque.",
            ],
            [
              WalletIcon,
              "Grátis de verdade",
              "Sem mensalidade, sem plano pago, sem marca d'água no seu portfólio. A clikou só ganha quando você vende fotos de evento.",
            ],
          ].map(([Icon, title, text]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/5 bg-zinc-900/60 p-7 transition hover:border-yellow-400/30"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
                <Icon size={22} />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Como criar */}
      <section className="border-y border-white/5 bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="font-display text-center text-3xl font-bold tracking-tight">
            No ar em <span className="text-yellow-400">3 passos</span>
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              ["Crie sua conta grátis", "E-mail ou Google — leva menos de um minuto."],
              ["Monte sua página", "Escolha seu clikou/f/seunome, escreva sua bio e suba até 8 fotos do seu melhor trabalho."],
              ["Cole o link na bio", "Pronto: portfólio, contato e vendas no mesmo lugar. Atualize quando quiser."],
            ].map(([title, text], i) => (
              <div key={title} className="rounded-2xl border border-white/5 bg-zinc-950 p-7 text-center">
                <span className="font-display mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-lg font-bold text-zinc-950">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/signup?next=/dashboard/profile"
              className="group inline-flex items-center gap-2 rounded-full bg-yellow-400 px-8 py-4 font-semibold text-zinc-950 transition hover:bg-yellow-300"
            >
              Começar meu portfólio agora
              <ArrowIcon size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="mt-3 text-sm text-zinc-500">
              Grátis para sempre · sem cartão de crédito
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
