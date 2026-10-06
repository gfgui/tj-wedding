import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PhotoCollectionView } from "@/components/gallery/PhotoCollectionView";
import { ScreenHeader } from "@/components/ScreenHeader";
import { prisma } from "@/lib/prisma";
import { GUEST_PHOTOS_LIMIT, photosByGuest } from "@/lib/ranking";
import { currentGuest } from "@/lib/session";
import { avatarSrc, emojiForRole, labelForRole } from "@/lib/wedding";

// Le o cookie de sessao, entao nunca pode ser servida do cache estatico.
export const dynamic = "force-dynamic";

export default async function GuestPhotosPage({
  params,
}: {
  params: Promise<{ guestId: string }>;
}) {
  const viewer = await currentGuest();
  // Sem sessao nao ha o que mostrar: a raiz pede o nome e devolve o convidado
  // para a galeria.
  if (!viewer) redirect("/");

  const { guestId } = await params;
  const author = await prisma.guest.findUnique({ where: { id: guestId } });
  if (!author) notFound();

  const photos = await photosByGuest({
    guestId,
    viewerId: viewer.id,
    limit: GUEST_PHOTOS_LIMIT,
  });

  const count = photos.length;
  const mine = author.id === viewer.id;

  return (
    <AppShell>
      <ScreenHeader
        eyebrow={`${emojiForRole(author.role)} ${labelForRole(author.role)} · ${count} ${count === 1 ? "foto" : "fotos"}`}
        title={mine ? "Minhas fotos" : author.name}
        avatarSrc={avatarSrc(author.avatarId)}
        fallbackHref="/"
      />
      <PhotoCollectionView
        initialPhotos={photos}
        emptyTitle={
          mine
            ? "Você ainda não publicou nenhuma foto."
            : `${author.name} ainda não publicou nenhuma foto.`
        }
      />
    </AppShell>
  );
}
