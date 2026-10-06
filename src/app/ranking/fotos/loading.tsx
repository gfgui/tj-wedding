import { AppShell } from "@/components/AppShell";
import {
  PhotoGridSkeleton,
  ScreenHeaderSkeleton,
} from "@/components/gallery/Skeletons";

// Estas paginas sao montadas no servidor. Na rede de um salao cheio, tocar em
// "ver ranking completo" ficaria sem resposta nenhuma ate a resposta chegar.
export default function Loading() {
  return (
    <AppShell>
      <ScreenHeaderSkeleton />
      <PhotoGridSkeleton ranked />
    </AppShell>
  );
}
