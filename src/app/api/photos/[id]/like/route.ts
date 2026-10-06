import { NextResponse } from "next/server";
import { PhotoStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { currentGuest } from "@/lib/session";

/** Alterna a curtida do convidado. O contador da foto anda junto na mesma transacao. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guest = await currentGuest();
  if (!guest)
    return NextResponse.json({ error: "Sessão expirada" }, { status: 401 });

  const { id: photoId } = await params;

  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    select: { status: true },
  });
  if (!photo || photo.status !== PhotoStatus.READY) {
    return NextResponse.json({ error: "Foto não encontrada" }, { status: 404 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.like.findUnique({
      where: { photoId_guestId: { photoId, guestId: guest.id } },
    });

    if (existing) {
      await tx.like.delete({
        where: { photoId_guestId: { photoId, guestId: guest.id } },
      });
      const updated = await tx.photo.update({
        where: { id: photoId },
        data: { likeCount: { decrement: 1 } },
        select: { likeCount: true },
      });
      return { liked: false, likes: updated.likeCount };
    }

    await tx.like.create({ data: { photoId, guestId: guest.id } });
    const updated = await tx.photo.update({
      where: { id: photoId },
      data: { likeCount: { increment: 1 } },
      select: { likeCount: true },
    });
    return { liked: true, likes: updated.likeCount };
  });

  return NextResponse.json(result);
}
