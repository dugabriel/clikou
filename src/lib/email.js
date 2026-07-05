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
        email: process.env.EMAIL_FROM || "nao-responda@clicou.online",
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
