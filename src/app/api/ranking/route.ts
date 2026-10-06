import { NextResponse } from "next/server";
import type { RankingResponse } from "@/lib/dto";
import {
  PREVIEW_GUESTS,
  PREVIEW_PHOTOS,
  topGuests,
  topLikedPhotos,
} from "@/lib/ranking";
import { currentGuest } from "@/lib/session";

/**
 * Os dois rankings da aba, num pedido so.
 *
 * Esta rota serve o preview da aba Ranking, que o app recarrega a cada 10s. As
 * listas completas sao renderizadas no servidor em /ranking/fotos e
 * /ranking/convidados, que vao direto ao banco sem passar por aqui.
 */
export async function GET() {
  const guest = await currentGuest();
  if (!guest)
    return NextResponse.json({ error: "Sessão expirada" }, { status: 401 });

  const [ranking, topPhotos] = await Promise.all([
    topGuests(PREVIEW_GUESTS),
    topLikedPhotos({ limit: PREVIEW_PHOTOS, viewerId: guest.id }),
  ]);

  const body: RankingResponse = { ranking, topPhotos };
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
