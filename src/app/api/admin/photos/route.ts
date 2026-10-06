import { NextResponse } from "next/server";
import { PhotoStatus } from "@/generated/prisma/enums";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { publicUrl } from "@/lib/storage";
import { emojiForRole } from "@/lib/wedding";

/** Listagem de moderacao: inclui as ocultas, que nunca aparecem na galeria. */
export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const photos = await prisma.photo.findMany({
    where: { status: { in: [PhotoStatus.READY, PhotoStatus.HIDDEN] } },
    include: { guest: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return NextResponse.json(
    {
      photos: photos.map((photo) => ({
        id: photo.id,
        thumbUrl: publicUrl(photo.thumbKey ?? photo.objectKey),
        caption: photo.caption,
        author: photo.guest.name,
        emoji: emojiForRole(photo.guest.role),
        status: photo.status,
        likes: photo.likeCount,
        createdAt: photo.createdAt.toISOString(),
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
