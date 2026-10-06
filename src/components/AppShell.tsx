import type { ReactNode } from "react";
import { PALETTE } from "@/lib/wedding";

/**
 * A coluna centralizada do app.
 *
 * Mesmo enquadramento do `WeddingApp`, para que as paginas proprias (galeria de
 * um convidado, rankings completos) nao mudem de largura no meio da navegacao.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="max-w-md mx-auto relative flex flex-col"
      style={{ minHeight: "100vh", background: PALETTE.cream }}
    >
      {children}
    </div>
  );
}
