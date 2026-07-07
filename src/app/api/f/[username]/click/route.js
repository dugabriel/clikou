import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

// Rastreia o clique num contato do perfil público (métrica Pro) e redireciona
// para o destino real. Cada canal incrementa seu contador.
const CHANNELS = {
  whatsapp: { field: "stats.waClicks", url: (u) => `https://wa.me/${u.whatsapp}` },
  instagram: {
    field: "stats.igClicks",
    url: (u) => `https://instagram.com/${u.instagram}`,
  },
  site: { field: "stats.siteClicks", url: (u) => u.website },
};

export async function GET(req, ctx) {
  const { username } = await ctx.params;
  const to = new URL(req.url).searchParams.get("to");
  const channel = CHANNELS[to];
  if (!channel) return NextResponse.redirect(new URL("/", req.url));

  await dbConnect();
  const user = await User.findOne({ username }).select(
    "whatsapp instagram website"
  );
  const target = user && channel.url(user);
  if (!target) return NextResponse.redirect(new URL("/", req.url));

  // Fire-and-forget: contar não pode atrasar o redirect.
  User.updateOne({ username }, { $inc: { [channel.field]: 1 } }).catch(() => {});

  return NextResponse.redirect(target);
}
