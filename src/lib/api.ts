import type { GuestRole, PhotoEffect } from "@/generated/prisma/enums";
import type {
  GuestDTO,
  PhotoDTO,
  PhotoFeedResponse,
  RankingEntryDTO,
  UploadTicketResponse,
} from "./dto";

async function unwrap<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? `Falha na requisição (${res.status})`);
  }
  return (await res.json()) as T;
}

const JSON_HEADERS = { "content-type": "application/json" };

export async function saveGuest(input: {
  name: string;
  role: GuestRole;
  avatarId: string;
}): Promise<GuestDTO> {
  const res = await fetch("/api/session", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
  return (await unwrap<{ guest: GuestDTO }>(res)).guest;
}

export async function fetchPhotos(scope: "all" | "mine"): Promise<PhotoDTO[]> {
  const res = await fetch(`/api/photos?scope=${scope}`, { cache: "no-store" });
  return (await unwrap<PhotoFeedResponse>(res)).photos;
}

export async function fetchRanking(): Promise<RankingEntryDTO[]> {
  const res = await fetch("/api/ranking", { cache: "no-store" });
  return (await unwrap<{ ranking: RankingEntryDTO[] }>(res)).ranking;
}

export async function toggleLike(
  photoId: string,
): Promise<{ liked: boolean; likes: number }> {
  const res = await fetch(`/api/photos/${photoId}/like`, { method: "POST" });
  return unwrap<{ liked: boolean; likes: number }>(res);
}

/**
 * fetch() nao expoe progresso de upload; XHR expoe. Numa rede de salao um envio
 * de 8MB leva bastante tempo e a barra e a unica pista de que algo acontece.
 */
function putWithProgress(
  url: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("content-type", file.type);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable)
        onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Falha no envio da foto (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Conexão perdida durante o envio"));
    xhr.send(file);
  });
}

/** Assina, envia direto ao storage e so entao publica a foto na galeria. */
export async function uploadPhoto(options: {
  file: File;
  caption: string;
  effect: PhotoEffect;
  onProgress?: (pct: number) => void;
}): Promise<PhotoDTO> {
  const ticketRes = await fetch("/api/photos/upload-url", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      contentType: options.file.type,
      sizeBytes: options.file.size,
      effect: options.effect,
    }),
  });
  const ticket = await unwrap<UploadTicketResponse>(ticketRes);

  await putWithProgress(ticket.uploadUrl, options.file, options.onProgress);

  const finalizeRes = await fetch("/api/photos", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ photoId: ticket.photoId, caption: options.caption }),
  });
  return (await unwrap<{ photo: PhotoDTO }>(finalizeRes)).photo;
}
