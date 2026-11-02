import { Gallery } from "@/components/Gallery";
import { SetupNotice } from "@/components/SetupNotice";
import { isConfigured } from "@/lib/config";
import { fetchMemes } from "@/lib/memes";

// Sayfa en geç 60 saniyede bir yenilenir; yönetim panelinden ekleme yapınca anında yenilenir.
export const revalidate = 60;

export default async function Home() {
  if (!isConfigured) return <SetupNotice />;
  const { memes, error } = await fetchMemes();
  if (error) return <SetupNotice error={error} />;
  return <Gallery memes={memes} />;
}
