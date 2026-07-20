"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LinkPending from "@/components/LinkPending";

// Só destinos — a criação de evento/galeria virou ação dentro das páginas,
// não item de navegação. Entregas primeiro (coração do painel), Eventos ao
// lado: são os dois produtos.
const tabs = [
  { href: "/dashboard", label: "Início" },
  { href: "/dashboard/galleries", label: "Entregas" },
  { href: "/dashboard/clients", label: "Clientes" },
  { href: "/dashboard/events", label: "Eventos" },
  { href: "/dashboard/profile", label: "Minha página" },
  { href: "/dashboard/marketing", label: "Divulgação" },
  { href: "/dashboard/withdrawal", label: "Carteira" },
  { href: "/dashboard/plan", label: "Plano" },
];

export default function DashboardNav() {
  const pathname = usePathname();

  function isActive(href) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
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
          <LinkPending>{label}</LinkPending>
        </Link>
      ))}
    </nav>
  );
}
