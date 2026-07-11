import { Geist, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Logo from "@/components/Logo";
import { Suspense } from "react";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieConsent from "@/components/CookieConsent";
import SignupPing from "@/components/SignupPing";
import ManageCookiesLink from "@/components/ManageCookiesLink";
import SupportWidget from "@/components/SupportWidget";
import { InstagramIcon, FacebookIcon } from "@/components/Icons";
import { getSession } from "@/lib/auth";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
});

const APP_URL = process.env.APP_URL || "https://clikou.click";

export const metadata = {
  metadataBase: new URL(APP_URL),
  title: "Clikou — Fotos de evento direto de quem fotografou",
  description:
    "Encontre e compre suas fotos de corridas, formaturas, shows e campeonatos — ache-se com uma selfie. Fotografou? Publique, compartilhe o link e venda.",
  keywords: [
    "fotos de evento",
    "fotos de corrida",
    "comprar fotos",
    "vender fotos de evento",
    "fotógrafo de evento",
    "achar minhas fotos",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "clikou",
    locale: "pt_BR",
    url: "/",
    title: "Clikou — Fotos de evento direto de quem fotografou",
    description:
      "Encontre suas fotos de eventos com uma selfie e baixe em alta resolução. Fotografou? Publique e venda.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "clikou" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clikou — Fotos de evento direto de quem fotografou",
    description:
      "Encontre suas fotos de eventos com uma selfie e baixe em alta resolução.",
    images: ["/og.png"],
  },
};

export default async function RootLayout({ children }) {
  const session = await getSession();
  return (
    <html
      lang="pt-BR"
      className={`${geist.variable} ${grotesk.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <SignupPing />
        </Suspense>
        <CookieConsent />
        <Navbar />
        <SupportWidget loggedIn={!!session} />
        <main className="flex-1">{children}</main>
        <footer className="mt-16 border-t border-white/5 bg-zinc-950">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xs">
              <Logo />
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                Fotos de evento direto de quem fotografou — profissional ou
                não. Você publica, compartilha o link e recebe.
              </p>
              <div className="mt-4 flex gap-3">
                <a
                  href="https://www.instagram.com/clikou.click/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram da clikou"
                  className="text-zinc-500 transition hover:text-yellow-400"
                >
                  <InstagramIcon size={20} />
                </a>
                <a
                  href="https://www.facebook.com/clikou.click"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook da clikou"
                  className="text-zinc-500 transition hover:text-yellow-400"
                >
                  <FacebookIcon size={20} />
                </a>
              </div>
            </div>
            <div className="flex gap-16 text-sm">
              <div className="space-y-2.5">
                <p className="font-semibold text-zinc-300">Navegue</p>
                <Link href="/events" className="block text-zinc-500 hover:text-yellow-400">
                  Eventos
                </Link>
                <Link href="/dashboard" className="block text-zinc-500 hover:text-yellow-400">
                  Vender fotos
                </Link>
                <Link href="/my-purchases" className="block text-zinc-500 hover:text-yellow-400">
                  Minhas compras
                </Link>
              </div>
              <div className="space-y-2.5">
                <p className="font-semibold text-zinc-300">Conta</p>
                <Link href="/login" className="block text-zinc-500 hover:text-yellow-400">
                  Entrar
                </Link>
                <Link href="/signup" className="block text-zinc-500 hover:text-yellow-400">
                  Criar conta
                </Link>
              </div>
              <div className="space-y-2.5">
                <p className="font-semibold text-zinc-300">clikou</p>
                <Link href="/about" className="block text-zinc-500 hover:text-yellow-400">
                  Sobre
                </Link>
                <Link href="/privacy" className="block text-zinc-500 hover:text-yellow-400">
                  Privacidade
                </Link>
                <ManageCookiesLink />
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 py-5 text-center text-xs text-zinc-600">
            clikou © {new Date().getFullYear()} — todos os direitos reservados
          </div>
        </footer>
      </body>
    </html>
  );
}
