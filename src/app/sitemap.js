import { dbConnect } from "@/lib/db";
import Event from "@/models/Event";
import User from "@/models/User";

const APP_URL = process.env.APP_URL || "https://clikou.click";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  await dbConnect();
  const [events, photographers] = await Promise.all([
    Event.find({ published: true }).select("updatedAt").lean(),
    User.find({ username: { $exists: true, $ne: null } })
      .select("username updatedAt")
      .lean(),
  ]);

  return [
    { url: APP_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    {
      url: `${APP_URL}/events`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/portfolio`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${APP_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${APP_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...events.map((e) => ({
      url: `${APP_URL}/events/${e._id.toString()}`,
      lastModified: e.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    })),
    ...photographers.map((p) => ({
      url: `${APP_URL}/f/${p.username}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    })),
  ];
}
