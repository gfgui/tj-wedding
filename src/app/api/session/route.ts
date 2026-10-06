import { NextResponse } from "next/server";
import { z } from "zod";
import { GuestRole } from "@/generated/prisma/enums";
import { toGuestDTO } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";
import {
  clearSessionCookie,
  currentGuest,
  newSessionToken,
  setSessionCookie,
} from "@/lib/session";
import { AVATAR_IDS } from "@/lib/wedding";

const createGuestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Diga seu nome completo")
    .max(60, "Nome muito longo"),
  role: z.enum(GuestRole),
  avatarId: z
    .string()
    .refine((id) => AVATAR_IDS.includes(id), "Avatar inválido"),
});

export async function GET() {
  const guest = await currentGuest();
  return NextResponse.json({ guest: guest ? toGuestDTO(guest) : null });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createGuestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 },
    );
  }

  // Voltar e trocar o papel ou o avatar atualiza o mesmo convidado em vez de
  // criar um segundo — senao o ranking contaria a mesma pessoa duas vezes.
  const existing = await currentGuest();
  if (existing) {
    const guest = await prisma.guest.update({
      where: { id: existing.id },
      data: { ...parsed.data, lastSeenAt: new Date() },
    });
    return NextResponse.json({ guest: toGuestDTO(guest) });
  }

  const sessionToken = newSessionToken();
  const guest = await prisma.guest.create({
    data: { ...parsed.data, sessionToken },
  });
  await setSessionCookie(sessionToken);
  return NextResponse.json({ guest: toGuestDTO(guest) }, { status: 201 });
}

export async function DELETE() {
  await clearSessionCookie();
  return new NextResponse(null, { status: 204 });
}
