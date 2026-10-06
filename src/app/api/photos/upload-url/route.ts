import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { PhotoEffect } from "@/generated/prisma/enums";
import type { UploadTicketResponse } from "@/lib/dto";
import { extensionFor, randomRotation } from "@/lib/images";
import { prisma } from "@/lib/prisma";
import { currentGuest } from "@/lib/session";
import { presignUpload } from "@/lib/storage";
import {
  ACCEPTED_UPLOAD_MIME,
  MAX_UPLOAD_BYTES,
} from "@/lib/upload-constraints";

const ticketSchema = z.object({
  contentType: z.enum(ACCEPTED_UPLOAD_MIME),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(MAX_UPLOAD_BYTES, "Foto maior que 20MB"),
  effect: z.enum(PhotoEffect).default(PhotoEffect.NONE),
});

export async function POST(request: Request) {
  const guest = await currentGuest();
  if (!guest)
    return NextResponse.json({ error: "Sessão expirada" }, { status: 401 });

  const parsed = ticketSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Arquivo inválido" },
      { status: 400 },
    );
  }

  const objectKey = `originais/${randomUUID()}.${extensionFor(parsed.data.contentType)}`;

  // A linha nasce PENDING e ja amarrada ao convidado: na finalizacao da para
  // provar que quem confirma o upload e o dono da chave assinada.
  const photo = await prisma.photo.create({
    data: {
      objectKey,
      caption: "",
      mimeType: parsed.data.contentType,
      sizeBytes: parsed.data.sizeBytes,
      width: 0,
      height: 0,
      rotation: randomRotation(),
      effect: parsed.data.effect,
      guestId: guest.id,
    },
  });

  const uploadUrl = await presignUpload(objectKey, parsed.data.contentType);
  const ticket: UploadTicketResponse = {
    photoId: photo.id,
    objectKey,
    uploadUrl,
  };
  return NextResponse.json(ticket, { status: 201 });
}
