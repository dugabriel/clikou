import Link from "next/link";
import { getSession, isAdmin } from "@/lib/auth";
import Logo from "@/components/Logo";
import LinkPending from "@/components/LinkPending";
import MobileMenu from "@/components/MobileMenu";

export default async function Navbar() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center gap-8 px-4 py-3.5">
        <Logo />
        <div className="hidden items-center gap-6 text-sm font-medium text-zinc-400 sm:flex">
          <Link href="/portfolio" className="transition hover:text-white">
            <LinkPending>Para fotógrafos</LinkPending>
          </Link>
          <Link href="/events" className="transition hover:text-white">
            <LinkPending>Eventos</LinkPending>
          </Link>
          <Link href="/about" className="transition hover:text-white">
            <LinkPending>Sobre</LinkPending>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-3 text-sm">
          {!session && (
            <>
              <Link
                href="/login"
                className="px-2 font-medium text-zinc-300 transition hover:text-white"
              >
                Entrar
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-yellow-400 px-4 py-2 font-semibold text-zinc-950 transition hover:bg-yellow-300"
              >
                Criar conta
              </Link>
            </>
          )}
          {session && (
            <>
              {isAdmin(session) && (
                <Link
                  href="/admin"
                  className="hidden font-medium text-zinc-300 transition hover:text-white sm:block"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/my-purchases"
                className="hidden font-medium text-zinc-300 transition hover:text-white sm:block"
              >
                <LinkPending>Minhas compras</LinkPending>
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-zinc-700 px-4 py-2 font-medium text-zinc-200 transition hover:border-yellow-400 hover:text-yellow-400"
              >
                <LinkPending>Meu painel</LinkPending>
              </Link>
              <form action="/api/auth/logout" method="POST">
                <button className="px-2 text-zinc-500 transition hover:text-white">
                  Sair
                </button>
              </form>
            </>
          )}
          <MobileMenu loggedIn={!!session} admin={isAdmin(session)} />
        </div>
      </nav>
    </header>
  );
}
