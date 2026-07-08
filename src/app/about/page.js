import Link from "next/link";

export const metadata = {
  title: "Sobre a clikou — ferramentas para o fotógrafo viver do seu trabalho",
  description:
    "A clikou nasceu para melhorar a vida do fotógrafo profissional: ferramentas acessíveis para divulgar, entregar e vender o seu trabalho — sem site caro nem complicação.",
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
          expediente, vivem com uma câmera no pescoço. De dia, código,
          servidores e reuniões; nos fins de semana, na beira da pista
          fotografando corrida de rua, no gramado do campeonato de várzea, na
          pista de kart, na formatura de amigos.
        </p>
        <p>
          E toda semana a mesma frustração — só que ela não era com a
          fotografia. Talento e foto boa não faltavam.{" "}
          <em>Faltava o que vem depois do clique.</em> Mostrar o trabalho pedia
          um site caro e trabalhoso. Entregar pro cliente virava link de
          WeTransfer que expirava. Cobrar era planilha e mensagem solta no
          WhatsApp. Divulgar era um Linktree que não vendia nada. O fotógrafo
          gastava mais energia com a logística do que com a fotografia — e um
          trabalho lindo acabava preso numa pasta.
        </p>
        <p>
          Um dia caiu a ficha: o gargalo não era a fotografia,{" "}
          <strong className="text-white">eram as ferramentas</strong>. E
          ferramenta boa, acessível e bem-feita é justamente o que a gente faz
          da vida.
        </p>
        <p>
          Então juntamos as duas paixões e construímos o que a gente sempre quis
          ter do outro lado da lente: uma página de portfólio pronta pra colar
          na bio, galerias privadas para entregar o trabalho ao cliente em alta,
          venda com pagamento online e download liberado na hora, marca
          d&apos;água automática para o trabalho circular protegido e busca por
          rosto para quem esteve no evento se encontrar numa selfie. Tudo
          acessível: de graça para começar, simples, sem código.
        </p>
        <p>
          A clikou existe por uma convicção simples:{" "}
          <strong className="text-white">
            o fotógrafo profissional merece ferramentas à altura do seu
            trabalho — acessíveis, para divulgar e distribuir o que ele faz
          </strong>
          . Talento não pode ficar preso num cartão de memória por falta de
          ferramenta. A gente cuida da tecnologia para você cuidar da foto.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          [
            "Ferramentas acessíveis",
            "Comece de graça, sem site caro nem código. O que era complicado e custava caro agora cabe num link.",
          ],
          [
            "Seu trabalho circulando",
            "Portfólio, entrega ao cliente e venda no mesmo lugar — do clique ao pagamento, sem fricção.",
          ],
          [
            "Você cuida da foto",
            "IA, proteção e pagamento trabalham nos bastidores; você só vê o resultado.",
          ],
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
          href="/signup?next=/dashboard/profile"
          className="rounded-full bg-yellow-400 px-7 py-3.5 font-semibold text-zinc-950 transition hover:bg-yellow-300"
        >
          Criar minha conta grátis
        </Link>
        <Link
          href="/f/demo"
          className="rounded-full border border-zinc-700 px-7 py-3.5 font-semibold text-zinc-200 transition hover:border-yellow-400 hover:text-yellow-400"
        >
          Ver um exemplo ao vivo
        </Link>
      </div>
    </div>
  );
}
