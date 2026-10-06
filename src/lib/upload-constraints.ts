// Limites compartilhados entre o browser e as rotas de API. Fica separado de
// images.ts porque aquele modulo e server-only (carrega o sharp).

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export const ACCEPTED_UPLOAD_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export type AcceptedMime = (typeof ACCEPTED_UPLOAD_MIME)[number];
