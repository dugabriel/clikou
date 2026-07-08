import { cookies } from "next/headers";
import {
  createGalleryAccessToken,
  readGalleryAccessToken,
} from "@/lib/auth";

// Cookie de desbloqueio por galeria (o cliente pode abrir mais de uma).
export function galleryCookieName(id) {
  return `clikou_g_${id}`;
}

export function isExpired(gallery) {
  return (
    !!gallery.expiresAt &&
    new Date(gallery.expiresAt).getTime() < Date.now()
  );
}

// O cliente tem acesso? O slug já é o segredo do link; havendo PIN, exige o
// cookie de desbloqueio daquela galeria.
export async function hasGalleryAccess(gallery) {
  if (!gallery.pin) return true;
  const jar = await cookies();
  const token = jar.get(galleryCookieName(gallery._id))?.value;
  if (!token) return false;
  const gid = await readGalleryAccessToken(token);
  return gid === gallery._id.toString();
}

export async function grantGalleryAccess(gallery) {
  const jar = await cookies();
  jar.set(
    galleryCookieName(gallery._id),
    await createGalleryAccessToken(gallery._id),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    }
  );
}
