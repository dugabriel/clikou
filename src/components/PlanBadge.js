// Selinho do plano do fotógrafo. Pro em dourado, grátis em cinza.
export default function PlanBadge({ pro }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
        pro
          ? "bg-yellow-400 text-zinc-950"
          : "border border-white/15 bg-white/5 text-zinc-300"
      }`}
    >
      {pro ? "Pro" : "Grátis"}
    </span>
  );
}
