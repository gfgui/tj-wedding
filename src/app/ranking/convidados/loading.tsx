import { AppShell } from "@/components/AppShell";
import {
  RankingListSkeleton,
  ScreenHeaderSkeleton,
} from "@/components/gallery/Skeletons";

export default function Loading() {
  return (
    <AppShell>
      <ScreenHeaderSkeleton />
      <div className="px-4 py-5">
        <RankingListSkeleton rows={7} />
      </div>
    </AppShell>
  );
}
