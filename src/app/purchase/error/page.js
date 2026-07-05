import Link from "next/link";
import { XIcon } from "@/components/Icons";

export const metadata = { title: "Pagamento não concluído — Clikou" };

export default function Error() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-zinc-700 text-zinc-400">
        <XIcon size={30} />
      </div>
      <h1 className="font-display mt-6 text-3xl font-bold tracking-tight">
        Pagamento não concluído
      </h1>
      <p className="mt-3 text-zinc-400">
        Algo deu errado com o pagamento. Nenhum valor foi cobrado — você pode
        tentar de novo quando quiser.
      </p>
      <Link
        href="/events"
        className="mt-8 inline-block rounded-full bg-yellow-400 px-7 py-3.5 font-semibold text-zinc-950 transition hover:bg-yellow-300"
      >
        Voltar aos eventos
      </Link>
    </div>
  );
}
