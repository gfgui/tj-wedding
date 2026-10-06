import type { PhotoEffect } from "@/generated/prisma/enums";

/** Teto por lote: segura o convidado ansioso e o uplink do salao. */
export const MAX_BATCH = 10;

export type QueueStatus = "pending" | "uploading" | "done" | "error";

export interface QueueItem {
  id: string;
  file: File;
  /** object URL da previa — precisa ser revogado ao sair da fila. */
  previewUrl: string;
  /** Vazio enquanto a foto herda a legenda do lote. */
  caption: string;
  captionTouched: boolean;
  effect: PhotoEffect;
  status: QueueStatus;
  progress: number;
  error?: string;
}

export function createQueueItem(file: File, effect: PhotoEffect): QueueItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    caption: "",
    captionTouched: false,
    effect,
    status: "pending",
    progress: 0,
  };
}

export function releaseQueueItem(item: QueueItem): void {
  URL.revokeObjectURL(item.previewUrl);
}

/** A legenda do lote vale ate a foto ganhar uma propria. */
export function resolveCaption(item: QueueItem, batchCaption: string): string {
  return item.captionTouched ? item.caption : batchCaption;
}
