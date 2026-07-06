export const metadata = {
  title: "Política de Privacidade e Responsabilidade — Clikou",
  description:
    "Como a clikou trata seus dados (LGPD) e a quem pertence a responsabilidade pelo conteúdo publicado e pelas vendas: integralmente ao fotógrafo.",
  alternates: { canonical: "/privacy" },
};

const H2 = ({ children }) => (
  <h2 className="font-display mt-10 text-2xl font-bold tracking-tight text-white">
    {children}
  </h2>
);

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 leading-relaxed text-zinc-300">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-400">
        Transparência
      </p>
      <h1 className="font-display mt-4 text-4xl font-bold tracking-tight text-white">
        Política de Privacidade e Responsabilidade
      </h1>
      <p className="mt-3 text-sm text-zinc-500">
        Última atualização: julho de 2026
      </p>

      <p className="mt-8">
        A clikou (&quot;plataforma&quot;) é um marketplace que conecta
        fotógrafos de eventos a pessoas interessadas em comprar essas fotos.
        Este documento explica quais dados tratamos, por quê, e — de forma
        muito clara — de quem é a responsabilidade pelo conteúdo publicado e
        pelas vendas realizadas.
      </p>

      <H2>1. Dados que coletamos</H2>
      <p className="mt-4">
        <strong className="text-white">Conta (todos os usuários):</strong>{" "}
        nome, e-mail e senha (armazenada com criptografia de mão única), ou os
        dados básicos da sua conta Google quando você entra com ela.
      </p>
      <p className="mt-4">
        <strong className="text-white">Cadastro de vendedor (fotógrafos):</strong>{" "}
        para publicar e vender fotos é obrigatório completar a identificação
        legal do vendedor: CPF, data de nascimento, telefone e endereço
        completo. Esses dados são exigidos para identificação civil e fiscal de
        quem vende na plataforma, não aparecem no perfil público e não são
        compartilhados com compradores.
      </p>
      <p className="mt-4">
        <strong className="text-white">Busca por selfie:</strong> a análise do
        seu rosto acontece no seu navegador. A selfie em si não é enviada nem
        armazenada pela clikou — apenas uma assinatura numérica temporária é
        comparada com as fotos do evento, e ela não é guardada após a busca.
      </p>
      <p className="mt-4">
        <strong className="text-white">Busca por print:</strong> a imagem
        enviada é processada para gerar uma assinatura de comparação e
        descartada em seguida.
      </p>
      <p className="mt-4">
        <strong className="text-white">Compras e repasses:</strong> o
        processamento do pagamento é feito pelo Mercado Pago, que trata seus
        dados de pagamento sob as próprias políticas. A clikou não armazena
        números de cartão.
      </p>

      <H2>2. Como usamos os dados</H2>
      <p className="mt-4">
        Usamos os dados exclusivamente para operar a plataforma: manter sua
        conta, processar compras e repasses, enviar e-mails transacionais
        (confirmação de conta, compra confirmada, saque pago), identificar
        legalmente os vendedores, prevenir fraudes e cumprir obrigações
        legais. Não vendemos seus dados a terceiros. Os serviços que nos
        apoiam (Google Cloud para hospedagem e armazenamento, Mercado Pago
        para pagamentos, MailerSend para e-mails) recebem apenas o necessário
        para cumprir a função de cada um.
      </p>

      <H2>3. Responsabilidade pelo conteúdo — leia com atenção</H2>
      <p className="mt-4">
        <strong className="text-white">
          O fotógrafo é o único e integral responsável pelas imagens que
          publica e pelas vendas que realiza na plataforma.
        </strong>{" "}
        Ao publicar fotos na clikou, o fotógrafo declara e garante que:
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-6">
        <li>
          é o autor das imagens ou detém todos os direitos autorais e de
          exploração comercial sobre elas (Lei 9.610/98);
        </li>
        <li>
          possui as autorizações de uso de imagem das pessoas retratadas,
          quando exigíveis, inclusive nos termos do Código Civil e da LGPD;
        </li>
        <li>
          o conteúdo não viola direitos de terceiros, não retrata menores de
          forma irregular e não infringe qualquer lei;
        </li>
        <li>
          é responsável pelos tributos e obrigações fiscais incidentes sobre
          as próprias vendas.
        </li>
      </ul>
      <p className="mt-4">
        A clikou atua exclusivamente como{" "}
        <strong className="text-white">intermediadora tecnológica</strong>{" "}
        entre fotógrafo e comprador: fornece a vitrine, a proteção por marca
        d&apos;água, a busca e o processamento do pagamento.{" "}
        <strong className="text-white">
          A clikou não é parte da venda, não é autora do conteúdo e não se
          responsabiliza pelas imagens publicadas, por direitos de imagem ou
          autorais eventualmente feridos, pela qualidade das fotos nem por
          qualquer disputa entre fotógrafo, comprador ou terceiros retratados
        </strong>
        . Essa responsabilidade é inteiramente do fotógrafo que publicou o
        conteúdo.
      </p>
      <p className="mt-4">
        Mantemos moderação automática e removemos conteúdo denunciado que
        viole esta política ou a lei, podendo suspender contas e reter
        repasses em caso de violação. Para denunciar uma foto ou evento,
        escreva para{" "}
        <a
          href="mailto:contato@clikou.click"
          className="text-yellow-400 hover:underline"
        >
          contato@clikou.click
        </a>
        .
      </p>

      <H2>4. Seus direitos (LGPD)</H2>
      <p className="mt-4">
        Nos termos da Lei Geral de Proteção de Dados (Lei 13.709/18), você
        pode solicitar acesso, correção, portabilidade ou exclusão dos seus
        dados, além de revogar consentimentos. Basta escrever para{" "}
        <a
          href="mailto:contato@clikou.click"
          className="text-yellow-400 hover:underline"
        >
          contato@clikou.click
        </a>
        . A exclusão da conta remove seus dados pessoais, ressalvados os
        registros que a lei nos obriga a manter (como registros de transações).
      </p>

      <H2>5. Cookies e segurança</H2>
      <p className="mt-4">
        Usamos apenas cookies essenciais de sessão (para manter você logado).
        Os dados trafegam por HTTPS e ficam em infraestrutura do Google Cloud;
        fotos originais ficam em armazenamento privado e só saem via compra.
      </p>

      <H2>6. Alterações</H2>
      <p className="mt-4">
        Esta política pode ser atualizada para refletir mudanças na plataforma
        ou na lei — a data no topo indica a versão vigente. Mudanças
        relevantes serão comunicadas no site.
      </p>
    </div>
  );
}
