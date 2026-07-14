import Link from "next/link";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import { isSellerProfileComplete } from "@/lib/seller";
import { isPro } from "@/lib/plan";
import EventForm from "@/components/EventForm";
import { card } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata = { title: "Criar evento — Clikou" };

export default async function NewEvent() {
  const session = await getSession();
  await dbConnect();
  const seller = await User.findById(session.id)
    .select("cpf birthDate phone address plan planCurrentPeriodEnd")
    .lean();
  const complete = isSellerProfileComplete(seller);

  return (
    <div className="relative mx-auto max-w-lg">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl"
      />
      <div className={card}>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Criar evento
        </h2>
        {complete ? (
          <>
            <p className="mt-1.5 text-sm text-zinc-400">
              Depois de criar, você sobe as fotos e elas ficam à venda na hora.
            </p>
            <EventForm pro={isPro(seller)} />
          </>
        ) : (
          <>
            <p className="mt-1.5 text-sm text-zinc-400">
              Falta um passo: para vender na clikou, a lei pede a identificação
              completa do vendedor. Preencha seus{" "}
              <strong className="text-zinc-200">dados para venda</strong> (CPF,
              data de nascimento, telefone e endereço) — leva 1 minuto e é só
              uma vez.
            </p>
            <Link
              href="/dashboard/profile"
              className="mt-6 inline-block rounded-full bg-yellow-400 px-6 py-3 font-semibold text-zinc-950 transition hover:bg-yellow-300"
            >
              Completar meu cadastro
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
