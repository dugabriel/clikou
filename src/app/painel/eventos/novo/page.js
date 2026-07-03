import FormEvento from "@/components/FormEvento";
import { cartao } from "@/components/ui";

export const metadata = { title: "Criar evento — Clikou" };

export default function NovoEvento() {
  return (
    <div className="relative mx-auto max-w-lg">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl"
      />
      <div className={cartao}>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Criar evento
        </h2>
        <p className="mt-1.5 text-sm text-zinc-400">
          Depois de criar, você sobe as fotos e elas ficam à venda na hora.
        </p>
        <FormEvento />
      </div>
    </div>
  );
}
