import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import Gallery from "@/models/Gallery";
import GalleryPhoto from "@/models/GalleryPhoto";
import { BrandIcon } from "@/components/Logo";
import { isExpired, hasGalleryAccess } from "@/lib/gallery";
import GalleryPinGate from "@/components/GalleryPinGate";
import GalleryViewer from "@/components/GalleryViewer";
import { zipIsCurrent } from "@/lib/galleryZip";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await dbConnect();
  const gallery = await Gallery.findOne({ slug }).select("title").lean();
  return {
    title: gallery ? `${gallery.title} · clikou` : "Galeria · clikou",
    robots: { index: false, follow: false },
  };
}

export default async function ClientGallery({ params }) {
  const { slug } = await params;
  await dbConnect();
  const gallery = await Gallery.findOne({ slug }).lean();
  if (!gallery) notFound();

  if (isExpired(gallery)) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <BrandIcon size={40} />
        <h1 className="font-display mt-5 text-2xl font-bold">
          Esta galeria expirou
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          O link de entrega não está mais disponível. Fale com seu fotógrafo
          para reabrir o acesso.
        </p>
      </div>
    );
  }

  // Protegida por PIN e sem cookie de acesso → portão.
  const unlocked = await hasGalleryAccess(gallery);
  if (!unlocked) {
    return <GalleryPinGate slug={slug} title={gallery.title} />;
  }

  const photos = await GalleryPhoto.find({ gallery: gallery._id })
    .sort({ createdAt: 1 })
    .select("favorited fileName")
    .lean();

  // Só oferece a busca por selfie se há rostos indexados (fotos antigas,
  // de antes do recurso, não têm descritores).
  const faceSearch =
    gallery.faceSearch !== false &&
    !!(await GalleryPhoto.exists({
      gallery: gallery._id,
      "faces.0": { $exists: true },
    }));

  // ZIP pré-gerado ainda vale? Aí o botão vira link direto na página.
  const zipReady =
    gallery.downloadEnabled && photos.length > 0
      ? await zipIsCurrent(gallery)
      : false;

  return (
    <GalleryViewer
      slug={slug}
      title={gallery.title}
      clientName={gallery.clientName || ""}
      downloadEnabled={gallery.downloadEnabled}
      allowFavorites={gallery.allowFavorites}
      faceSearch={faceSearch}
      zipReady={zipReady}
      photos={photos.map((p) => ({
        id: p._id.toString(),
        favorited: !!p.favorited,
      }))}
    />
  );
}
