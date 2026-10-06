"use client";

import { MonogramCircle } from "@/components/MonogramCircle";
import { FONTS, PALETTE, WEDDING } from "@/lib/wedding";

export function WelcomeScreen({
  name,
  setName,
  onContinue,
}: {
  name: string;
  setName: (value: string) => void;
  onContinue: () => void;
}) {
  const canContinue = name.trim().length >= 2;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8 texture-overlay"
      style={{ background: PALETTE.cream }}
    >
      <div
        className="w-px h-16 mb-8 animate-fade-in"
        style={{
          background: `linear-gradient(to bottom, transparent, ${PALETTE.gold})`,
        }}
      />

      <div className="animate-fade-in-up flex flex-col items-center">
        <MonogramCircle size={148} />
      </div>

      <div className="animate-fade-in-up delay-100 mt-6 text-center">
        <p
          className="text-xs tracking-[0.25em] uppercase mb-2"
          style={{ color: PALETTE.gold, fontFamily: FONTS.body }}
        >
          Bem-vindo ao casamento de
        </p>
        <h1
          className="text-4xl leading-tight"
          style={{ fontFamily: FONTS.display, color: PALETTE.brown }}
        >
          {WEDDING.bride} <em style={{ color: PALETTE.gold }}>&</em>{" "}
          {WEDDING.groom}
        </h1>
        <p
          className="text-sm mt-2"
          style={{ color: PALETTE.mutedBrown, fontFamily: FONTS.body }}
        >
          {WEDDING.date}
        </p>
      </div>

      <div className="animate-fade-in-up delay-200 my-8 flex items-center gap-3">
        <div
          style={{
            width: 48,
            height: 1,
            background: PALETTE.gold,
            opacity: 0.5,
          }}
        />
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M8 1 L9.5 6.5 L15 8 L9.5 9.5 L8 15 L6.5 9.5 L1 8 L6.5 6.5 Z"
            fill={PALETTE.gold}
            opacity="0.7"
          />
        </svg>
        <div
          style={{
            width: 48,
            height: 1,
            background: PALETTE.gold,
            opacity: 0.5,
          }}
        />
      </div>

      <div className="animate-fade-in-up delay-300 w-full max-w-xs">
        <label
          htmlFor="nome-convidado"
          className="block text-xs tracking-widest uppercase mb-4 text-center"
          style={{ color: PALETTE.mutedBrown, fontFamily: FONTS.body }}
        >
          Como você se chama?
        </label>
        <input
          id="nome-convidado"
          type="text"
          value={name}
          maxLength={60}
          autoComplete="name"
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && canContinue) onContinue();
          }}
          placeholder="Seu nome aqui..."
          className="input-elegant w-full text-center pb-3"
          style={{
            fontFamily: FONTS.display,
            color: PALETTE.brown,
            fontSize: "1.25rem",
          }}
        />
      </div>

      <div className="animate-fade-in-up delay-400 mt-10 w-full max-w-xs">
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className="btn-gold w-full py-4 text-white text-sm uppercase disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontFamily: FONTS.body, letterSpacing: "0.2em" }}
        >
          Continuar
        </button>
      </div>

      <div className="animate-fade-in-up delay-500 mt-8 text-center">
        <p
          style={{
            color: PALETTE.gold,
            fontFamily: FONTS.script,
            fontSize: "1rem",
          }}
        >
          &ldquo;{WEDDING.quote}&rdquo;
        </p>
      </div>

      <div
        className="w-px h-16 mt-10"
        style={{
          background: `linear-gradient(to top, transparent, ${PALETTE.gold})`,
          opacity: 0.4,
        }}
      />
    </div>
  );
}
