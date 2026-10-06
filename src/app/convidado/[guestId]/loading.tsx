import { AppShell } from "@/components/AppShell";
import {
  PhotoGridSkeleton,
  ScreenHeaderSkeleton,
} from "@/components/gallery/Skeletons";

export default function Loading() {
  return (
    <AppShell>
      <ScreenHeaderSkeleton />
      <PhotoGridSkeleton />
    </AppShell>
  );
}
