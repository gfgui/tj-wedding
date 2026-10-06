"use client";

import { GridTile } from "@/components/gallery/GridTile";
import { PhotoGridSkeleton } from "@/components/gallery/Skeletons";
import type { PhotoDTO } from "@/lib/dto";
import { FONTS, PALETTE } from "@/lib/wedding";

export function PhotoGrid({
  photos,
  onSelect,
  loading = false,
  ranked = false,
  emptyTitle,
}: {
  photos: PhotoDTO[];
  onSelect: (index: number) => void;
  loading?: boolean;
  /** Numera os tiles por posicao — usado nas listas ordenadas por curtidas. */
  ranked?: boolean;
  emptyTitle?: string;
}) {
  // A espera vem antes do vazio: so da para afirmar que nao ha foto nenhuma
  // depois que a resposta chegou.
  if (loading && photos.length === 0)
    return <PhotoGridSkeleton ranked={ranked} />;

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <span style={{ fontSize: "3rem" }}>📷</span>
        <p
          className="mt-4 text-center px-8"
          style={{ fontFamily: FONTS.display, color: PALETTE.mutedBrown }}
        >
          {emptyTitle ?? (
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
      {/* O mosaico em `columns` flui de cima para baixo, coluna a coluna: lido
          em linha, um ranking apareceria como 1, 3, 5, 2, 4. Onde a ordem e o
          conteudo, uma grade de duas colunas le na sequencia certa — e sobra
          espaco para o nome do autor sem reticencias. */}
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
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="animate-fade-in-up"
            style={{
              breakInside: "avoid",
              marginBottom: ranked ? 0 : 10,
              // So as primeiras recebem atraso: com 200 fotos a cascata
              // deixaria as ultimas invisiveis por dezenas de segundos.
              animationDelay: index < 12 ? `${index * 0.05}s` : "0s",
            }}
          >
            <GridTile
              photo={photo}
              rank={ranked ? index + 1 : undefined}
              onOpen={() => onSelect(index)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
