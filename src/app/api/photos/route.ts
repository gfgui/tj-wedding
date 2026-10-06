import { NextResponse } from "next/server";
import { z } from "zod";
import { PhotoStatus } from "@/generated/prisma/enums";
import type { PhotoFeedResponse } from "@/lib/dto";
import { buildDerivatives } from "@/lib/images";
import { toPhotoDTO } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";
import { attachViewerLikes } from "@/lib/ranking";
import { currentGuest } from "@/lib/session";
import { deleteObjects, getObjectBuffer, putObject } from "@/lib/storage";
import { MAX_UPLOAD_BYTES } from "@/lib/upload-constraints";

const FEED_LIMIT = 300;

// O sharp e um binario nativo: esta rota nunca pode cair no runtime Edge.
export const runtime = "nodejs";

// A finalizacao e a rota mais pesada do app — baixa o original do storage e
// gera duas versoes. Uma foto de 15MB numa rede ruim estoura com folga o teto
// padrao de poucos segundos da plataforma, e o convidado veria a foto sumir.
export const maxDuration = 60;

export async function GET(request: Request) {
  const guest = await currentGuest();
  if (!guest)
    return NextResponse.json({ error: "Sessão expirada" }, { status: 401 });

  const scope = new URL(request.url).searchParams.get("scope");

  const photos = await prisma.photo.findMany({
    where: {
      status: PhotoStatus.READY,
      ...(scope === "mine" ? { guestId: guest.id } : {}),
    },
    include: { guest: true },
    orderBy: { createdAt: "desc" },
    take: FEED_LIMIT,
  });

  const body: PhotoFeedResponse = {
    photos: await attachViewerLikes(photos, guest.id),
  };
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}

const finalizeSchema = z.object({
  photoId: z.string().min(1),
  caption: z.string().trim().max(140, "Legenda muito longa"),
});

/** Confirma um upload: le o original do storage, gera as versoes e publica. */
export async function POST(request: Request) {
  const guest = await currentGuest();
  if (!guest)
    return NextResponse.json({ error: "Sessão expirada" }, { status: 401 });

  const parsed = finalizeSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 },
    );
  }

  const pending = await prisma.photo.findUnique({
    where: { id: parsed.data.photoId },
  });
  if (!pending || pending.guestId !== guest.id) {
    return NextResponse.json({ error: "Foto não encontrada" }, { status: 404 });
  }
  if (pending.status !== PhotoStatus.PENDING) {
    return NextResponse.json(
      { error: "Esta foto já foi publicada" },
      { status: 409 },
    );
  }

  let original: Buffer;
  try {
    original = await getObjectBuffer(pending.objectKey);
  } catch {
    return NextResponse.json(
      { error: "O upload não chegou ao servidor" },
      { status: 409 },
    );
  }

  // O tamanho informado no ticket e so uma declaracao do cliente; o que vale e
  // o que realmente chegou no bucket.
  if (original.byteLength > MAX_UPLOAD_BYTES) {
    await discard(pending.id, [pending.objectKey]);
    return NextResponse.json({ error: "Foto maior que 20MB" }, { status: 413 });
  }

  let derivatives: Awaited<ReturnType<typeof buildDerivatives>>;
  try {
    derivatives = await buildDerivatives(original);
  } catch {
    await discard(pending.id, [pending.objectKey]);
    return NextResponse.json(
      { error: "O arquivo enviado não é uma imagem válida" },
      { status: 422 },
    );
  }

  const thumbKey = `miniaturas/${pending.id}.webp`;
  const displayKey = `exibicao/${pending.id}.webp`;
  await Promise.all([
    putObject(thumbKey, derivatives.thumb, "image/webp"),
    putObject(displayKey, derivatives.display, "image/webp"),
  ]);

  const photo = await prisma.photo.update({
    where: { id: pending.id },
    data: {
      caption: parsed.data.caption,
      width: derivatives.width,
      height: derivatives.height,
      sizeBytes: original.byteLength,
      thumbKey,
      displayKey,
      status: PhotoStatus.READY,
    },
    include: { guest: true },
  });

  return NextResponse.json(
    { photo: toPhotoDTO(photo, guest.id, new Set<string>()) },
    { status: 201 },
  );
}

async function discard(photoId: string, keys: string[]): Promise<void> {
  await prisma.photo.delete({ where: { id: photoId } }).catch(() => undefined);
  await deleteObjects(keys).catch(() => undefined);
}
