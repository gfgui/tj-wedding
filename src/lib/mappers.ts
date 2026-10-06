import "server-only";
import type { Guest, Photo } from "@/generated/prisma/client";
import type { GuestDTO, PhotoDTO } from "./dto";
import { publicUrl } from "./storage";
import { avatarSrc, emojiForRole, labelForRole } from "./wedding";

export function toGuestDTO(guest: Guest): GuestDTO {
  return {
    id: guest.id,
    name: guest.name,
    role: guest.role,
    emoji: emojiForRole(guest.role),
    label: labelForRole(guest.role),
    avatarId: guest.avatarId,
    avatarSrc: avatarSrc(guest.avatarId),
  };
}

export function toPhotoDTO(
  photo: Photo & { guest: Guest },
  viewerId: string,
  likedPhotoIds: ReadonlySet<string>,
): PhotoDTO {
  return {
    id: photo.id,
    url: publicUrl(photo.displayKey ?? photo.objectKey),
    // Antes da miniatura existir, o original segura o lugar dela.
    thumbUrl: publicUrl(photo.thumbKey ?? photo.objectKey),
    caption: photo.caption,
    guestId: photo.guestId,
    author: photo.guest.name,
    emoji: emojiForRole(photo.guest.role),
    avatarSrc: avatarSrc(photo.guest.avatarId),
    rotation: photo.rotation,
    width: photo.width,
    height: photo.height,
    likes: photo.likeCount,
    likedByMe: likedPhotoIds.has(photo.id),
    mine: photo.guestId === viewerId,
    createdAt: photo.createdAt.toISOString(),
  };
}
