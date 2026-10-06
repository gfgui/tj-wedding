import Link from "next/link";
import type { ComponentProps } from "react";
import { FONTS, PALETTE } from "@/lib/wedding";

/** Divisor com rotulo dourado, o separador de secao do design original. */
export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        style={{ flex: 1, height: 1, background: PALETTE.gold, opacity: 0.3 }}
      />
      <span
        style={{
          fontFamily: FONTS.display,
          fontSize: "0.72rem",
          color: PALETTE.gold,
          letterSpacing: "0.12em",
          textAlign: "center",
        }}
      >
        {label}
      </span>
      <div
        style={{ flex: 1, height: 1, background: PALETTE.gold, opacity: 0.3 }}
      />
    </div>
  );
}

/** "Ver tudo" de uma secao que mostra apenas o topo da lista. */
export function MoreLink({
  href,
  label,
}: {
  href: ComponentProps<typeof Link>["href"];
  label: string;
}) {
  return (
    <div className="flex justify-end">
      <Link
        href={href}
        className="flex items-center gap-1.5"
        style={{
          fontFamily: FONTS.body,
          fontSize: "0.7rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: PALETTE.gold,
          textDecoration: "none",
          padding: "6px 2px",
        }}
      >
        {label}
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}
