import Link from "next/link";
import { CameraIcon, CartIcon, GlobeIcon, WalletIcon, ArrowIcon, CheckIcon, DownloadIcon, HeartIcon } from "@/components/Icons";
import { COMMISSION_PERCENT } from "@/lib/mp";

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
    "galeria de entrega de fotos",
    "entregar fotos para cliente",
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

// Depoimentos reais de fotógrafos. Deixe vazio até ter frases de verdade
// (com autorização de publicar) — a seção só aparece quando há itens.
// Formato: { quote, name, handle }
const TESTIMONIALS = [];

const FAQ = [
  [
    "É grátis mesmo?",
    `Sim. Você cria sua conta, monta sua página e recebe clientes sem pagar nada. No plano grátis a clikou fica com ${COMMISSION_PERCENT}% de cada venda de foto. O Pro (R$ 49/mês) zera essa comissão e libera coleções, página sem a marca clikou e mais.`,
  ],
  [
    "Preciso entender de tecnologia?",
    "Não. Você escolhe seu endereço (clikou.click/f/seunome), escreve uma bio e arrasta suas fotos. Sem código, sem hospedagem, sem configurar nada.",
  ],
  [
    "Como funciona a entrega para o cliente?",
    "Você cria uma galeria privada do trabalho, sobe as fotos e manda um link (com PIN opcional). O cliente vê, favorita e baixa em alta — inclusive tudo de uma vez em ZIP — sem precisar criar conta.",
  ],
  [
    "Como eu recebo o dinheiro das vendas?",
    "As vendas caem na sua carteira dentro da clikou e você saca via Pix. Fotógrafos que conectam a conta do Mercado Pago recebem direto, com o repasse automático.",
  ],
  [
    "Posso cancelar o Pro quando quiser?",
    "Pode, a qualquer momento, direto no painel. Você continua no Pro até o fim do período já pago e depois volta ao plano grátis — sem multa.",
  ],
  [
    "O cliente precisa ter conta na clikou para comprar ou baixar?",
    "Não. Quem compra fotos de um evento ou recebe uma galeria de entrega acessa tudo pelo link, sem cadastro.",
  ],
];

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
              eventos à venda. Grátis para começar, sem código — feita para
              colar na bio do Instagram. No Pro, organize por coleções e venda
              sem comissão.
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
              "Comece grátis, cresça no Pro",
              "Monte a página sem pagar nada. Quando quiser vender sem comissão e separar o trabalho por coleções, o Pro sai por R$ 49/mês.",
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

      {/* Galeria de entrega */}
      <section className="border-y border-white/5 bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-400">
                Entrega para o cliente
              </p>
              <h2 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Entregue o trabalho num{" "}
                <span className="text-yellow-400">link bonito</span>, não num
                WeTransfer que expira
              </h2>
              <p className="mt-5 text-zinc-300">
                Terminou o ensaio ou o casamento? Crie uma galeria privada,
                suba as fotos e mande um link pro cliente. Ele vê em alta,
                escolhe as favoritas e baixa — sem instalar nada, sem criar
                conta.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-200">
                {[
                  "Link privado com PIN opcional e data de expiração",
                  "O cliente favorita as fotos que quer",
                  "Baixa em alta uma a uma ou tudo de uma vez em ZIP",
                  "Avise o cliente por e-mail com um clique",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <CheckIcon
                      size={18}
                      className="mt-0.5 shrink-0 text-yellow-400"
                    />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-zinc-400">
                Incluído no grátis (1 galeria) e ilimitado no Pro.
              </p>
            </div>

            {/* mock da galeria de entrega */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/5 bg-zinc-900 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="ml-3 rounded-full bg-zinc-950 px-4 py-1 font-mono text-xs text-zinc-400">
                  clikou.click/g/<span className="text-yellow-400">•••</span>
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Casamento Ana &amp; João</p>
                    <p className="text-xs text-zinc-500">248 fotos</p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-zinc-950">
                    <DownloadIcon size={13} /> Baixar todas
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-1.5">
                  {DEMO_THUMBS.map((src, i) => (
                    <div key={src} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        loading="lazy"
                        className="aspect-square w-full rounded-md object-cover"
                      />
                      {i % 2 === 0 && (
                        <span className="absolute left-1 top-1 text-red-500">
                          <HeartIcon size={13} filled />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grátis vs Pro */}
      <section className="border-y border-white/5 bg-zinc-900/40">
        <div className="mx-auto max-w-4xl px-4 py-20">
          <h2 className="font-display text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Comece grátis. <span className="text-yellow-400">Cresça no Pro.</span>
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-zinc-400">
            No grátis a clikou fica com {COMMISSION_PERCENT}% de cada venda. No Pro você paga uma
            mensalidade fixa e fica com 100%.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {/* Grátis */}
            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
                Grátis
              </p>
              <p className="font-display mt-1 text-4xl font-bold">R$ 0</p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                {[
                  "Sua página clikou/f/seunome",
                  "Até 8 fotos no portfólio",
                  `Venda de eventos com ${COMMISSION_PERCENT}% de comissão`,
                  "Contatos de WhatsApp, Instagram e site",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <CheckIcon size={18} className="mt-0.5 shrink-0 text-zinc-500" />
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?next=/dashboard/profile"
                className="mt-8 block rounded-full border border-white/15 py-3 text-center font-medium text-zinc-200 transition hover:border-yellow-400/60 hover:text-yellow-400"
              >
                Criar página grátis
              </Link>
            </div>

            {/* Pro */}
            <div className="relative rounded-3xl border border-yellow-400/40 bg-yellow-400/5 p-8">
              <span className="absolute -top-3 right-6 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-zinc-950">
                MAIS POPULAR
              </span>
              <p className="text-sm font-semibold uppercase tracking-widest text-yellow-400">
                Pro
              </p>
              <p className="font-display mt-1 text-4xl font-bold">
                R$ 49
                <span className="text-lg font-normal text-zinc-400">/mês</span>
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                ou R$ 490/ano · <span className="text-yellow-400">14 dias grátis</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-100">
                {[
                  "Tudo do grátis, e mais:",
                  "Comissão zero — 100% de cada venda é seu",
                  "Portfólio por coleções (Casamentos, Corridas…)",
                  "Página com a sua cara: cor e capa, sem marca clikou",
                  "Métricas de visitas e pedidos de orçamento",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <CheckIcon size={18} className="mt-0.5 shrink-0 text-yellow-400" />
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?next=/dashboard/plan"
                className="group mt-8 flex items-center justify-center gap-2 rounded-full bg-yellow-400 py-3 font-semibold text-zinc-950 transition hover:bg-yellow-300"
              >
                Testar o Pro grátis
                <ArrowIcon size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
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

      {/* Depoimentos — aparece só quando TESTIMONIALS tiver itens reais */}
      {TESTIMONIALS.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="font-display text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Quem já usa <span className="text-yellow-400">recomenda</span>
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="rounded-2xl border border-white/5 bg-zinc-900/60 p-7"
              >
                <blockquote className="text-sm leading-relaxed text-zinc-200">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold">{t.name}</span>
                  {t.handle && (
                    <span className="text-zinc-500"> · {t.handle}</span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20">
        <h2 className="font-display text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Perguntas frequentes
        </h2>
        <div className="mt-10 divide-y divide-white/5 rounded-2xl border border-white/5 bg-zinc-900/40">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {q}
                <span className="text-yellow-400 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{a}</p>
            </details>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/signup?next=/dashboard/profile"
            className="group inline-flex items-center gap-2 rounded-full bg-yellow-400 px-8 py-4 font-semibold text-zinc-950 transition hover:bg-yellow-300"
          >
            Criar minha conta grátis
            <ArrowIcon
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <p className="mt-3 text-sm text-zinc-500">
            Grátis para sempre · sem cartão de crédito
          </p>
        </div>
      </section>
    </div>
  );
}
