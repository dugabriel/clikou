import { Geist, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Logo from "@/components/Logo";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
});

export const metadata = {
  title: "Clikou — Fotografou um evento? Venda suas fotos.",
  description:
    "Publique as fotos do evento, defina o preço e compartilhe o link. Quem estava lá compra e baixa em alta resolução, sem marca d'água.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${geist.variable} ${grotesk.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="mt-16 border-t border-white/5 bg-zinc-950">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xs">
              <Logo />
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                Fotos de evento direto de quem fotografou — profissional ou
                não. Você publica, compartilha o link e recebe.
              </p>
            </div>
            <div className="flex gap-16 text-sm">
              <div className="space-y-2.5">
                <p className="font-semibold text-zinc-300">Navegue</p>
                <Link href="/eventos" className="block text-zinc-500 hover:text-yellow-400">
                  Eventos
                </Link>
                <Link href="/painel" className="block text-zinc-500 hover:text-yellow-400">
                  Vender fotos
                </Link>
                <Link href="/minhas-compras" className="block text-zinc-500 hover:text-yellow-400">
                  Minhas compras
                </Link>
              </div>
              <div className="space-y-2.5">
                <p className="font-semibold text-zinc-300">Conta</p>
                <Link href="/login" className="block text-zinc-500 hover:text-yellow-400">
                  Entrar
                </Link>
                <Link href="/cadastro" className="block text-zinc-500 hover:text-yellow-400">
                  Criar conta
                </Link>
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
