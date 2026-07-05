"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/withdrawals", label: "Saques" },
  { href: "/admin/photographers", label: "Fotógrafos" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/10 bg-zinc-900/70 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
            pathname === href
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
