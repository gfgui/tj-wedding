import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PhotoCollectionView } from "@/components/gallery/PhotoCollectionView";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FULL_RANKING_LIMIT, topLikedPhotos } from "@/lib/ranking";
import { currentGuest } from "@/lib/session";

// Le o cookie de sessao, entao nunca pode ser servida do cache estatico.
export const dynamic = "force-dynamic";

export default async function TopPhotosPage() {
  const viewer = await currentGuest();
  if (!viewer) redirect("/");

  const photos = await topLikedPhotos({
    limit: FULL_RANKING_LIMIT,
    viewerId: viewer.id,
  });

  return (
    <AppShell>
      <ScreenHeader
        eyebrow={`🏆 Ranking · ${photos.length} ${photos.length === 1 ? "foto curtida" : "fotos curtidas"}`}
        title="Fotos mais curtidas"
        fallbackHref="/?tab=ranking"
      />
      <PhotoCollectionView
        initialPhotos={photos}
        ranked
        emptyTitle="Ainda não há curtidas. Toque duas vezes numa foto para curtir."
      />
    </AppShell>
  );
}
