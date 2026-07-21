import { NextResponse } from "next/server";
import { emailEnabled, sendPartnershipRequestEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { verifyChallenge } from "@/lib/captcha";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Guardrail anti-spam: formulário público numa landing de anúncio (tráfego
// pago, sem login) — camada mais forte que o lead comum: honeypot + limite
// por IP + captcha (mesmo trio do cadastro).
const IP_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

// Pedido de parceria (Pro grátis) da landing /parceria: só notifica o
// suporte por e-mail — a aprovação continua manual em /admin/photographers.
export async function POST(req) {
  const { email, instagram, facebook, website, empresa, captcha, captchaToken } =
    await req.json().catch(() => ({}));

  // Honeypot: campo invisível que só robô preenche.
  if (empresa) return NextResponse.json({ ok: true });

  const ipHit = await rateLimit("partnership-ip", clientIp(req), IP_LIMIT);
  if (!ipHit.ok) {
    return NextResponse.json(
      {
        error: `Muitos pedidos em pouco tempo. Espere ${Math.ceil(
          ipHit.retryAfterSeconds / 60
        )} min e tente de novo.`,
      },
      { status: 429 }
    );
  }
  if (!(await verifyChallenge(captchaToken, captcha))) {
    return NextResponse.json(
      { error: "Resposta da verificação anti-spam incorreta. Tente de novo.", captcha: true },
      { status: 400 }
    );
  }

  const cleanEmail = String(email || "").trim().slice(0, 200);
  const cleanInstagram = String(instagram || "").trim().slice(0, 200);
  const cleanFacebook = String(facebook || "").trim().slice(0, 200);
  const cleanWebsite = String(website || "").trim().slice(0, 200);

  if (!EMAIL_RE.test(cleanEmail)) {
    return NextResponse.json(
      { error: "Informe o e-mail de cadastro no clikou." },
      { status: 400 }
    );
  }
  if (!cleanInstagram && !cleanFacebook && !cleanWebsite) {
    return NextResponse.json(
      { error: "Informe pelo menos um: Instagram, Facebook, site ou portfólio." },
      { status: 400 }
    );
  }

  if (!emailEnabled) return NextResponse.json({ ok: true, disabled: true });

  const appUrl = process.env.APP_URL || new URL(req.url).origin;
  const sent = await sendPartnershipRequestEmail({
    email: cleanEmail,
    instagram: cleanInstagram,
    facebook: cleanFacebook,
    website: cleanWebsite,
    appUrl,
  });
  if (!sent) {
    return NextResponse.json(
      { error: "Não conseguimos enviar agora. Tente de novo em instantes." },
      { status: 502 }
    );
  }
  return NextResponse.json({ ok: true });
}
