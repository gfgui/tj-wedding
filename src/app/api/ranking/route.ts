import { NextResponse } from "next/server";
import { PhotoStatus } from "@/generated/prisma/enums";
import type { RankingEntryDTO } from "@/lib/dto";
import { prisma } from "@/lib/prisma";
import { currentGuest } from "@/lib/session";
import { publicUrl } from "@/lib/storage";
import { avatarSrc, emojiForRole } from "@/lib/wedding";

/** Quem mais fotografou. A contagem sai do banco; o app nunca conta em memoria. */
export async function GET() {
  const guest = await currentGuest();
  if (!guest)
    return NextResponse.json({ error: "Sessão expirada" }, { status: 401 });

  const counts = await prisma.photo.groupBy({
    by: ["guestId"],
    where: { status: PhotoStatus.READY },
    _count: { _all: true },
    orderBy: { _count: { guestId: "desc" } },
    take: 50,
  });

  if (counts.length === 0) return NextResponse.json({ ranking: [] });

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

  const ranking: RankingEntryDTO[] = counts.flatMap((entry) => {
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

  return NextResponse.json(
    { ranking },
    { headers: { "Cache-Control": "no-store" } },
  );
}
