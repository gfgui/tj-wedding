import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { UserRankingCard } from "@/components/gallery/UserRankingCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FULL_RANKING_LIMIT, topGuests } from "@/lib/ranking";
import { currentGuest } from "@/lib/session";
import { FONTS, PALETTE } from "@/lib/wedding";

// Le o cookie de sessao, entao nunca pode ser servida do cache estatico.
export const dynamic = "force-dynamic";

export default async function TopGuestsPage() {
  const viewer = await currentGuest();
  if (!viewer) redirect("/");

  const ranking = await topGuests(FULL_RANKING_LIMIT);

  return (
    <AppShell>
      <ScreenHeader
        eyebrow={`🏆 Ranking · ${ranking.length} ${ranking.length === 1 ? "convidado" : "convidados"}`}
        title="Quem mais fotografou"
        fallbackHref="/?tab=ranking"
      />

      <div className="px-4 py-5 flex flex-col gap-3">
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
            <UserRankingCard
              key={entry.guestId}
              entry={entry}
              rank={index + 1}
            />
          ))
        )}
        <div className="h-16" />
      </div>
    </AppShell>
  );
}
