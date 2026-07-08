import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { isPro } from "@/lib/plan";
import DashboardNav from "@/components/DashboardNav";
import PlanBadge from "@/components/PlanBadge";

export default async function DashboardLayout({ children }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");

  // Sessão válida mas usuário inexistente (ex.: conta removida ou banco
  // recriado) — manda refazer o login em vez de quebrar as páginas.
  await dbConnect();
  const user = await User.findById(session.id)
    .select("plan planCurrentPeriodEnd")
    .lean();
  if (!user) redirect("/login?next=/dashboard");
  const pro = isPro(user);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {session.name || "Fotógrafo"}
            </h1>
            <PlanBadge pro={pro} />
          </div>
          <p className="mt-0.5 text-sm text-zinc-500">
            Área do fotógrafo — seus eventos, entregas, vendas e página
            pública.
          </p>
        </div>
        <DashboardNav />
      </div>
      {children}
    </div>
  );
}
