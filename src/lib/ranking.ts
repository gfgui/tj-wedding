import "server-only";
import type { Guest, Photo } from "@/generated/prisma/client";
import { PhotoStatus } from "@/generated/prisma/enums";
import type { PhotoDTO, RankingEntryDTO } from "./dto";
import { toPhotoDTO } from "./mappers";
import { prisma } from "./prisma";
import { publicUrl } from "./storage";
import { avatarSrc, emojiForRole } from "./wedding";

type PhotoWithGuest = Photo & { guest: Guest };

/** Quanto a aba Ranking mostra antes de o convidado pedir a lista inteira. */
export const PREVIEW_GUESTS = 10;
export const PREVIEW_PHOTOS = 5;

/** Teto das paginas de "ver todos". Uma festa nao passa disso em um dia. */
export const FULL_RANKING_LIMIT = 100;

/** Mesmo teto do feed: um convidado so dificilmente chega perto. */
export const GUEST_PHOTOS_LIMIT = 300;

/**
 * Marca quais fotos da lista o convidado ja curtiu.
 *
 * Uma consulta so para o lote inteiro: perguntar foto por foto seria uma ida ao
 * banco por miniatura da galeria.
 */
export async function attachViewerLikes(
  photos: PhotoWithGuest[],
  viewerId: string,
): Promise<PhotoDTO[]> {
  if (photos.length === 0) return [];

  const likes = await prisma.like.findMany({
    where: { guestId: viewerId, photoId: { in: photos.map((p) => p.id) } },
    select: { photoId: true },
  });
  const likedIds = new Set(likes.map((like) => like.photoId));

  return photos.map((photo) => toPhotoDTO(photo, viewerId, likedIds));
}

/**
 * As fotos mais curtidas, da mais para a menos curtida.
 *
 * Foto sem curtida nenhuma fica fora: uma lista de zeros empatados nao e
 * ranking, e o empate seria resolvido pela data, o que ja e a galeria normal.
 */
export async function topLikedPhotos(options: {
  limit: number;
  viewerId: string;
}): Promise<PhotoDTO[]> {
  const photos = await prisma.photo.findMany({
    where: { status: PhotoStatus.READY, likeCount: { gt: 0 } },
    include: { guest: true },
    orderBy: [{ likeCount: "desc" }, { createdAt: "desc" }],
    take: options.limit,
  });
  return attachViewerLikes(photos, options.viewerId);
}

/** As fotos de um convidado, da mais recente para a mais antiga. */
export async function photosByGuest(options: {
  guestId: string;
  viewerId: string;
  limit: number;
}): Promise<PhotoDTO[]> {
  const photos = await prisma.photo.findMany({
    where: { status: PhotoStatus.READY, guestId: options.guestId },
    include: { guest: true },
    orderBy: { createdAt: "desc" },
    take: options.limit,
  });
  return attachViewerLikes(photos, options.viewerId);
}

/** Quem mais fotografou. A contagem sai do banco; o app nunca conta em memoria. */
export async function topGuests(limit: number): Promise<RankingEntryDTO[]> {
  const counts = await prisma.photo.groupBy({
    by: ["guestId"],
    where: { status: PhotoStatus.READY },
    _count: { _all: true },
    orderBy: { _count: { guestId: "desc" } },
    take: limit,
  });

  if (counts.length === 0) return [];

  const guestIds = counts.map((c) => c.guestId);

  // Duas consultas fixas em vez de uma por convidado: `distinct` devolve a foto
  // mais recente de cada um de uma vez so.
  const [guests, latestPhotos] = await Promise.all([
    prisma.guest.findMany({ where: { id: { in: guestIds } } }),
    prisma.photo.findMany({
      where: { status: PhotoStatus.READY, guestId: { in: guestIds } },
      distinct: ["guestId"],
      orderBy: { createdAt: "desc" },
      select: { guestId: true, thumbKey: true, objectKey: true },
    }),
  ]);

  const guestById = new Map(guests.map((g) => [g.id, g]));
  const thumbByGuest = new Map(
    latestPhotos.map((p) => [p.guestId, publicUrl(p.thumbKey ?? p.objectKey)]),
  );

  return counts.flatMap((entry) => {
    const author = guestById.get(entry.guestId);
    if (!author) return [];
    return [
      {
        guestId: author.id,
        author: author.name,
        emoji: emojiForRole(author.role),
        avatarSrc: avatarSrc(author.avatarId),
        thumbUrl: thumbByGuest.get(author.id),
        count: entry._count._all,
      },
    ];
  });
}
