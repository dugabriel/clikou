import { dbConnect } from "@/lib/db";
import Usuario from "@/models/Usuario";
import { obterSessao } from "@/lib/auth";
import FormPerfil from "@/components/FormPerfil";

export const dynamic = "force-dynamic";

export const metadata = { title: "Meu perfil — Clikou" };

export default async function PaginaPerfil() {
  const sessao = await obterSessao();
  await dbConnect();
  const usuario = await Usuario.findById(sessao.id)
    .select("nome usuario sobre cidade website instagram whatsapp portfolio avatarUrl")
    .lean();

  return (
    <FormPerfil
      perfil={{
        nome: usuario.nome,
        usuario: usuario.usuario || "",
        sobre: usuario.sobre || "",
        cidade: usuario.cidade || "",
        website: usuario.website || "",
        instagram: usuario.instagram || "",
        whatsapp: usuario.whatsapp || "",
        portfolio: usuario.portfolio || [],
      }}
    />
  );
}
