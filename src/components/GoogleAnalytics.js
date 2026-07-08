import Script from "next/script";

// Google Analytics 4 (gtag). Só carrega em produção para não poluir a
// propriedade do GA com tráfego de desenvolvimento.
const GA_ID = "G-QRBXV64DE6";

export default function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production") return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
