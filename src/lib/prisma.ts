import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// No Prisma 7 o engine Rust saiu do caminho padrao: a conexao passa por um
// driver adapter. O schema nao declara url — a CLI le do prisma7.config.ts e o
// runtime recebe aqui, a partir do .env que o Next carrega sozinho.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString)
    throw new Error("Variável de ambiente ausente: DATABASE_URL");

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

// Em dev o hot reload reavalia o modulo a cada edicao; sem o cache global isso
// abre um pool novo por reload ate o Postgres recusar conexoes.
export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
