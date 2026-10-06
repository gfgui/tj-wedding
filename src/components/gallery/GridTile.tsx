"use client";

import type { PhotoDTO } from "@/lib/dto";
import { FONTS, PALETTE } from "@/lib/wedding";

export function GridTile({
  photo,
  onOpen,
}: {
  photo: PhotoDTO;
  onOpen: () => void;
}) {
  const liked = photo.likedByMe;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="polaroid-card"
      style={{
        background: PALETTE.polaroid,
        padding: "5px 5px 20px",
        boxShadow: "0 2px 8px rgba(44,24,16,0.1)",
        transform: `rotate(${photo.rotation * 0.55}deg)`,
        position: "relative",
        width: "100%",
        textAlign: "left",
        display: "block",
      }}
    >
      {/** biome-ignore lint/performance/noImgElement: miniatura ja gerada no servidor */}
      <img
        src={photo.thumbUrl}
        alt={photo.caption || `Foto de ${photo.author}`}
        draggable={false}
        loading="lazy"
        // Reserva o espaco certo antes do download: sem isso o grid em colunas
        // salta a cada imagem que carrega.
        width={photo.width}
        height={photo.height}
        style={{ width: "100%", height: "auto", display: "block" }}
      />

      <div
        style={{
          marginTop: 4,
          paddingInline: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            minWidth: 0,
            flex: 1,
          }}
        >
          {photo.avatarSrc && (
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                overflow: "hidden",
                flexShrink: 0,
                border: "1px solid rgba(196,135,12,0.3)",
                background: "#fff",
              }}
            >
              {/** biome-ignore lint/performance/noImgElement: avatar SVG remoto */}
              <img
                src={photo.avatarSrc}
                alt=""
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: "0.55rem",
              color: PALETTE.mutedBrown,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {photo.emoji} {photo.author}
          </p>
        </div>

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexShrink: 0,
          }}
        >
          <svg
            width="9"
            height="9"
            viewBox="0 0 14 14"
            fill={liked ? PALETTE.gold : "none"}
            stroke={liked ? PALETTE.gold : "#B0927A"}
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M7 12.5S1 8.5 1 4.5A3 3 0 0 1 7 3.27 3 3 0 0 1 13 4.5c0 4-6 8-6 8Z" />
          </svg>
          <span
            style={{
              fontFamily: FONTS.body,
              fontSize: "0.5rem",
              color: liked ? PALETTE.gold : "#B0927A",
            }}
          >
            {photo.likes}
          </span>
        </span>
      </div>
    </button>
  );
}
