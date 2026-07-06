const APP_URL = process.env.APP_URL || "https://clikou.click";

// Áreas logadas e rotas técnicas fora do índice; o resto é público.
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/admin",
        "/my-purchases",
        "/purchase/",
        "/verify-email",
        "/reset-password",
        "/auth/",
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
