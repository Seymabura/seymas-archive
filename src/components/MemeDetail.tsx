"use client";
import { useEffect, useState } from "react";
import { SITE_NAME, SITE_URL, X_HANDLE } from "@/lib/config";
import { downloadUrl } from "@/lib/media";
import { archiveNo, formatDate, formatSize } from "@/lib/text";
import type { Meme } from "@/lib/types";
import { DownloadIcon, LinkIcon, XLogo } from "./Icons";
import { MemeMedia } from "./MemeMedia";
import { useToast } from "./useToast";

type Props = {
  meme: Meme;
  asPage?: boolean;
  onTag?: (tag: string) => void;
  children?: React.ReactNode; // lightbox kapatma/gezinme düğmeleri buraya gelir
};

export function MemeDetail({ meme, asPage, onTag, children }: Props) {
  const toast = useToast();
  // Yayındaki gerçek adresi kullan (yerelde localhost, Vercel'de site adresi).
  const [origin, setOrigin] = useState(SITE_URL);
  useEffect(() => setOrigin(window.location.origin), []);
  const link = `${origin}/m/${meme.id}`;
  const tweet =
    `https://x.com/intent/tweet?text=${encodeURIComponent(`${meme.title} — ${SITE_NAME}`)}` +
    `&url=${encodeURIComponent(link)}` +
    (X_HANDLE ? `&via=${encodeURIComponent(X_HANDLE)}` : "");
  const format = meme.media_type.split("/")[1]?.toUpperCase() ?? "—";
  const Title = asPage ? "h1" : "h2";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      toast.show("Bağlantı kopyalandı");
    } catch {
      toast.show("Kopyalanamadı. Adres çubuğundan kopyalayabilirsin.", true);
    }
  }

  return (
    <>
    <article className={`detail${asPage ? " page" : ""}`} onClick={(e) => e.stopPropagation()}>
      <div className="stage">
        <MemeMedia meme={meme} mode="full" />
        {children}
      </div>
      <div className="panel">
        <div>
          <div className="no">{archiveNo(meme.no)}</div>
          <Title>{meme.title}</Title>
        </div>

        {meme.tags.length > 0 && (
          <div>
            <div className="label">Etiketler</div>
            <div className="tag-list">
              {meme.tags.map((t) =>
                onTag ? (
                  <button key={t} className="chip" onClick={() => onTag(t)}>#{t}</button>
                ) : (
                  <a key={t} className="chip" href={`/?tag=${encodeURIComponent(t)}`}>#{t}</a>
                ),
              )}
            </div>
          </div>
        )}

        {meme.caption && (
          <div>
            <div className="label">Görseldeki yazı</div>
            <p className="caption">{meme.caption}</p>
          </div>
        )}

        <dl className="ledger">
          <dt>Arşive giriş</dt>
          <dd>{formatDate(meme.created_at)}</dd>
          <dt>Dosya</dt>
          <dd>
            {format}
            {meme.width && meme.height ? ` · ${meme.width}×${meme.height}` : ""} · {formatSize(meme.size_bytes)}
          </dd>
          {meme.sha256 && (
            <>
              <dt title="Dosyanın SHA-256 özeti: içerik değişirse bu değer de değişir.">Parmak izi</dt>
              <dd title={meme.sha256}>{meme.sha256.slice(0, 20)}…</dd>
            </>
          )}
        </dl>

        <div className="actions">
          <a className="btn btn-neon wide" href={tweet} target="_blank" rel="noopener noreferrer">
            <XLogo /> X&apos;te paylaş
          </a>
          <button className="btn" onClick={copyLink}><LinkIcon /> Bağlantı</button>
          <a className="btn" href={downloadUrl(meme)}><DownloadIcon /> İndir</a>
        </div>
      </div>
    </article>
    {toast.node}
    </>
  );
}
