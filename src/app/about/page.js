import Link from "next/link";

export const metadata = {
  title: "Sobre a clikou — quem faz e por quê",
  description:
    "A clikou nasceu de profissionais de TI apaixonados por fotografia: tecnologia para nenhuma foto boa morrer no cartão de memória.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-400">
        Sobre a clikou
      </p>
      <h1 className="font-display mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
        Nascemos entre deploys e{" "}
        <span className="text-yellow-400">disparos de obturador</span>
      </h1>

      <div className="mt-10 space-y-6 leading-relaxed text-zinc-300">
        <p>
          A clikou foi criada por profissionais de tecnologia que, fora do
          expediente, vivem com uma câmera pendurada no pescoço. De dia,
          código, servidores e reuniões; no fim de semana, a gente estava na
          beira da pista fotografando corrida de rua, no gramado do campeonato
          de várzea, na pista de kart, na formatura de amigos.
        </p>
        <p>
          E toda semana a história se repetia. O fotógrafo voltava para casa
          com o cartão de memória cheio de fotos boas — <em>boas de verdade</em>{" "}
          — que ninguém nunca ia ver. A galeria ia para uma pasta no Drive, o
          link se perdia no grupo, e começava a enxurrada de mensagens:
          {" "}
          <em>&quot;tem foto minha?&quot;</em>,{" "}
          <em>&quot;sou o de camiseta azul, número 214&quot;</em>,{" "}
          <em>&quot;consegue procurar aí?&quot;</em>. Duas mil fotos, quinhentos
          participantes, zero paciência dos dois lados. O corredor desistia de
          procurar, o fotógrafo desistia de cobrar — e um trabalho lindo virava
          pasta esquecida.
        </p>
        <p>
          Um dia caiu a ficha: os dois problemas eram, no fundo,{" "}
          <strong className="text-white">problemas de software</strong>. E
          software é justamente o que a gente faz da vida.
        </p>
        <p>
          Então juntamos as duas paixões. Reconhecimento facial para cada
          participante se encontrar com uma selfie, em segundos, no meio de
          milhares de fotos. Marca d&apos;água automática para o trabalho
          circular protegido. Pagamento online e download em alta liberado na
          hora. Página de portfólio para o fotógrafo colocar na bio. Tudo o que
          a gente sempre quis que existisse quando estava do outro lado da
          lente.
        </p>
        <p>
          A clikou existe por uma convicção simples:{" "}
          <strong className="text-white">
            nenhuma foto boa merece morrer no cartão de memória
          </strong>
          . Quem estava lá merece se encontrar; quem fotografou merece ser
          pago. A tecnologia serve para aproximar esses dois — e a gente cuida
          do resto.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          ["O clique tem valor", "Fotografou, tem que poder viver disso — profissional ou não."],
          ["Tecnologia invisível", "IA, proteção e pagamento trabalhando em silêncio; você só vê o resultado."],
          ["Simples dos dois lados", "Quem compra se acha com uma selfie; quem vende publica em minutos."],
        ].map(([title, text]) => (
          <div
            key={title}
            className="rounded-2xl border border-white/5 bg-zinc-900/60 p-6"
          >
            <h3 className="font-semibold text-yellow-400">{title}</h3>
            <p className="mt-2 text-sm text-zinc-400">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/events"
          className="rounded-full bg-yellow-400 px-7 py-3.5 font-semibold text-zinc-950 transition hover:bg-yellow-300"
        >
          Encontrar minhas fotos
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full border border-zinc-700 px-7 py-3.5 font-semibold text-zinc-200 transition hover:border-yellow-400 hover:text-yellow-400"
        >
          Vender minhas fotos
        </Link>
      </div>
    </div>
  );
}
