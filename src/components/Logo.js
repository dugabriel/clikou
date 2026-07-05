import Link from "next/link";

export function BrandIcon({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      aria-hidden="true"
    >
      <rect width="96" height="96" rx="22" fill="#FACC15" />
      <g
        fill="none"
        stroke="#0A0A0A"
        strokeWidth="7"
        strokeLinecap="round"
      >
        <path d="M22 34v-4a8 8 0 0 1 8-8h4" />
        <path d="M74 34v-4a8 8 0 0 0-8-8h-4" />
        <path d="M22 62v4a8 8 0 0 0 8 8h4" />
        <path d="M74 62v4a8 8 0 0 1-8 8h-4" />
      </g>
      <circle cx="48" cy="48" r="13" fill="#0A0A0A" />
    </svg>
  );
}

export default function Logo({ size = 28, className = "" }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 ${className}`}
      aria-label="Clikou — página inicial"
    >
      <BrandIcon size={size} />
      <span className="font-display text-xl font-bold lowercase tracking-tight">
        clik<span className="text-yellow-400">ou</span>
      </span>
    </Link>
  );
}
