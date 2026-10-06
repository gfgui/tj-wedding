"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toggleLike } from "@/lib/api";
import type { PhotoDTO } from "@/lib/dto";

/**
 * Uma lista de fotos com curtida otimista e tela cheia.
 *
 * Existe como hook porque o app tem varias listas independentes na mesma
 * sessao: o feed da galeria, a faixa de mais curtidas da aba Ranking e as
 * paginas de convidado e de ranking completo. Cada uma tem a sua instancia; o
 * polling de 10s reconcilia o que divergir entre elas.
 */
export function usePhotoCollection(initial: PhotoDTO[] = []) {
  const [photos, setPhotos] = useState<PhotoDTO[]>(initial);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Espelho das fotos para o handler de curtida ler o valor anterior sem
  // depender de quando o React executa o updater de estado.
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  /** O coracao responde na hora e o servidor corrige depois. */
  const like = useCallback(async (photoId: string) => {
    const before = photosRef.current.find((photo) => photo.id === photoId);
    if (!before) return;

    const patch = (values: Pick<PhotoDTO, "likedByMe" | "likes">) =>
      setPhotos((current) =>
        current.map((photo) =>
          photo.id === photoId ? { ...photo, ...values } : photo,
        ),
      );

    patch({
      likedByMe: !before.likedByMe,
      likes: Math.max(0, before.likes + (before.likedByMe ? -1 : 1)),
    });

    try {
      const result = await toggleLike(photoId);
      patch({ likedByMe: result.liked, likes: result.likes });
    } catch {
      patch({ likedByMe: before.likedByMe, likes: before.likes });
    }
  }, []);

  const open = useCallback((index: number) => setOpenIndex(index), []);
  const close = useCallback(() => setOpenIndex(null), []);

  return { photos, setPhotos, like, openIndex, open, close };
}
