import { CheckIcon, InstagramIcon, FacebookIcon, GlobeIcon } from "@/components/Icons";
import PartnershipForm from "@/components/PartnershipForm";

export const metadata = {
  title: "Parceria clikou — Pro grátis para fotógrafos",
  description:
    "Fotógrafos com trabalho ativo no Instagram, Facebook ou portfólio podem pedir o plano Pro do clikou de graça: comissão zero, galerias ilimitadas e portfólio completo.",
  alternates: { canonical: "/partnership" },
};

const PERKS = [
  "Comissão zero — 100% de cada venda é seu",
  "Até 20 coleções no portfólio, 100 fotos cada",
  "Galerias de entrega ilimitadas para seus clientes",
  "Formulário de orçamento pra fechar trabalho",
  "Sua cor, sua capa — sem a marca clikou",
];

const STEPS = [
  {
    title: "Preencha o formulário",
    text: "Seu Instagram, Facebook ou portfólio e o e-mail que você usa (ou vai usar) no clikou.",
  },
  {
    title: "A gente dá uma olhada",
    text: "Conferimos seu trabalho — é rápido, sem burocracia.",
  },
  {
    title: "Pro liberado por e-mail",
    text: "Sua conta vira Pro sem custo. Só criar a conta (se ainda não tem) e usar.",
  },
];

export default function PartnershipPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      {/* Hero */}
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-400">
        Parceria clikou
      </p>
      <h1 className="font-display mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
        Ganhe o plano <span className="text-yellow-400">Pro de graça</span>
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-zinc-300">
        Pra fotógrafos que já mostram o trabalho no Instagram, Facebook ou num
        portfólio próprio. Sem mensalidade, sem comissão nas suas vendas — a
        gente libera o Pro pra você usar.
      </p>

      {/* O que você ganha */}
      <section className="mt-12 rounded-3xl border border-yellow-400/20 bg-gradient-to-b from-yellow-400/[0.06] to-transparent p-7 sm:p-9">
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          O que vem com o Pro
        </h2>
        <ul className="mt-6 space-y-3">
          {PERKS.map((item) => (
            <li key={item} className="flex gap-2.5 text-zinc-200">
              <CheckIcon size={20} className="mt-0.5 shrink-0 text-yellow-400" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Como funciona */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Como funciona
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border border-white/5 bg-zinc-900/60 p-5"
            >
              <span className="font-display text-2xl font-bold text-yellow-400">
                {i + 1}
              </span>
              <h3 className="mt-2 font-semibold text-zinc-100">{step.title}</h3>
              <p className="mt-1.5 text-sm text-zinc-400">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Formulário */}
      <section className="mt-14" id="formulario">
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Solicitar parceria
        </h2>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
          <span className="flex items-center gap-1.5">
            <InstagramIcon size={16} /> Instagram
          </span>
          <span className="flex items-center gap-1.5">
            <FacebookIcon size={16} /> Facebook
          </span>
          <span className="flex items-center gap-1.5">
            <GlobeIcon size={16} /> site ou portfólio
          </span>
        </p>
        <div className="mt-6">
          <PartnershipForm />
        </div>
      </section>
    </div>
  );
}
