import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import ProfileForm from "@/components/ProfileForm";
import { isPro, normalizedCollections, planLimits } from "@/lib/plan";

export const dynamic = "force-dynamic";

export const metadata = { title: "Meu perfil — Clikou" };

export default async function ProfilePage() {
  const session = await getSession();
  await dbConnect();
  const user = await User.findById(session.id)
    .select(
      "name username bio city website instagram whatsapp collections brandColor coverKey avatarUrl cpf birthDate phone address plan planCurrentPeriodEnd"
    )
    .lean();

  const limits = planLimits(user);

  return (
    <ProfileForm
      pro={isPro(user)}
      limits={limits}
      collections={normalizedCollections(user)}
      profile={{
        name: user.name,
        username: user.username || "",
        bio: user.bio || "",
        city: user.city || "",
        website: user.website || "",
        instagram: user.instagram || "",
        whatsapp: user.whatsapp || "",
        brandColor: user.brandColor || "",
        coverKey: user.coverKey || "",
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
