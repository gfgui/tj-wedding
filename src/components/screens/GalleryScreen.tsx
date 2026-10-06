"use client";

import { GridTile } from "@/components/gallery/GridTile";
import { UserRankingCard } from "@/components/gallery/UserRankingCard";
import { MonogramCircle } from "@/components/MonogramCircle";
import type { GuestDTO, PhotoDTO, RankingEntryDTO } from "@/lib/dto";
import { FONTS, PALETTE } from "@/lib/wedding";

export type GalleryTab = "all" | "mine" | "ranking";

const TABS: { key: GalleryTab; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "mine", label: "Minhas" },
  { key: "ranking", label: "🏆 Ranking" },
];

export function GalleryScreen({
  guest,
  photos,
  ranking,
  tab,
  setTab,
  loading,
  error,
  onAdd,
  onSelect,
}: {
  guest: GuestDTO;
  photos: PhotoDTO[];
  ranking: RankingEntryDTO[];
  tab: GalleryTab;
  setTab: (tab: GalleryTab) => void;
  loading: boolean;
  error: string | null;
  onAdd: () => void;
  onSelect: (index: number) => void;
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: PALETTE.cream }}
    >
      <div
        className="sticky top-0 z-10 px-5 pt-12 pb-0 texture-overlay"
        style={{
          background: "rgba(249,245,238,0.95)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(196,135,12,0.15)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {guest.avatarSrc && (
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
                  src={guest.avatarSrc}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}
            <div>
              <p
                className="text-xs tracking-widest uppercase"
                style={{ color: PALETTE.gold, fontFamily: FONTS.body }}
              >
                {guest.emoji} Olá, {guest.name}!
              </p>
              <h2
                className="text-xl"
                style={{ fontFamily: FONTS.display, color: PALETTE.brown }}
              >
                Galeria do Casamento
              </h2>
            </div>
          </div>
          <MonogramCircle size={40} />
        </div>

        <div
          className="flex"
          style={{ borderBottom: "1px solid rgba(196,135,12,0.2)" }}
        >
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              aria-pressed={tab === item.key}
              className="flex-1 py-2.5 text-xs tracking-wider uppercase relative"
              style={{
                fontFamily: FONTS.body,
                color: tab === item.key ? PALETTE.gold : PALETTE.mutedBrown,
                fontWeight: tab === item.key ? 600 : 400,
              }}
            >
              {item.label}
              {tab === item.key && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: PALETTE.gold }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="text-center py-3 text-xs"
          style={{ color: "#B3261E", fontFamily: FONTS.body }}
        >
          {error}
        </p>
      )}

      <div className="flex-1">
        {tab === "ranking" ? (
          <RankingTab ranking={ranking} />
        ) : (
          <PhotoGrid photos={photos} loading={loading} onSelect={onSelect} />
        )}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="fixed bottom-8 right-6 z-20 flex items-center gap-2 px-5 py-3.5"
        style={{
          background: `linear-gradient(135deg, ${PALETTE.gold} 0%, ${PALETTE.goldLight} 100%)`,
          boxShadow: "0 8px 32px rgba(196,135,12,0.4)",
          color: "#FFFFFF",
          fontFamily: FONTS.body,
          fontSize: "0.8rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M8 3v10M3 8h10" strokeLinecap="round" />
        </svg>
        Adicionar Foto
      </button>
    </div>
  );
}

function PhotoGrid({
  photos,
  loading,
  onSelect,
}: {
  photos: PhotoDTO[];
  loading: boolean;
  onSelect: (index: number) => void;
}) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <span style={{ fontSize: "3rem" }}>📷</span>
        <p
          className="mt-4 text-center"
          style={{ fontFamily: FONTS.display, color: PALETTE.mutedBrown }}
        >
          {loading ? (
            "Carregando as memórias..."
          ) : (
            <>
              Nenhuma foto ainda.
              <br />
              Seja o primeiro!
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "12px 12px 100px" }}>
      <div style={{ columns: 3, columnGap: 10 }}>
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="animate-fade-in-up"
            style={{
              breakInside: "avoid",
              marginBottom: 10,
              // So as primeiras recebem atraso: com 200 fotos a cascata
              // deixaria as ultimas invisiveis por dezenas de segundos.
              animationDelay: index < 12 ? `${index * 0.05}s` : "0s",
            }}
          >
            <GridTile photo={photo} onOpen={() => onSelect(index)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function RankingTab({ ranking }: { ranking: RankingEntryDTO[] }) {
  return (
    <div className="px-4 py-5 flex flex-col gap-3">
      {ranking.length >= 3 && <Podium ranking={ranking} />}

      <div className="flex items-center gap-3 mb-1">
        <div
          style={{ flex: 1, height: 1, background: PALETTE.gold, opacity: 0.3 }}
        />
        <span
          style={{
            fontFamily: FONTS.display,
            fontSize: "0.72rem",
            color: PALETTE.gold,
            letterSpacing: "0.12em",
          }}
        >
          QUEM MAIS FOTOGRAFOU
        </span>
        <div
          style={{ flex: 1, height: 1, background: PALETTE.gold, opacity: 0.3 }}
        />
      </div>

      {ranking.length === 0 ? (
        <div className="flex flex-col items-center py-16 animate-fade-in">
          <span style={{ fontSize: "2.5rem" }}>📷</span>
          <p
            className="mt-3 text-center"
            style={{ fontFamily: FONTS.display, color: PALETTE.mutedBrown }}
          >
            Nenhuma foto ainda.
            <br />
            Seja o primeiro!
          </p>
        </div>
      ) : (
        ranking.map((entry, index) => (
          <UserRankingCard key={entry.guestId} entry={entry} rank={index + 1} />
        ))
      )}
      <div className="h-24" />
    </div>
  );
}

function Podium({ ranking }: { ranking: RankingEntryDTO[] }) {
  const places = [
    {
      entry: ranking[1],
      size: 60,
      medal: "🥈",
      color: PALETTE.silver,
      offset: 0,
    },
    {
      entry: ranking[0],
      size: 80,
      medal: "🥇",
      color: PALETTE.gold,
      offset: 12,
    },
    {
      entry: ranking[2],
      size: 52,
      medal: "🥉",
      color: PALETTE.bronze,
      offset: 0,
    },
  ];

  return (
    <div className="flex items-end justify-center gap-4 mb-5 animate-fade-in">
      {places.map((place) => (
        <div
          key={place.entry.guestId}
          className="flex flex-col items-center gap-1"
          style={{ marginBottom: place.offset }}
        >
          <div
            style={{
              width: place.size,
              height: place.size,
              overflow: "hidden",
              border: `${place.medal === "🥇" ? 2.5 : 2}px solid ${place.color}`,
              borderRadius: "50%",
              boxShadow:
                place.medal === "🥇"
                  ? "0 4px 16px rgba(196,135,12,0.35)"
                  : undefined,
              background: "#fff",
            }}
          >
            {(place.entry.avatarSrc ?? place.entry.thumbUrl) && (
              // biome-ignore lint/performance/noImgElement: avatar remoto ou miniatura ja gerada
              <img
                src={place.entry.avatarSrc ?? place.entry.thumbUrl}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>
          <span
            style={{ fontSize: place.medal === "🥇" ? "1.7rem" : "1.2rem" }}
          >
            {place.medal}
          </span>
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: "0.6rem",
              color: PALETTE.mutedBrown,
              textAlign: "center",
            }}
          >
            {place.entry.author}
          </p>
          <p
            style={{
              fontFamily: FONTS.display,
              fontSize: "0.72rem",
              color: place.color,
              fontWeight: 700,
            }}
          >
            {place.entry.count} 📷
          </p>
        </div>
      ))}
    </div>
  );
}
