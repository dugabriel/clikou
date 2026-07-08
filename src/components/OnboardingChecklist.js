import Link from "next/link";

// Checklist de ativação no topo do dashboard. Some sozinho quando tudo está
// concluído. Só o próximo passo pendente ganha o botão de destaque.
export default function OnboardingChecklist({ steps }) {
  const done = steps.filter((s) => s.done).length;
  if (done === steps.length) return null;
  const nextIdx = steps.findIndex((s) => !s.done);

  return (
    <div className="mb-8 rounded-2xl border border-yellow-400/20 bg-gradient-to-b from-yellow-400/[0.06] to-transparent p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">Comece por aqui 🚀</h2>
        <span className="text-sm text-zinc-400">
          {done}/{steps.length} concluído
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full bg-yellow-400 transition-all"
          style={{ width: `${(done / steps.length) * 100}%` }}
        />
      </div>

      <ul className="mt-5 space-y-2.5">
        {steps.map((s, i) => (
          <li key={s.label} className="flex items-center gap-3">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                s.done
                  ? "bg-emerald-500 text-zinc-950"
                  : "border border-zinc-600 text-zinc-500"
              }`}
            >
              {s.done ? "✓" : i + 1}
            </span>
            <span
              className={`flex-1 text-sm ${
                s.done ? "text-zinc-500 line-through" : "text-zinc-200"
              }`}
            >
              {s.label}
            </span>
            {!s.done &&
              (i === nextIdx ? (
                <Link
                  href={s.href}
                  className="shrink-0 rounded-full bg-yellow-400 px-4 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-yellow-300"
                >
                  {s.cta}
                </Link>
              ) : (
                <Link
                  href={s.href}
                  className="shrink-0 text-xs text-yellow-400 hover:underline"
                >
                  {s.cta}
                </Link>
              ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
