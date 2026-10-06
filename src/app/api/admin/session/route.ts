import { NextResponse } from "next/server";
import { z } from "zod";
import { checkPassword, grantAdmin, isAdmin, revokeAdmin } from "@/lib/admin";

const loginSchema = z.object({
  password: z.string().min(1, "Informe a senha"),
});

export async function GET() {
  return NextResponse.json({ authenticated: await isAdmin() });
}

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 },
    );
  }
  if (!checkPassword(parsed.data.password)) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }
  await grantAdmin();
  return NextResponse.json({ authenticated: true });
}

export async function DELETE() {
  await revokeAdmin();
  return new NextResponse(null, { status: 204 });
}
