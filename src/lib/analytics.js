// Dispara um evento no GA4 (gtag). No-op se o gtag não carregou (dev, ou
// antes do consentimento). Consent Mode cuida do que vira dado identificável.
export function trackEvent(name, params = {}) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}
