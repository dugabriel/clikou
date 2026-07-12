// Dispara um evento no GA4 (gtag). O gtag.js carrega com afterInteractive,
// então logo após a hidratação (ex.: SignupPing no redirect do Google) o
// window.gtag pode ainda não existir — em vez de descartar o evento em
// silêncio, tenta de novo por até ~10s. Não empilha direto no dataLayer para
// não furar a ordem do Consent Mode (o default "denied" precisa vir antes).
export function trackEvent(name, params = {}, attempts = 20) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
    return;
  }
  if (attempts > 0) {
    setTimeout(() => trackEvent(name, params, attempts - 1), 500);
  }
}
