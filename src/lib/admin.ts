import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "casamento_admin";
const ADMIN_MAX_AGE = 60 * 60 * 12;

function adminPassword(): string {
  const value = process.env.ADMIN_PASSWORD;
  if (!value) throw new Error("Variável de ambiente ausente: ADMIN_PASSWORD");
  return value;
}

/**
 * Token derivado da senha via HMAC. Nao da para forjar sem conhecer a senha e
 * nao exige guardar sessao de admin no banco.
 */
function adminToken(): string {
  return createHmac("sha256", adminPassword())
    .update("painel-moderacao")
    .digest("hex");
}

function constantTimeEquals(a: string, b: string): boolean {
  // timingSafeEqual exige buffers do mesmo tamanho; o hash normaliza o
  // comprimento sem vazar o tamanho da senha pelo tempo de comparacao.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(candidate: string): boolean {
  return constantTimeEquals(candidate, adminPassword());
}

export async function grantAdmin(): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_MAX_AGE,
  });
}

export async function revokeAdmin(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return constantTimeEquals(token, adminToken());
}
