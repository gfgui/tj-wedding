"use client";

import Link from "next/link";
import type { RankingEntryDTO } from "@/lib/dto";
import { FONTS, MEDALS, PALETTE, PODIUM_COLORS } from "@/lib/wedding";

export function UserRankingCard({
  entry,
  rank,
}: {
  entry: RankingEntryDTO;
  rank: number;
}) {
  const onPodium = rank <= 3;
  const thumbnail = entry.avatarSrc ?? entry.thumbUrl;

  return (
    <Link
      href={`/convidado/${entry.guestId}`}
      className="animate-fade-in-up flex items-center gap-4"
      style={{
        background: PALETTE.polaroid,
        padding: "12px 14px",
        boxShadow:
          rank === 1
            ? "0 4px 20px rgba(196,135,12,0.2)"
            : "0 2px 8px rgba(44,24,16,0.07)",
        border:
          rank === 1
            ? "1px solid rgba(196,135,12,0.3)"
            : "1px solid rgba(196,135,12,0.1)",
        animationDelay: `${rank * 0.06}s`,
        textDecoration: "none",
      }}
    >
      <div
        className="flex-shrink-0 flex items-center justify-center font-bold"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: onPodium ? PODIUM_COLORS[rank - 1] : PALETTE.creamDark,
          color: onPodium ? "#FFFFFF" : PALETTE.mutedBrown,
          fontFamily: FONTS.display,
          fontSize: onPodium ? "1rem" : "0.8rem",
        }}
      >
        {onPodium ? MEDALS[rank - 1] : rank}
      </div>

      <div
        className="flex-shrink-0"
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          overflow: "hidden",
          border: "1.5px solid rgba(196,135,12,0.3)",
          background: "#fff",
        }}
      >
        {thumbnail && (
          // biome-ignore lint/performance/noImgElement: avatar remoto ou miniatura ja gerada
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="truncate"
          style={{
            fontFamily: FONTS.display,
            fontSize: "0.95rem",
            color: PALETTE.brown,
          }}
        >
          {entry.emoji} {entry.author}
        </p>
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: "0.65rem",
            color: PALETTE.mutedBrown,
          }}
        >
          {entry.count} {entry.count === 1 ? "foto enviada" : "fotos enviadas"}
        </p>
      </div>

      {/* O numero ja aparece na linha de cima; aqui vale mais a seta, que e o
          unico sinal de que o cartao leva para a galeria do convidado. */}
      <svg
        className="flex-shrink-0"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke={rank === 1 ? PALETTE.gold : PALETTE.mutedBrown}
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
