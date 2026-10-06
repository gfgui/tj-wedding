import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { Guest } from "@/generated/prisma/client";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "casamento_sessao";

// O casamento e um dia so; 3 dias cobrem a festa, a madrugada e o dia seguinte
// para quem quiser rever as fotos antes de tudo ser arquivado.
const SESSION_MAX_AGE = 60 * 60 * 24 * 3;

/** Token opaco de 256 bits. Ele proprio e o segredo — nao ha o que assinar. */
export function newSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function currentGuest(): Promise<Guest | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return prisma.guest.findUnique({ where: { sessionToken: token } });
}
