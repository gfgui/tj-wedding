"use client";

import type { RankingEntryDTO } from "@/lib/dto";
import { FONTS, PALETTE } from "@/lib/wedding";

const MEDALS = ["🥇", "🥈", "🥉"];
const PODIUM_COLORS = [PALETTE.gold, PALETTE.silver, PALETTE.bronze];

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
    <div
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

      <div
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: rank === 1 ? "rgba(196,135,12,0.1)" : PALETTE.cream,
          border:
            rank === 1
              ? "1px solid rgba(196,135,12,0.3)"
              : "1px solid rgba(196,135,12,0.15)",
        }}
      >
        <span
          style={{
            fontFamily: FONTS.display,
            fontWeight: 700,
            fontSize: "0.9rem",
            color: rank === 1 ? PALETTE.gold : PALETTE.mutedBrown,
          }}
        >
          {entry.count}
        </span>
      </div>
    </div>
  );
}
