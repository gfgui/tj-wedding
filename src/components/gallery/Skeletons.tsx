import { PALETTE } from "@/lib/wedding";

/**
 * Esqueletos de carregamento.
 *
 * Cada um imita o formato do conteudo que esta chegando. O objetivo nao e
 * enfeitar a espera: e nao ocupar esse momento com o estado vazio, que afirma
 * "nenhuma foto ainda" antes de o app ter como saber disso.
 */

/** Alturas variadas: o mosaico real tem polaroides de tamanhos diferentes. */
const MASONRY_SLOTS = [120, 160, 96, 140, 104, 170, 128, 150, 112].map(
  (height, i) => ({ key: `mosaico-${i}`, height }),
);

/** Na lista ordenada os tiles ficam numa grade regular de duas colunas. */
const RANKED_SLOTS = Array.from({ length: 6 }, (_, i) => ({
  key: `ranking-${i}`,
  height: 150,
}));

const STRIP_SLOTS = Array.from({ length: 3 }, (_, i) => `faixa-${i}`);

export function PhotoGridSkeleton({ ranked = false }: { ranked?: boolean }) {
  const slots = ranked ? RANKED_SLOTS : MASONRY_SLOTS;

  return (
    <div style={{ padding: "12px 12px 100px" }} aria-hidden="true">
      <div
        style={
          ranked
            ? {
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
                alignItems: "start",
              }
            : { columns: 3, columnGap: 10 }
        }
      >
        {slots.map((slot) => (
          <div
            key={slot.key}
            style={{
              breakInside: "avoid",
              marginBottom: ranked ? 0 : 10,
              background: PALETTE.polaroid,
              padding: ranked ? "6px 6px 8px" : "5px 5px 20px",
              boxShadow: "0 2px 8px rgba(44,24,16,0.08)",
            }}
          >
            <div
              className="skeleton"
              style={{ width: "100%", height: slot.height }}
            />
            <div
              className="skeleton"
              style={{ height: 7, marginTop: 7, width: "72%" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopPhotosStripSkeleton() {
  return (
    <div
      className="swipe-track"
      style={{ gap: 12, padding: "6px 4px 10px", margin: "0 -4px" }}
      aria-hidden="true"
    >
      {STRIP_SLOTS.map((key) => (
        <div
          key={key}
          style={{
            flex: "0 0 auto",
            width: 124,
            background: PALETTE.polaroid,
            padding: "6px 6px 8px",
            boxShadow: "0 2px 8px rgba(44,24,16,0.1)",
            border: "1px solid rgba(196,135,12,0.12)",
          }}
        >
          <div
            className="skeleton"
            style={{ width: "100%", aspectRatio: "1" }}
          />
          <div
            className="skeleton"
            style={{ height: 7, marginTop: 6, width: "80%" }}
          />
        </div>
      ))}
    </div>
  );
}

export function RankingListSkeleton({ rows = 5 }: { rows?: number }) {
  const slots = Array.from({ length: rows }, (_, i) => `cartao-${i}`);

  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      {slots.map((key) => (
        <div
          key={key}
          className="flex items-center gap-4"
          style={{
            background: PALETTE.polaroid,
            padding: "12px 14px",
            boxShadow: "0 2px 8px rgba(44,24,16,0.07)",
            border: "1px solid rgba(196,135,12,0.1)",
          }}
        >
          <div
            className="skeleton flex-shrink-0"
            style={{ width: 32, height: 32, borderRadius: "50%" }}
          />
          <div
            className="skeleton flex-shrink-0"
            style={{ width: 44, height: 44, borderRadius: "50%" }}
          />
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div className="skeleton" style={{ height: 11, width: "58%" }} />
            <div className="skeleton" style={{ height: 8, width: "38%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Cabecalho das paginas proprias, enquanto o servidor monta a resposta. */
export function ScreenHeaderSkeleton() {
  return (
    <div
      className="sticky top-0 z-10 px-5 pb-3 texture-overlay"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 44px)",
        background: "rgba(249,245,238,0.95)",
        borderBottom: "1px solid rgba(196,135,12,0.15)",
      }}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <div
          className="flex-shrink-0"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: "1px solid rgba(196,135,12,0.25)",
          }}
        />
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="skeleton" style={{ height: 8, width: "42%" }} />
          <div className="skeleton" style={{ height: 14, width: "64%" }} />
        </div>
      </div>
    </div>
  );
}
