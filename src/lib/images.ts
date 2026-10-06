import "server-only";
import sharp from "sharp";
import type { AcceptedMime } from "./upload-constraints";

const EXTENSION: Record<AcceptedMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

export function extensionFor(mime: string): string {
  return EXTENSION[mime as AcceptedMime] ?? "bin";
}

export interface Derivatives {
  /** Dimensoes finais, ja com a rotacao EXIF aplicada. */
  width: number;
  height: number;
  thumb: Buffer;
  display: Buffer;
}

/**
 * Gera as duas versoes servidas ao convidado a partir do arquivo original.
 * `.rotate()` sem argumento aplica a orientacao do EXIF — sem isso, foto tirada
 * de pe no celular aparece deitada no grid. O re-encode tambem descarta os
 * metadados originais, incluindo a geolocalizacao embutida pela camera.
 */
export async function buildDerivatives(original: Buffer): Promise<Derivatives> {
  const [displayResult, thumbResult] = await Promise.all([
    sharp(original, { failOn: "none" })
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true }),
    sharp(original, { failOn: "none" })
      .rotate()
      .resize({
        width: 600,
        height: 600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 72 })
      .toBuffer({ resolveWithObject: true }),
  ]);

  return {
    width: displayResult.info.width,
    height: displayResult.info.height,
    display: displayResult.data,
    thumb: thumbResult.data,
  };
}

/** Inclinacao do polaroid, como no protótipo original (-3..3 graus). */
export function randomRotation(): number {
  return Math.floor(Math.random() * 7) - 3;
}
