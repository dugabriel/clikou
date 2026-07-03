import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import Usuario from "@/models/Usuario";
import { criarSessao, criarTokenVerificacao } from "@/lib/auth";
import { conferirDesafio } from "@/lib/captcha";
import { emailAtivo, enviarEmailVerificacao } from "@/lib/email";

export async function POST(req) {
  const { nome, email, senha, captcha, captchaToken, site } = await req.json();

  // Honeypot: campo invisível que só robô preenche.
  if (site) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }
  if (!nome || !email || !senha) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }
  if (!(await conferirDesafio(captchaToken, captcha))) {
    return NextResponse.json(
      { erro: "Resposta da verificação anti-spam incorreta. Tente de novo.", captcha: true },
      { status: 400 }
    );
  }
  const { contemPalavraProibida } = await import("@/lib/moderacao");
  if (contemPalavraProibida(nome)) {
    return NextResponse.json(
      { erro: "Esse nome contém palavras não permitidas." },
      { status: 400 }
    );
  }
  if (senha.length < 6) {
    return NextResponse.json(
      { erro: "A senha precisa ter pelo menos 6 caracteres." },
      { status: 400 }
    );
  }

  await dbConnect();
  const existente = await Usuario.findOne({ email: email.toLowerCase() });
  if (existente) {
    return NextResponse.json(
      { erro: "Já existe uma conta com esse e-mail." },
      { status: 409 }
    );
  }

  const usuario = await Usuario.create({
    nome,
    email,
    senhaHash: await bcrypt.hash(senha, 10),
    // Com envio de e-mail ativo, a conta nasce pendente de confirmação.
    ...(emailAtivo
      ? { emailVerificado: false, verificacaoEnviadaEm: new Date() }
      : {}),
  });

  if (emailAtivo) {
    const appUrl = process.env.APP_URL || new URL(req.url).origin;
    const token = await criarTokenVerificacao(usuario._id);
    await enviarEmailVerificacao(usuario.email, usuario.nome, token, appUrl);
    return NextResponse.json({ ok: true, verificar: true });
  }

  await criarSessao(usuario);
  return NextResponse.json({ ok: true });
}
