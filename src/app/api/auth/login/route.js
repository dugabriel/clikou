import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import Usuario from "@/models/Usuario";
import { criarSessao, criarTokenVerificacao } from "@/lib/auth";
import { emailAtivo, enviarEmailVerificacao } from "@/lib/email";

export async function POST(req) {
  const { email, senha } = await req.json();
  if (!email || !senha) {
    return NextResponse.json({ erro: "Informe e-mail e senha." }, { status: 400 });
  }

  await dbConnect();
  const usuario = await Usuario.findOne({ email: email.toLowerCase() });
  if (usuario && !usuario.senhaHash) {
    return NextResponse.json(
      { erro: "Essa conta entra com o Google. Use o botão \"Continuar com Google\"." },
      { status: 401 }
    );
  }
  if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash))) {
    return NextResponse.json(
      { erro: "E-mail ou senha incorretos." },
      { status: 401 }
    );
  }

  // Conta criada por senha que ainda não confirmou o e-mail.
  if (usuario.emailVerificado === false) {
    if (!emailAtivo) {
      // Envio de e-mail desativado (dev): libera a conta.
      usuario.emailVerificado = true;
      await usuario.save();
    } else {
      // Reenvia o link no máximo a cada 60s pra não virar spam.
      const podeReenviar =
        !usuario.verificacaoEnviadaEm ||
        Date.now() - usuario.verificacaoEnviadaEm.getTime() > 60_000;
      if (podeReenviar) {
        const appUrl = process.env.APP_URL || new URL(req.url).origin;
        const token = await criarTokenVerificacao(usuario._id);
        await enviarEmailVerificacao(usuario.email, usuario.nome, token, appUrl);
        usuario.verificacaoEnviadaEm = new Date();
        await usuario.save();
      }
      return NextResponse.json(
        {
          erro: `Confirme seu e-mail para entrar. Enviamos o link para ${usuario.email} — confira também o spam.`,
        },
        { status: 403 }
      );
    }
  }

  await criarSessao(usuario);
  return NextResponse.json({ ok: true });
}
