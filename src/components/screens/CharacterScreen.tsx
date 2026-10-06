"use client";

import { MonogramCircle } from "@/components/MonogramCircle";
import type { GuestRole } from "@/generated/prisma/enums";
import { CHARACTERS, FONTS, PALETTE } from "@/lib/wedding";

export function CharacterScreen({
  role,
  setRole,
  onContinue,
  onBack,
}: {
  role: GuestRole | null;
  setRole: (value: GuestRole) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div
      className="min-h-screen flex flex-col texture-overlay"
      style={{ background: PALETTE.cream }}
    >
      <div
        className="pt-14 pb-6 px-6 text-center animate-fade-in-up"
        style={{ position: "relative" }}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar"
          style={{
            position: "absolute",
            top: 16,
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
              d="M12 4 L6 10 L12 16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex justify-center mb-4">
          <MonogramCircle size={60} />
        </div>
        <p
          className="text-xs tracking-[0.2em] uppercase mb-2"
          style={{ color: PALETTE.gold, fontFamily: FONTS.body }}
        >
          Passo 2 de 3
        </p>
        <h2
          className="text-2xl"
          style={{ fontFamily: FONTS.display, color: PALETTE.brown }}
        >
          Quem é você
          <br />
          nesse dia especial?
        </h2>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div
            style={{
              width: 32,
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
              width: 32,
              height: 1,
              background: PALETTE.gold,
              opacity: 0.5,
            }}
          />
        </div>
      </div>

      <div className="flex-1 px-5 pb-6 grid grid-cols-2 gap-4 content-start">
        {CHARACTERS.map((character, index) => {
          const selected = role === character.role;
          return (
            <button
              key={character.role}
              type="button"
              aria-pressed={selected}
              onClick={() => setRole(character.role)}
              className="animate-fade-in-up flex flex-col items-center justify-center gap-2 py-6 px-3 transition-all duration-200"
              style={{
                animationDelay: `${index * 0.07}s`,
                background: selected ? "#FDF6E8" : "#FFFFFF",
                border: selected
                  ? `1.5px solid ${PALETTE.gold}`
                  : "1px solid rgba(196,135,12,0.2)",
                boxShadow: selected
                  ? "0 4px 20px rgba(196,135,12,0.18)"
                  : "0 2px 8px rgba(44,24,16,0.06)",
              }}
            >
              <span style={{ fontSize: "2.2rem", lineHeight: 1 }}>
                {character.emoji}
              </span>
              <span
                className="text-sm font-medium"
                style={{
                  fontFamily: FONTS.display,
                  color: selected ? PALETTE.gold : PALETTE.brown,
                }}
              >
                {character.label}
              </span>
              <span
                className="text-xs"
                style={{ color: PALETTE.mutedBrown, fontFamily: FONTS.body }}
              >
                {character.sublabel}
              </span>
              {selected && (
                <div
                  className="mt-1 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: PALETTE.gold }}
                >
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M1 4L3 6L7 2"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="px-5 pb-10">
        <button
          type="button"
          onClick={onContinue}
          disabled={!role}
          className="btn-gold w-full py-4 text-white text-sm tracking-[0.2em] uppercase disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontFamily: FONTS.body }}
        >
          Escolher avatar
        </button>
      </div>
    </div>
  );
}
