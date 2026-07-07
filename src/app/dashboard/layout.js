import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import DashboardNav from "@/components/DashboardNav";

export default async function DashboardLayout({ children }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");

  // Sessão válida mas usuário inexistente (ex.: conta removida ou banco
  // recriado) — manda refazer o login em vez de quebrar as páginas.
  await dbConnect();
  const exists = await User.exists({ _id: session.id });
  if (!exists) redirect("/login?next=/dashboard");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Área do fotógrafo
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Olá, {session.name?.split(" ")[0]} — seus eventos, vendas e página
            pública.
          </p>
        </div>
        <DashboardNav />
      </div>
      {children}
    </div>
  );
}
