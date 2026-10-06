import { NextResponse } from "next/server";
import { z } from "zod";
import { PhotoStatus } from "@/generated/prisma/enums";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { deleteObjects } from "@/lib/storage";

const patchSchema = z.object({
  status: z.enum([PhotoStatus.READY, PhotoStatus.HIDDEN]),
});

/** Oculta ou devolve uma foto a galeria sem apagar nada. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const photo = await prisma.photo
    .update({
      where: { id: (await params).id },
      data: { status: parsed.data.status },
      select: { id: true, status: true },
    })
    .catch(() => null);

  if (!photo)
    return NextResponse.json({ error: "Foto não encontrada" }, { status: 404 });
  return NextResponse.json(photo);
}

/** Remocao definitiva: linha, original, miniatura e versao de exibicao. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const photo = await prisma.photo.findUnique({
    where: { id: (await params).id },
  });
  if (!photo)
    return NextResponse.json({ error: "Foto não encontrada" }, { status: 404 });

  await prisma.photo.delete({ where: { id: photo.id } });
  await deleteObjects([photo.objectKey, photo.thumbKey, photo.displayKey]);

  return new NextResponse(null, { status: 204 });
}
