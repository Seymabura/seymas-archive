"use client";
import { downloadUrl, mediaUrl } from "./media";
import { isVideo } from "./text";
import type { Meme } from "./types";

export type ShareResult = "shared" | "copied" | "downloaded" | "cancelled" | "failed";

const EXT: Record<string, string> = {
  "image/png": "png", "image/jpeg": "jpg", "image/gif": "gif", "image/webp": "webp", "video/mp4": "mp4", "video/webm": "webm",
};

function composeUrl(text: string) {
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
}

/** Görseli PNG'ye çevirir (panoya yalnızca PNG kopyalanabiliyor). */
async function toPngBlob(src: string): Promise<Blob> {
  const res = await fetch(src, { mode: "cors" });
  if (!res.ok) throw new Error("fetch");
  const blob = await res.blob();
  if (blob.type === "image/png") return blob;
  const bmp = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bmp.width;
  canvas.height = bmp.height;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0);
  return await new Promise<Blob>((ok, bad) => canvas.toBlob((b) => (b ? ok(b) : bad(new Error("png"))), "image/png"));
}

async function asFile(m: Meme): Promise<File> {
  const res = await fetch(mediaUrl(m.storage_path), { mode: "cors" });
  const blob = await res.blob();
  return new File([blob], `seymas-archive-${String(m.no).padStart(4, "0")}.${EXT[m.media_type] ?? "bin"}`, { type: m.media_type });
}

/**
 * Caps'i doğrudan tweet'e koymaya çalışır:
 * - Telefonda: sistemin paylaşım menüsü açılır, X seçilince görsel/video tweet'e eklenir.
 * - Bilgisayarda (görsel): görsel panoya kopyalanır, X açılır, Ctrl+V ile yapıştırılır.
 * - Bilgisayarda (video, GIF): dosya indirilir, X açılır, dosya tweet'e eklenir.
 */
export async function shareToX(m: Meme): Promise<ShareResult> {
  const text = m.title;
  const touch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  // 1) Telefon: dosyayla paylaşım
  if (touch && typeof navigator.canShare === "function") {
    try {
      const file = await asFile(m);
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text });
        return "shared";
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return "cancelled";
    }
  }

  // 2) Bilgisayar, durağan görsel: panoya kopyala
  const still = !isVideo(m.media_type) && m.media_type !== "image/gif";
  if (still && typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": toPngBlob(mediaUrl(m.storage_path)) })]);
      window.open(composeUrl(text), "_blank", "noopener");
      return "copied";
    } catch {
      /* indirme yoluna düş */
    }
  }

  // 3) Yedek: indir + X'i aç
  const a = document.createElement("a");
  a.href = downloadUrl(m);
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.open(composeUrl(text), "_blank", "noopener");
  return "downloaded";
}

export function shareMessage(r: ShareResult): { text: string; err?: boolean } | null {
  switch (r) {
    case "copied": return { text: "Görsel kopyalandı! Açılan X sekmesinde Ctrl+V ile yapıştır." };
    case "downloaded": return { text: "Dosya indirildi. Açılan X sekmesinde tweet'e ekle." };
    case "shared": return { text: "Paylaşıldı 🎉" };
    case "failed": return { text: "Paylaşılamadı. İndir düğmesini deneyebilirsin.", err: true };
    default: return null;
  }
}
