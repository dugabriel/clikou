import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import ProfileForm from "@/components/ProfileForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Meu perfil — Clikou" };

export default async function ProfilePage() {
  const session = await getSession();
  await dbConnect();
  const user = await User.findById(session.id)
    .select(
      "name username bio city website instagram whatsapp portfolio avatarUrl cpf birthDate phone address"
    )
    .lean();

  return (
    <ProfileForm
      profile={{
        name: user.name,
        username: user.username || "",
        bio: user.bio || "",
        city: user.city || "",
        website: user.website || "",
        instagram: user.instagram || "",
        whatsapp: user.whatsapp || "",
        portfolio: user.portfolio || [],
        cpf: user.cpf || "",
        birthDate: user.birthDate
          ? new Date(user.birthDate).toISOString().slice(0, 10)
          : "",
        phone: user.phone || "",
        address: {
          cep: user.address?.cep || "",
          street: user.address?.street || "",
          number: user.address?.number || "",
          complement: user.address?.complement || "",
          district: user.address?.district || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
        },
      }}
    />
  );
}
