import Link from "next/link";
import { CheckIcon, XIcon, ArrowIcon } from "@/components/Icons";
import { COMMISSION_PERCENT } from "@/lib/mp";

export const metadata = {
  title: "Sobre a clikou — a ferramenta que se paga sozinha",
  description:
    "A clikou reúne portfólio, entrega ao cliente e venda num lugar só. No Pro a comissão é zero: você fica com 100% de cada venda — e a assinatura se paga com uma única venda no mês.",
  alternates: { canonical: "/about" },
};

// Reframe da venda: no grátis a plataforma tira a comissão padrão de cada
// venda; no Pro, nada. O número da esquerda é ilustrativo (um mês de
// R$ 1.000 em vendas).
const EXAMPLE_SALES = 1000;
const FREE_COMMISSION = COMMISSION_PERCENT / 100;
const PRO_MONTHLY = 49;
const freeKeeps = EXAMPLE_SALES * (1 - FREE_COMMISSION); // 800
const proKeeps = EXAMPLE_SALES - PRO_MONTHLY; // 951
const brl = (n) => `R$ ${n.toLocaleString("pt-BR")}`;

const FREE_LIMITS = [
  `${COMMISSION_PERCENT}% de comissão em cada venda`,
  "1 coleção no portfólio (até 8 fotos)",
  "1 galeria de entrega",
  "Marca clikou na sua página",
];

const PRO_PERKS = [
  "Comissão zero — 100% de cada venda é seu",
  "Até 20 coleções, 100 fotos cada, com nomes",
  "Galerias de entrega ilimitadas",
  "Sua cor e sua capa, sem a marca clikou",
  "Métricas de visitas e cliques nos contatos",
  "Formulário de orçamento pra fechar trabalho",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      {/* Hero */}
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-400">
        Sobre a clikou
      </p>
      <h1 className="font-display mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
        A ferramenta que{" "}
        <span className="text-yellow-400">se paga sozinha</span>
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-zinc-300">
        Portfólio pra colar na bio, galerias pra entregar o trabalho e suas
        fotos à venda com busca por rosto — tudo num link só. Grátis pra
        começar; no <strong className="text-white">Pro</strong> você fica com{" "}
        <strong className="text-white">100% de cada venda</strong>.
      </p>

      {/* Missão condensada — autenticidade/confiança */}
      <div className="mt-10 space-y-5 leading-relaxed text-zinc-400">
        <p>
          A clikou foi feita por gente de tecnologia que, fora do expediente,
          vive com uma câmera no pescoço — corrida de rua, várzea, kart,
          formatura. E toda semana a mesma frustração:{" "}
          <em className="text-zinc-300">o gargalo não era a fotografia</em>,
          eram as ferramentas. Mostrar o trabalho pedia site caro. Entregar
          virava link que expirava. Cobrar era planilha e WhatsApp. Um trabalho
          lindo acabava preso numa pasta.
        </p>
        <p>
          Então juntamos as duas paixões e construímos o que a gente sempre quis
          ter do outro lado da lente. Ferramenta boa, acessível e bem-feita é o
          que fazemos da vida — e agora ela trabalha pra você vender mais e
          perder menos.
        </p>
      </div>

      {/* Faça as contas — o argumento que fecha */}
      <section className="mt-14 rounded-3xl border border-yellow-400/20 bg-gradient-to-b from-yellow-400/[0.06] to-transparent p-7 sm:p-9">
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Faça as contas
        </h2>
        <p className="mt-2 text-zinc-400">
          Imagine um mês em que você vendeu{" "}
          <strong className="text-zinc-200">{brl(EXAMPLE_SALES)}</strong> em
          fotos. Veja o que sobra pra você em cada plano:
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6">
            <p className="text-sm font-semibold text-zinc-400">
              Plano grátis · {COMMISSION_PERCENT}% de comissão
            </p>
            <p className="mt-3 text-sm text-zinc-500">
              Comissão da plataforma
              <span className="float-right text-red-400">
                − {brl(EXAMPLE_SALES * FREE_COMMISSION)}
              </span>
            </p>
            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="text-sm text-zinc-400">Você recebe</p>
              <p className="font-display mt-1 text-3xl font-bold text-zinc-200">
                {brl(freeKeeps)}
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl border border-yellow-400/40 bg-zinc-950/40 p-6">
            <span className="absolute -top-3 right-5 rounded-full bg-yellow-400 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-zinc-950">
              Pro
            </span>
            <p className="text-sm font-semibold text-yellow-400">
              Pro · R$ 49/mês, comissão zero
            </p>
            <p className="mt-3 text-sm text-zinc-500">
              Assinatura do Pro
              <span className="float-right text-zinc-400">
                − {brl(PRO_MONTHLY)}
              </span>
            </p>
            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="text-sm text-zinc-400">Você recebe</p>
              <p className="font-display mt-1 text-3xl font-bold text-yellow-400">
                {brl(proKeeps)}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-lg font-semibold text-zinc-200">
          {brl(proKeeps - freeKeeps)} a mais no seu bolso — já no primeiro mês.
        </p>
        <p className="mt-1 text-center text-sm text-zinc-500">
          A partir de {brl(PRO_MONTHLY / FREE_COMMISSION)} vendidos no mês, o Pro
          já se paga sozinho. Vendeu mais? A diferença só cresce.
        </p>
      </section>

      {/* Grátis vs Pro */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          O que muda no Pro
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-6">
            <h3 className="font-semibold text-zinc-300">Grátis</h3>
            <p className="mt-0.5 text-sm text-zinc-500">Pra começar sem gastar.</p>
            <ul className="mt-4 space-y-2.5">
              {FREE_LIMITS.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-zinc-400">
                  <XIcon size={18} className="mt-0.5 shrink-0 text-zinc-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/[0.04] p-6">
            <h3 className="font-semibold text-yellow-400">Pro · R$ 49/mês</h3>
            <p className="mt-0.5 text-sm text-zinc-400">
              ou R$ 490/ano — 2 meses grátis.
            </p>
            <ul className="mt-4 space-y-2.5">
              {PRO_PERKS.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-zinc-200">
                  <CheckIcon size={18} className="mt-0.5 shrink-0 text-yellow-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA final — trial */}
      <section className="mt-14 rounded-3xl border border-white/10 bg-zinc-900/60 p-8 text-center sm:p-10">
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Teste o Pro por{" "}
          <span className="text-yellow-400">14 dias, de graça</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-zinc-400">
          Comece grátis agora e ative o Pro quando quiser. Cancele quando
          precisar — seu trabalho e seus clientes continuam com você.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/signup?next=/dashboard/plan"
            className="group inline-flex items-center gap-2 rounded-full bg-yellow-400 px-7 py-3.5 font-semibold text-zinc-950 transition hover:bg-yellow-300"
          >
            Criar conta e testar o Pro
            <ArrowIcon
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <Link
            href="/f/demo"
            className="rounded-full border border-zinc-700 px-7 py-3.5 font-semibold text-zinc-200 transition hover:border-yellow-400 hover:text-yellow-400"
          >
            Ver um exemplo ao vivo
          </Link>
        </div>
      </section>
    </div>
  );
}
