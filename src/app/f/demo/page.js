import Link from "next/link";
import {
  CameraIcon,
  InstagramIcon,
  WhatsAppIcon,
  GlobeIcon,
  ArrowIcon,
  CheckIcon,
} from "@/components/Icons";
import { field, label } from "@/components/ui";

// Página "demo" ESTÁTICA: um exemplo apelativo de como fica a página Pro de um
// fotógrafo, sem usar a feature real de perfil (não há usuário no banco, o
// formulário é só visual e não coleta orçamento). Serve de vitrine para a
// landing /portfolio. O segmento literal "demo" tem prioridade sobre /f/[username].

export const metadata = {
  title: "Exemplo de página de fotógrafo — Clikou",
  description:
    "Veja como fica a sua página profissional na clikou: portfólio por coleções, contatos e pedidos de orçamento. Crie a sua grátis.",
};

const ACCENT = "#f97316";

const COLLECTIONS = [
  {
    name: "Corridas de rua",
    photos: ["/demo/thumb-1.jpg", "/demo/thumb-3.jpg", "/demo/thumb-4.jpg"],
  },
  {
    name: "Maratonas",
    photos: ["/demo/thumb-5.jpg", "/demo/thumb-6.jpg", "/finder/found-1.jpg"],
  },
];

const SOCIALS = [
  { Icon: InstagramIcon, label: "@marinaduarte.foto" },
  { Icon: WhatsAppIcon, label: "WhatsApp" },
  { Icon: GlobeIcon, label: "marinaduarte.com.br" },
];

export default function DemoProfile() {
  return (
    <div className="relative" style={{ "--brand": ACCENT }}>
      {/* Faixa de "exemplo" com CTA */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-white/10 bg-zinc-950/90 px-4 py-2.5 text-center text-sm backdrop-blur">
        <span className="text-zinc-300">
          📸 Exemplo de página de fotógrafo na clikou
        </span>
        <Link
          href="/signup?next=/dashboard/profile"
          className="font-semibold text-[color:var(--brand)] underline-offset-2 hover:underline"
        >
          Criar a minha grátis →
        </Link>
      </div>

      {/* Capa */}
      <div className="relative h-56 w-full overflow-hidden sm:h-72">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/demo/thumb-2.jpg"
          alt="Capa de Marina Duarte"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
      </div>

      {/* Cabeçalho */}
      <section className="relative mx-auto -mt-16 max-w-4xl px-4 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/demo-avatar.jpg"
          alt="Marina Duarte"
          className="mx-auto h-28 w-28 rounded-full object-cover ring-4 ring-[color:var(--brand)]"
        />
        <h1 className="font-display mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
          Marina Duarte
        </h1>
        <p className="mt-2 text-zinc-400">São Paulo</p>
        <p className="mx-auto mt-5 max-w-xl leading-relaxed text-zinc-300">
          Fotógrafa de corridas de rua e eventos esportivos em São Paulo há 6
          anos. Cada participante encontra a própria foto pela busca por selfie.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {SOCIALS.map(({ Icon, label: text }) => (
            <span
              key={text}
              className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-5 py-2.5 text-sm font-medium text-zinc-200"
            >
              <Icon size={17} />
              {text}
            </span>
          ))}
        </div>

        <div className="mt-10 flex justify-center gap-10 text-center">
          <div>
            <p className="font-display text-3xl font-bold text-[color:var(--brand)]">
              40+
            </p>
            <p className="text-sm text-zinc-500">eventos</p>
          </div>
          <div className="w-px bg-zinc-800" />
          <div>
            <p className="font-display text-3xl font-bold text-[color:var(--brand)]">
              12k
            </p>
            <p className="text-sm text-zinc-500">fotos entregues</p>
          </div>
        </div>
      </section>

      {/* Portfólio por coleções */}
      <section className="mx-auto max-w-5xl px-4 pt-20">
        <h2 className="font-display mb-6 flex items-center gap-2.5 text-2xl font-bold tracking-tight">
          <CameraIcon size={24} className="text-[color:var(--brand)]" />
          Portfólio
        </h2>
        <div className="space-y-12">
          {COLLECTIONS.map((c) => (
            <div key={c.name}>
              <h3 className="mb-4 text-lg font-semibold text-zinc-200">
                {c.name}
              </h3>
              <div className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] sm:grid-cols-4">
                {c.photos.map((src) => (
                  <div
                    key={src}
                    className="overflow-hidden rounded-2xl border border-white/5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={c.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Formulário de orçamento — apenas visual (não envia nada) */}
      <section className="mx-auto max-w-3xl px-4 pt-20">
        <h2 className="font-display mb-2 text-center text-2xl font-bold tracking-tight">
          Quer contratar Marina?
        </h2>
        <p className="mx-auto mb-6 max-w-lg text-center text-zinc-400">
          Numa página de verdade, este formulário manda o pedido direto pro
          fotógrafo. Aqui é só uma demonstração.
        </p>
        <div className="pointer-events-none rounded-2xl border border-white/10 bg-zinc-900/60 p-6 opacity-90 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Seu nome</label>
              <input disabled placeholder="Como te chamar" className={field} />
            </div>
            <div>
              <label className={label}>Seu contato</label>
              <input disabled placeholder="WhatsApp ou e-mail" className={field} />
            </div>
          </div>
          <div className="mt-4">
            <label className={label}>Mensagem</label>
            <textarea
              disabled
              rows={3}
              placeholder="Conte sobre o evento, data e local…"
              className={field}
            />
          </div>
          <div className="mt-5 w-full rounded-full bg-[color:var(--brand)] py-3 text-center font-semibold text-zinc-950">
            Enviar pedido de orçamento
          </div>
        </div>
      </section>

      {/* CTA final: crie a sua */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-10">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Sua página pode ser assim.
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-zinc-400">
            Portfólio por coleções, sua cara, seus contatos e pedidos de
            orçamento de verdade — grátis para começar.
          </p>
          <ul className="mx-auto mt-6 flex max-w-md flex-col gap-2 text-left text-sm text-zinc-300">
            {[
              "Link pronto pra bio do Instagram",
              "Sem comissão nas vendas no plano Pro",
              "Recebe contatos de trabalho direto na página",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <CheckIcon size={18} className="mt-0.5 shrink-0 text-[color:var(--brand)]" />
                {t}
              </li>
            ))}
          </ul>
          <Link
            href="/signup?next=/dashboard/profile"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-yellow-400 px-8 py-4 font-semibold text-zinc-950 transition hover:bg-yellow-300"
          >
            Criar minha página grátis
            <ArrowIcon size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
