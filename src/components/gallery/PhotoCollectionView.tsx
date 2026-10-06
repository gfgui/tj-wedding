"use client";

import { FullscreenLightbox } from "@/components/gallery/FullscreenLightbox";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { usePhotoCollection } from "@/components/gallery/use-photo-collection";
import type { PhotoDTO } from "@/lib/dto";

/**
 * Grid + tela cheia para as paginas renderizadas no servidor.
 *
 * As fotos chegam prontas do servidor, entao nao ha fetch nem spinner aqui — o
 * estado existe so para a curtida otimista e para o indice da tela cheia.
 */
export function PhotoCollectionView({
  initialPhotos,
  ranked = false,
  emptyTitle,
}: {
  initialPhotos: PhotoDTO[];
  ranked?: boolean;
  emptyTitle?: string;
}) {
  const { photos, like, openIndex, open, close } =
    usePhotoCollection(initialPhotos);

  return (
    <>
      <PhotoGrid
        photos={photos}
        onSelect={open}
        ranked={ranked}
        emptyTitle={emptyTitle}
      />

      {openIndex !== null && photos.length > 0 && (
        <FullscreenLightbox
          photos={photos}
          initialIndex={openIndex}
          onLike={like}
          onClose={close}
        />
      )}
    </>
  );
}
