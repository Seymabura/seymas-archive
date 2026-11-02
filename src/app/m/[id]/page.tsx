import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MemeDetail } from "@/components/MemeDetail";
import { PrevIcon } from "@/components/Icons";
import { SITE_NAME } from "@/lib/config";
import { fetchMeme, mediaUrl } from "@/lib/memes";
import { archiveNo, isVideo } from "@/lib/text";

export const revalidate = 300;

type Props = { params: Promise<{ id: string }> };

// X'te paylaşınca görselin büyük kart olarak görünmesi için meta etiketleri.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const m = await fetchMeme(id);
  if (!m) return { title: "Caps bulunamadı" };
  const desc = [archiveNo(m.no), m.tags.map((t) => `#${t}`).join(" "), m.caption].filter(Boolean).join(" · ").slice(0, 200);
  const img = isVideo(m.media_type) ? undefined : [{ url: mediaUrl(m.storage_path), width: m.width ?? undefined, height: m.height ?? undefined, alt: m.title }];
  return {
    title: m.title,
    description: desc || `${SITE_NAME} arşivinden bir caps.`,
    alternates: { canonical: `/m/${m.id}` },
    openGraph: { title: m.title, description: desc, images: img, type: "article" },
    twitter: { card: img ? "summary_large_image" : "summary", title: m.title, description: desc, images: img?.map((i) => i.url) },
  };
}

export default async function MemePage({ params }: Props) {
  const { id } = await params;
  const meme = await fetchMeme(id);
  if (!meme) notFound();
  return (
    <main className="container">
      <div style={{ paddingTop: 28 }}>
        <Link href="/" className="btn btn-sm"><PrevIcon size={16} /> Tüm arşiv</Link>
      </div>
      <MemeDetail meme={meme} asPage />
    </main>
  );
}
