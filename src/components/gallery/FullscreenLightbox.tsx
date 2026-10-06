"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PhotoDTO } from "@/lib/dto";
import { FONTS, PALETTE } from "@/lib/wedding";

export function FullscreenLightbox({
  photos,
  initialIndex,
  onLike,
  onClose,
}: {
  photos: PhotoDTO[];
  initialIndex: number;
  onLike: (photoId: string) => void;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [burst, setBurst] = useState(false);
  const lastTap = useRef(0);
  const touchStartX = useRef(0);

  // A lista e recarregada a cada 10s; se a foto aberta sumir (moderada, por
  // exemplo) o indice precisa recuar em vez de estourar.
  const safeIndex = Math.min(index, photos.length - 1);
  const photo = photos[safeIndex];

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const next = useCallback(
    () => setIndex((i) => Math.min(photos.length - 1, i + 1)),
    [photos.length],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  const triggerBurst = useCallback(() => {
    setBurst(true);
    const timer = setTimeout(() => setBurst(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const handleDoubleTap = useCallback(() => {
    if (!photo) return;
    if (!photo.likedByMe) onLike(photo.id);
    triggerBurst();
  }, [photo, onLike, triggerBurst]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) handleDoubleTap();
    else lastTap.current = now;
  }, [handleDoubleTap]);

  if (!photo) return null;

  const liked = photo.likedByMe;

  return (
    <div
      className="animate-fade-in"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(20,12,8,0.96)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "52px 20px 12px",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          style={{
            color: "rgba(249,245,238,0.7)",
            background: "none",
            border: "none",
            padding: 4,
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M1 1l20 20M21 1L1 21" strokeLinecap="round" />
          </svg>
        </button>

        <span
          style={{
            fontFamily: FONTS.body,
            fontSize: "0.7rem",
            color: "rgba(249,245,238,0.4)",
            letterSpacing: "0.1em",
          }}
        >
          {safeIndex + 1} / {photos.length}
        </span>

        <button
          type="button"
          onClick={() => onLike(photo.id)}
          aria-label={liked ? "Remover curtida" : "Curtir"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "none",
            border: "none",
            padding: 4,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 14 14"
            fill={liked ? PALETTE.gold : "none"}
            stroke={liked ? PALETTE.gold : "rgba(249,245,238,0.6)"}
            strokeWidth="1.4"
            style={{
              transition: "transform 0.15s",
              transform: liked ? "scale(1.2)" : "scale(1)",
            }}
            aria-hidden="true"
          >
            <path d="M7 12.5S1 8.5 1 4.5A3 3 0 0 1 7 3.27 3 3 0 0 1 13 4.5c0 4-6 8-6 8Z" />
          </svg>
          <span
            style={{
              fontFamily: FONTS.body,
              fontSize: "0.72rem",
              color: liked ? PALETTE.gold : "rgba(249,245,238,0.5)",
            }}
          >
            {photo.likes}
          </span>
        </button>
      </div>

      {/* biome-ignore lint/a11y/noStaticElementInteractions: area de gesto (toque duplo e swipe); as acoes equivalentes estao nos botoes acima */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: teclado tratado no listener global de setas/Escape */}
      <div
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          const dx = event.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(dx) > 50) {
            if (dx < 0) next();
            else prev();
          }
        }}
        onClick={handleTap}
        onDoubleClick={handleDoubleTap}
      >
        <div
          className="animate-scale-in"
          style={{
            background: PALETTE.polaroid,
            padding: "10px 10px 48px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            maxWidth: "90vw",
            width: "100%",
          }}
        >
          {/** biome-ignore lint/performance/noImgElement: versao de exibicao ja redimensionada no servidor */}
          <img
            src={photo.url}
            alt={photo.caption || `Foto de ${photo.author}`}
            draggable={false}
            width={photo.width}
            height={photo.height}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              maxHeight: "60vh",
              objectFit: "contain",
            }}
          />
          <div style={{ marginTop: 8, textAlign: "center" }}>
            <p
              style={{
                fontFamily: FONTS.script,
                fontSize: "1.1rem",
                color: PALETTE.brown,
              }}
            >
              {photo.caption}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                marginTop: 4,
              }}
            >
              {photo.avatarSrc && (
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "1.5px solid rgba(196,135,12,0.4)",
                    background: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {/** biome-ignore lint/performance/noImgElement: avatar SVG remoto */}
                  <img
                    src={photo.avatarSrc}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
              <p
                style={{
                  fontFamily: FONTS.body,
                  fontSize: "0.65rem",
                  color: PALETTE.mutedBrown,
                }}
              >
                {photo.emoji} {photo.author}
              </p>
            </div>
          </div>
        </div>

        {burst && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 14 14"
              fill={PALETTE.gold}
              style={{
                animation: "heartBurst 0.65s ease forwards",
                filter: "drop-shadow(0 4px 12px rgba(196,135,12,0.7))",
              }}
              aria-hidden="true"
            >
              <path d="M7 12.5S1 8.5 1 4.5A3 3 0 0 1 7 3.27 3 3 0 0 1 13 4.5c0 4-6 8-6 8Z" />
            </svg>
          </div>
        )}

        {safeIndex > 0 && (
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={(event) => {
              event.stopPropagation();
              prev();
            }}
            style={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(249,245,238,0.1)",
              border: "1px solid rgba(249,245,238,0.15)",
              color: "rgba(249,245,238,0.7)",
              padding: "10px 8px",
              borderRadius: 2,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path
                d="M10 3L5 8l5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {safeIndex < photos.length - 1 && (
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={(event) => {
              event.stopPropagation();
              next();
            }}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(249,245,238,0.1)",
              border: "1px solid rgba(249,245,238,0.15)",
              color: "rgba(249,245,238,0.7)",
              padding: "10px 8px",
              borderRadius: 2,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path
                d="M6 3l5 5-5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          padding: "16px 0 40px",
        }}
      >
        {photos.slice(0, 40).map((item, i) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Ir para a foto ${i + 1}`}
            onClick={() => setIndex(i)}
            style={{
              width: i === safeIndex ? 18 : 6,
              height: 6,
              borderRadius: 3,
              background:
                i === safeIndex ? PALETTE.gold : "rgba(249,245,238,0.25)",
              border: "none",
              padding: 0,
              transition: "all 0.2s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
