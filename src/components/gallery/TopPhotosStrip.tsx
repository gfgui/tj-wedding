"use client";

import type { PhotoDTO } from "@/lib/dto";
import { FONTS, PALETTE, PODIUM_COLORS } from "@/lib/wedding";

/**
 * As fotos mais curtidas numa faixa que desliza com o dedo.
 *
 * Horizontal de proposito: o podio de convidados vem logo abaixo, e uma lista
 * vertical aqui empurraria o ranking de pessoas para fora da tela.
 */
export function TopPhotosStrip({
  photos,
  onSelect,
}: {
  photos: PhotoDTO[];
  onSelect: (index: number) => void;
}) {
  if (photos.length === 0) {
    return (
      <p
        className="text-center py-6"
        style={{
          fontFamily: FONTS.body,
          fontSize: "0.78rem",
          color: PALETTE.mutedBrown,
        }}
      >
        Ainda não há curtidas.
        <br />
        Toque duas vezes numa foto para curtir.
      </p>
    );
  }

  return (
    <div
      className="swipe-track"
      style={{
        gap: 12,
        // A sombra dos polaroides precisa de folga para nao ser cortada.
        padding: "6px 4px 10px",
        margin: "0 -4px",
      }}
    >
      {photos.map((photo, index) => {
        const rank = index + 1;
        const onPodium = rank <= 3;

        return (
          <button
            key={photo.id}
            type="button"
            onClick={() => onSelect(index)}
            style={{
              flex: "0 0 auto",
              scrollSnapAlign: "center",
              width: 124,
              background: PALETTE.polaroid,
              padding: "6px 6px 8px",
              boxShadow: onPodium
                ? "0 3px 14px rgba(196,135,12,0.22)"
                : "0 2px 8px rgba(44,24,16,0.1)",
              border: onPodium
                ? `1px solid ${PODIUM_COLORS[rank - 1]}`
                : "1px solid rgba(196,135,12,0.12)",
              position: "relative",
              textAlign: "left",
            }}
          >
            {/** biome-ignore lint/performance/noImgElement: miniatura ja gerada no servidor */}
            <img
              src={photo.thumbUrl}
              alt={photo.caption || `Foto de ${photo.author}`}
              loading="lazy"
              draggable={false}
              style={{
                width: "100%",
                aspectRatio: "1",
                objectFit: "cover",
                display: "block",
              }}
            />

            <span
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                minWidth: 20,
                height: 20,
                paddingInline: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                background: onPodium
                  ? PODIUM_COLORS[rank - 1]
                  : "rgba(44,24,16,0.72)",
                color: "#FFFFFF",
                fontFamily: FONTS.display,
                fontSize: "0.62rem",
                fontWeight: 700,
                boxShadow: "0 1px 4px rgba(44,24,16,0.35)",
              }}
            >
              {/* Numero, e nao medalha: num disco de 20px os tres emojis viram
                  a mesma mancha dourada. A cor ja diz quem esta no podio. */}
              {rank}
            </span>

            <div
              style={{
                marginTop: 5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 4,
              }}
            >
              <span
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
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexShrink: 0,
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 14 14"
                  fill={PALETTE.gold}
                  aria-hidden="true"
                >
                  <path d="M7 12.5S1 8.5 1 4.5A3 3 0 0 1 7 3.27 3 3 0 0 1 13 4.5c0 4-6 8-6 8Z" />
                </svg>
                <span
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    color: PALETTE.gold,
                  }}
                >
                  {photo.likes}
                </span>
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
