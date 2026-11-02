"use client";
import { useEffect, useState } from "react";
import { catColor, vars } from "@/lib/colors";
import { SITE_URL } from "@/lib/config";
import { downloadUrl } from "@/lib/media";
import { shareMessage, shareToX } from "@/lib/share";
import { archiveNo, formatDate, formatSize, isVideo } from "@/lib/text";
import type { Category, Meme } from "@/lib/types";
import { DownloadIcon, LinkIcon, XLogo } from "./Icons";
import { MemeMedia } from "./MemeMedia";
import { useToast } from "./useToast";

type Props = {
  meme: Meme;
  category?: Category;
  asPage?: boolean;
  onTag?: (tag: string) => void;
  onCategory?: (id: number) => void;
  children?: React.ReactNode; // lightbox gezinme düğmeleri buraya gelir
};

export function MemeDetail({ meme, category, asPage, onTag, onCategory, children }: Props) {
  const toast = useToast();
  const [origin, setOrigin] = useState(SITE_URL);
  const [busy, setBusy] = useState(false);
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    setOrigin(window.location.origin);
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);
  const link = `${origin}/m/${meme.id}`;
  const format = meme.media_type.split("/")[1]?.toUpperCase() ?? "—";
  const Title = asPage ? "h1" : "h2";
  const still = !isVideo(meme.media_type) && meme.media_type !== "image/gif";

  async function share() {
    setBusy(true);
    const r = await shareToX(meme);
    setBusy(false);
    const msg = shareMessage(r);
    if (msg) toast.show(msg.text, msg.err);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      toast.show("Bağlantı kopyalandı 🔗");
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
          <div style={{ display: "grid", gap: 12 }}>
            <div className="top">
              {category &&
                (onCategory ? (
                  <button className="cat-chip" style={vars({ "--c": catColor(category) })} onClick={() => onCategory(category.id)}>
                    <span aria-hidden>{category.emoji}</span> {category.name}
                  </button>
                ) : (
                  <a className="cat-chip" style={vars({ "--c": catColor(category) })} href={`/?k=${category.slug}`}>
                    <span aria-hidden>{category.emoji}</span> {category.name}
                  </a>
                ))}
              <span className="no">{archiveNo(meme.no)}</span>
            </div>
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
          </dl>

          <div className="actions">
            <button className="btn btn-primary wide" onClick={share} disabled={busy}>
              <XLogo /> {busy ? "Hazırlanıyor…" : "X'te paylaş"}
            </button>
            <p className="share-note">
              {touch
                ? "Paylaşım menüsünden X'i seç, caps doğrudan tweet'ine eklenir."
                : still
                  ? "Görsel panoya kopyalanır. Açılan X sekmesinde Ctrl+V ile yapıştır."
                  : "Dosya indirilir ve X açılır. İndirilen dosyayı tweet'ine ekle."}
            </p>
            <button className="btn" onClick={copyLink}><LinkIcon /> Bağlantı</button>
            <a className="btn" href={downloadUrl(meme)}><DownloadIcon /> İndir</a>
          </div>
        </div>
      </article>
      {toast.node}
    </>
  );
}
