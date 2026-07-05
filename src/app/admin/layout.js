import { redirect } from "next/navigation";
import { getSession, isAdmin } from "@/lib/auth";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({ children }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (!isAdmin(session)) redirect("/");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Administração
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Vendas, saques e taxas da plataforma.
          </p>
        </div>
        <AdminNav />
      </div>
      {children}
    </div>
  );
}
