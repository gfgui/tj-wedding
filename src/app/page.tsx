import { WeddingApp } from "@/components/WeddingApp";
import { toGuestDTO } from "@/lib/mappers";
import { currentGuest } from "@/lib/session";

// Le o cookie de sessao, entao nunca pode ser servida do cache estatico.
export const dynamic = "force-dynamic";

export default async function Home() {
  const guest = await currentGuest();
  return <WeddingApp initialGuest={guest ? toGuestDTO(guest) : null} />;
}
