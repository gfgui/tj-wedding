"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { MonogramCircle } from "@/components/MonogramCircle";
import { FONTS, PALETTE } from "@/lib/wedding";

export function ScreenHeader({
  eyebrow,
  title,
  fallbackHref,
  avatarSrc,
}: {
  eyebrow: string;
  title: string;
  /** Destino quando nao ha historico para voltar — link aberto direto, por exemplo. */
  fallbackHref: ComponentProps<typeof Link>["href"];
  avatarSrc?: string;
}) {
  const router = useRouter();

  return (
    <div
      className="sticky top-0 z-10 px-5 pb-3 texture-overlay"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 44px)",
        background: "rgba(249,245,238,0.95)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(196,135,12,0.15)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Link de verdade, e nao um botao: quem abriu a URL direto (link
              compartilhado, QR code) nao tem historico para voltar. */}
          <Link
            href={fallbackHref}
            aria-label="Voltar"
            onClick={(event) => {
              if (window.history.length <= 1) return;
              event.preventDefault();
              router.back();
            }}
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "1px solid rgba(196,135,12,0.25)",
              color: PALETTE.gold,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path
                d="M10 3L5 8l5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          {avatarSrc && (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                overflow: "hidden",
                border: `1.5px solid ${PALETTE.gold}`,
                background: "#FFF",
                flexShrink: 0,
              }}
            >
              {/** biome-ignore lint/performance/noImgElement: avatar SVG remoto */}
              <img
                src={avatarSrc}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}

          <div className="min-w-0">
            <p
              className="text-xs tracking-widest uppercase truncate"
              style={{ color: PALETTE.gold, fontFamily: FONTS.body }}
            >
              {eyebrow}
            </p>
            <h2
              className="text-xl truncate"
              style={{ fontFamily: FONTS.display, color: PALETTE.brown }}
            >
              {title}
            </h2>
          </div>
        </div>

        <MonogramCircle size={40} />
      </div>
    </div>
  );
}
