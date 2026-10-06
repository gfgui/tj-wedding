"use client";

import { MonogramCircle } from "@/components/MonogramCircle";
import { AVATARS, FONTS, PALETTE } from "@/lib/wedding";

export function AvatarScreen({
  avatarId,
  setAvatarId,
  onContinue,
  onBack,
  saving,
  error,
}: {
  avatarId: string | null;
  setAvatarId: (value: string) => void;
  onContinue: () => void;
  onBack: () => void;
  saving: boolean;
  error: string | null;
}) {
  const selectedAvatar = AVATARS.find((avatar) => avatar.id === avatarId);

  return (
    <div
      className="min-h-screen flex flex-col texture-overlay"
      style={{ background: PALETTE.cream }}
    >
      <div
        className="pt-14 pb-4 px-6 text-center animate-fade-in-up"
        style={{ position: "relative" }}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar"
          style={{
            position: "absolute",
            top: 14,
            left: 16,
            color: PALETTE.gold,
            padding: 8,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path
              d="M12 4L6 10l6 6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex justify-center mb-3">
          <MonogramCircle size={52} />
        </div>
        <p
          className="text-xs tracking-[0.2em] uppercase mb-1"
          style={{ color: PALETTE.gold, fontFamily: FONTS.body }}
        >
          Passo 3 de 3
        </p>
        <h2
          className="text-2xl"
          style={{ fontFamily: FONTS.display, color: PALETTE.brown }}
        >
          Escolha seu avatar
        </h2>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div
            style={{
              width: 28,
              height: 1,
              background: PALETTE.gold,
              opacity: 0.5,
            }}
          />
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: PALETTE.gold,
              opacity: 0.7,
            }}
          />
          <div
            style={{
              width: 28,
              height: 1,
              background: PALETTE.gold,
              opacity: 0.5,
            }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
          }}
        >
          {AVATARS.map((avatar, index) => {
            const selected = avatarId === avatar.id;
            return (
              <button
                key={avatar.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setAvatarId(avatar.id)}
                className="animate-fade-in-up flex flex-col items-center gap-1"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: selected
                      ? `2.5px solid ${PALETTE.gold}`
                      : "2px solid rgba(196,135,12,0.15)",
                    boxShadow: selected
                      ? "0 0 0 3px rgba(196,135,12,0.2)"
                      : "none",
                    background: "#FFFFFF",
                    transition: "all 0.18s",
                  }}
                >
                  {/* SVG remoto do DiceBear: o otimizador do next/image nao traz
                      ganho aqui e exigiria liberar o dominio. */}
                  {/** biome-ignore lint/performance/noImgElement: avatar SVG remoto, sem ganho no otimizador */}
                  <img
                    src={avatar.src}
                    alt={avatar.label}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: "0.6rem",
                    color: selected ? PALETTE.gold : PALETTE.mutedBrown,
                    fontWeight: selected ? 600 : 400,
                  }}
                >
                  {avatar.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="px-5 pb-10 pt-3"
        style={{ borderTop: "1px solid rgba(196,135,12,0.12)" }}
      >
        {selectedAvatar && (
          <div className="flex items-center justify-center gap-3 mb-4 animate-scale-in">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                overflow: "hidden",
                border: `2px solid ${PALETTE.gold}`,
                background: "#FFF",
              }}
            >
              {/** biome-ignore lint/performance/noImgElement: avatar SVG remoto, sem ganho no otimizador */}
              <img
                src={selectedAvatar.src}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <p
              style={{
                fontFamily: FONTS.display,
                fontSize: "0.9rem",
                color: PALETTE.brown,
              }}
            >
              {selectedAvatar.label} escolhido!
            </p>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="text-center mb-3 text-xs"
            style={{ color: "#B3261E", fontFamily: FONTS.body }}
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={onContinue}
          disabled={!avatarId || saving}
          className="btn-gold w-full py-4 text-white text-sm tracking-[0.2em] uppercase disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontFamily: FONTS.body }}
        >
          {saving ? "Entrando..." : "Ver a Galeria"}
        </button>
      </div>
    </div>
  );
}
