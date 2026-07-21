"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "@/components/Icons";

// Menu hambúrguer do Navbar em telas pequenas (< sm), onde os links do site
// ficam escondidos. Fecha sozinho ao navegar (mudança de pathname).
export default function MobileMenu({ loggedIn, admin }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const itemClass =
    "block rounded-lg px-3 py-2.5 font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white";

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-white/5 hover:text-white"
      >
        {open ? <XIcon size={22} /> : <MenuIcon size={22} />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-white/5 bg-zinc-950/95 backdrop-blur-md">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-3 text-sm">
            <Link href="/portfolio" className={itemClass}>
              Para fotógrafos
            </Link>
            <Link href="/events" className={itemClass}>
              Eventos
            </Link>
            <Link href="/about" className={itemClass}>
              Sobre
            </Link>
            <Link href="/parceria" className={itemClass}>
              Parceria
            </Link>
            {loggedIn && (
              <Link href="/my-purchases" className={itemClass}>
                Minhas compras
              </Link>
            )}
            {admin && (
              <Link href="/admin" className={itemClass}>
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
