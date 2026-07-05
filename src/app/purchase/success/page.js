import Link from "next/link";
import { CheckIcon, ClockIcon } from "@/components/Icons";

export const metadata = { title: "Compra realizada — Clikou" };

export default async function Success({ searchParams }) {
  const { pending } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-zinc-950">
        {pending ? <ClockIcon size={32} /> : <CheckIcon size={32} />}
      </div>
      <h1 className="font-display mt-6 text-3xl font-bold tracking-tight">
        {pending ? "Pagamento em processamento" : "Compra confirmada!"}
      </h1>
      <p className="mt-3 text-zinc-400">
        {pending
          ? "Assim que o pagamento for aprovado, suas fotos serão liberadas em Minhas compras."
          : "Suas fotos já estão liberadas para download em alta resolução, sem marca d'água."}
      </p>
      <Link
        href="/my-purchases"
        className="mt-8 inline-block rounded-full bg-yellow-400 px-7 py-3.5 font-semibold text-zinc-950 transition hover:bg-yellow-300"
      >
        Ir para minhas compras
      </Link>
    </div>
  );
}
