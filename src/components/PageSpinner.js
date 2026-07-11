// Fallback dos loading.js: spinner centralizado enquanto a rota renderiza no
// servidor. Server component — não precisa de "use client".
export default function PageSpinner({ className = "min-h-[60vh]" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center gap-3 text-sm text-zinc-500">
        <span
          aria-hidden
          className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-yellow-400"
        />
        Carregando…
      </div>
    </div>
  );
}
