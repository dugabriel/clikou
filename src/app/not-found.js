import Link from "next/link";
import { BrandIcon } from "@/components/Logo";

// 404 do site inteiro — sem ele o Next mostra a tela padrão em inglês com
// fundo branco. Caso comum: link de galeria/evento digitado errado ou
// removido, então o texto orienta a conferir com quem mandou.
export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <BrandIcon size={40} />
      <p className="font-display mt-6 text-6xl font-bold tracking-tight text-yellow-400">
        404
      </p>
      <h1 className="font-display mt-2 text-2xl font-bold">
        Essa página não existe
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        O endereço pode ter sido digitado errado, ou o link que você recebeu
        expirou ou foi removido. Se alguém te mandou este link, vale conferir
        com essa pessoa.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-yellow-300"
        >
          Ir para o início
        </Link>
        <Link
          href="/events"
          className="rounded-full border border-zinc-700 px-5 py-2.5 text-sm font-medium hover:border-zinc-500"
        >
          Ver eventos
        </Link>
      </div>
    </div>
  );
}
