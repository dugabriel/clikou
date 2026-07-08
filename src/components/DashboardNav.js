"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "Início" },
  { href: "/dashboard/events/new", label: "Criar evento" },
  { href: "/dashboard/galleries", label: "Entregas" },
  { href: "/dashboard/profile", label: "Sobre mim" },
  { href: "/dashboard/marketing", label: "Divulgação" },
  { href: "/dashboard/plan", label: "Plano" },
  { href: "/dashboard/withdrawal", label: "Carteira" },
];

export default function DashboardNav() {
  const pathname = usePathname();

  function isActive(href) {
    if (pathname === href) return true;
    // gerenciamento de um evento conta como "Início"
    return (
      href === "/dashboard" &&
      pathname.startsWith("/dashboard/events/") &&
      pathname !== "/dashboard/events/new"
    );
  }

  return (
    <nav className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/10 bg-zinc-900/70 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
            isActive(href)
              ? "bg-yellow-400 font-semibold text-zinc-950"
              : "font-medium text-zinc-400 hover:text-white"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
