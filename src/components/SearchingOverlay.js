"use client";

// Overlay de tela cheia enquanto uma busca roda (selfie/print): deixa claro
// que algo está acontecendo — sem ele, a análise parece travamento.
export default function SearchingOverlay({ message }) {
  if (!message) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-zinc-950/90 px-6 text-center">
      <span
        aria-hidden
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-zinc-700 border-t-yellow-400"
      />
      <p className="font-semibold text-white">{message}</p>
      <p className="text-sm text-zinc-400">
        A análise acontece no seu aparelho — leva só alguns segundos.
      </p>
    </div>
  );
}
