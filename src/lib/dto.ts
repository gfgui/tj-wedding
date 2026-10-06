import type { GuestRole } from "@/generated/prisma/enums";

// Contratos entre as rotas /api e os componentes de tela. Arquivo puro de tipos:
// nao importa nada de servidor, entao pode ser usado em client components.

export interface GuestDTO {
  id: string;
  name: string;
  role: GuestRole;
  emoji: string;
  label: string;
  avatarId: string;
  avatarSrc?: string;
}

export interface PhotoDTO {
  id: string;
  url: string;
  thumbUrl: string;
  caption: string;
  guestId: string;
  author: string;
  emoji: string;
  avatarSrc?: string;
  rotation: number;
  width: number;
  height: number;
  likes: number;
  likedByMe: boolean;
  mine: boolean;
  createdAt: string;
}

export interface RankingEntryDTO {
  guestId: string;
  author: string;
  emoji: string;
  avatarSrc?: string;
  thumbUrl?: string;
  count: number;
}

export interface PhotoFeedResponse {
  photos: PhotoDTO[];
}

export interface RankingResponse {
  /** Quem mais fotografou. */
  ranking: RankingEntryDTO[];
  /** As fotos mais curtidas, da mais para a menos curtida. */
  topPhotos: PhotoDTO[];
}

export interface UploadTicketResponse {
  photoId: string;
  objectKey: string;
  uploadUrl: string;
}
