import { formatPrice } from "@/lib/currency";

// Envio de e-mail via MailerSend. Sem MAILERSEND_TOKEN o envio fica
// desativado e o cadastro por senha entra sem confirmação (modo dev).
const API_URL =
  process.env.MAILERSEND_API_URL || "https://api.mailersend.com/v1/email";

export const emailEnabled = !!process.env.MAILERSEND_TOKEN;

export async function sendEmail({ to, subject, html, text }) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MAILERSEND_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: {
        email: process.env.EMAIL_FROM || "nao-responda@clikou.click",
        name: "clikou",
      },
      to: [{ email: to }],
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, " "),
    }),
  });
  if (!res.ok) {
    console.error("MailerSend:", res.status, await res.text());
    return false;
  }
  return true;
}

export async function sendVerificationEmail(email, name, token, appUrl) {
  const link = `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;
  const firstName = (name || "").split(" ")[0];
  return sendEmail({
    to: email,
    subject: "Confirme sua conta no clikou 📸",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 16px">Olá${firstName ? `, ${firstName}` : ""}!</h2>
        <p>Falta só um passo: confirme seu e-mail para ativar sua conta no
        <strong>clikou</strong>.</p>
        <p style="margin:28px 0">
          <a href="${link}"
             style="background:#facc15;color:#18181b;text-decoration:none;font-weight:bold;padding:12px 28px;border-radius:999px;display:inline-block">
            Confirmar meu e-mail
          </a>
        </p>
        <p style="color:#71717a;font-size:13px">O link vale por 48 horas.
        Se você não criou essa conta, ignore este e-mail.</p>
        <p style="color:#71717a;font-size:13px">Se o botão não funcionar,
        copie e cole no navegador:<br>${link}</p>
      </div>`,
  });
}

export async function sendPasswordResetEmail(email, name, token, appUrl) {
  const link = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const firstName = (name || "").split(" ")[0];
  return sendEmail({
    to: email,
    subject: "Redefinir sua senha no clikou 🔑",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 16px">Olá${firstName ? `, ${firstName}` : ""}!</h2>
        <p>Recebemos um pedido para redefinir a senha da sua conta no
        <strong>clikou</strong>. Clique no botão para criar uma senha nova:</p>
        <p style="margin:28px 0">
          <a href="${link}"
             style="background:#facc15;color:#18181b;text-decoration:none;font-weight:bold;padding:12px 28px;border-radius:999px;display:inline-block">
            Criar nova senha
          </a>
        </p>
        <p style="color:#71717a;font-size:13px">O link vale por 1 hora e só
        funciona uma vez. Se você não pediu a redefinição, ignore este
        e-mail — sua senha continua a mesma.</p>
        <p style="color:#71717a;font-size:13px">Se o botão não funcionar,
        copie e cole no navegador:<br>${link}</p>
      </div>`,
  });
}

export async function sendPurchaseEmail({ to, name, photoCount, totalCents, appUrl }) {
  const firstName = (name || "").split(" ")[0];
  return sendEmail({
    to,
    subject: "Compra confirmada no clikou 🎉",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 16px">Compra confirmada${firstName ? `, ${firstName}` : ""}!</h2>
        <p>Recebemos o pagamento de <strong>${formatPrice(totalCents)}</strong>
        por <strong>${photoCount} foto${photoCount > 1 ? "s" : ""}</strong>.
        Elas já estão liberadas para download, sem marca d'água.</p>
        <p style="margin:28px 0">
          <a href="${appUrl}/my-purchases"
             style="background:#facc15;color:#18181b;text-decoration:none;font-weight:bold;padding:12px 28px;border-radius:999px;display:inline-block">
            Baixar minhas fotos
          </a>
        </p>
        <p style="color:#71717a;font-size:13px">Suas fotos ficam disponíveis
        em "Minhas compras" sempre que você precisar baixar de novo.</p>
      </div>`,
  });
}

export async function sendWithdrawalPaidEmail({ to, name, amountCents, pixKey }) {
  const firstName = (name || "").split(" ")[0];
  return sendEmail({
    to,
    subject: "Seu saque foi pago 💸",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 16px">Saque pago${firstName ? `, ${firstName}` : ""}!</h2>
        <p>Enviamos <strong>${formatPrice(amountCents)}</strong> via Pix para a
        chave <strong>${pixKey}</strong>.</p>
        <p style="color:#71717a;font-size:13px">O valor pode levar alguns
        minutos para aparecer no seu banco. Qualquer dúvida, responda este
        e-mail.</p>
      </div>`,
  });
}

export async function sendLeadEmail({ to, name, lead, appUrl }) {
  const firstName = (name || "").split(" ")[0];
  return sendEmail({
    to,
    subject: `Novo pedido de orçamento no clikou — ${lead.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 16px">Novo contato${firstName ? `, ${firstName}` : ""}! 📩</h2>
        <p><strong>${lead.name}</strong> pediu um orçamento pela sua página.</p>
        <p style="margin:8px 0"><strong>Contato:</strong> ${lead.contact}</p>
        ${lead.message ? `<p style="background:#f4f4f5;border-radius:12px;padding:12px 16px">${lead.message}</p>` : ""}
        <p style="margin:28px 0">
          <a href="${appUrl}/dashboard/marketing"
             style="background:#facc15;color:#18181b;text-decoration:none;font-weight:bold;padding:12px 28px;border-radius:999px;display:inline-block">
            Ver no painel
          </a>
        </p>
        <p style="color:#71717a;font-size:13px">Responda rápido — quem pede
        orçamento costuma estar decidindo na hora.</p>
      </div>`,
  });
}

export async function sendWithdrawalRejectedEmail({ to, name, amountCents }) {
  const firstName = (name || "").split(" ")[0];
  return sendEmail({
    to,
    subject: "Seu saque foi recusado",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 16px">Saque recusado${firstName ? `, ${firstName}` : ""}</h2>
        <p>Não foi possível pagar seu saque de
        <strong>${formatPrice(amountCents)}</strong>. O valor voltou para o seu
        saldo no clikou.</p>
        <p style="color:#71717a;font-size:13px">Confira se a chave Pix está
        correta e solicite de novo. Qualquer dúvida, responda este e-mail.</p>
      </div>`,
  });
}
