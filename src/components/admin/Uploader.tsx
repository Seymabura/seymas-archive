"use client";
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { BUCKET } from "@/lib/config";
import { getBrowserClient } from "@/lib/supabase";
import { MEME_COLUMNS } from "@/lib/memes";
import { archiveNo, formatSize } from "@/lib/text";
import type { Meme } from "@/lib/types";
import { UploadIcon } from "../Icons";
import { TagInput } from "./TagInput";

const TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp", "video/mp4", "video/webm"];
const MAX = 20 * 1024 * 1024;
const EXT: Record<string, string> = {
  "image/png": "png", "image/jpeg": "jpg", "image/gif": "gif", "image/webp": "webp", "video/mp4": "mp4", "video/webm": "webm",
};

type Picked = { file: File; url: string; sha: string; w: number; h: number };

/** Dosyanın SHA-256 özetini tarayıcıda hesaplar (dosya hiçbir yere gönderilmeden). */
async function sha256(file: File) {
  const hash = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function dimensions(file: File, url: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const done = (w = 0, h = 0) => resolve({ w, h });
    setTimeout(() => done(), 5000);
    if (file.type.startsWith("video/")) {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => done(v.videoWidth, v.videoHeight);
      v.onerror = () => done();
      v.src = url;
    } else {
      const i = new Image();
      i.onload = () => done(i.naturalWidth, i.naturalHeight);
      i.onerror = () => done();
      i.src = url;
    }
  });
}

type Props = { memes: Meme[]; known: string[]; onSaved: (m: Meme) => void };

export function Uploader({ memes, known, onSaved }: Props) {
  const sb = getBrowserClient()!;
  const [picked, setPicked] = useState<Picked | null>(null);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hashing, setHashing] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const duplicate = picked?.sha ? memes.find((m) => m.sha256 === picked.sha) : undefined;

  const take = useCallback(async (file: File) => {
    setErr("");
    if (!TYPES.includes(file.type)) return setErr("Bu dosya türü desteklenmiyor. PNG, JPG, GIF, WEBP, MP4 ya da WEBM seç.");
    if (file.size > MAX) return setErr(`Dosya ${formatSize(file.size)}. En fazla 20 MB yükleyebilirsin.`);
    const url = URL.createObjectURL(file);
    setPicked((prev) => { if (prev) URL.revokeObjectURL(prev.url); return { file, url, sha: "", w: 0, h: 0 }; });
    setHashing(true);
    const [{ w, h }, sha] = await Promise.all([dimensions(file, url), sha256(file)]);
    setHashing(false);
    setPicked((p) => (p && p.url === url ? { ...p, w, h, sha } : p));
    // Dosya adı anlamlıysa başlık önerisi olarak kullan.
    if (!/^(image|screenshot|ekran|img_|video|\d)/i.test(file.name)) {
      setTitle((t) => t || file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim().slice(0, 120));
    }
    titleRef.current?.focus();
  }, []);

  // Sayfanın herhangi bir yerinde Ctrl+V ile görsel yapıştırma.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const f = [...(e.clipboardData?.files ?? [])].find((x) => TYPES.includes(x.type));
      if (f) { e.preventDefault(); take(f); }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [take]);

  const reset = () => {
    if (picked) URL.revokeObjectURL(picked.url);
    setPicked(null); setTitle(""); setTags([]); setCaption(""); setErr("");
  };

  async function save() {
    if (!picked || !title.trim() || duplicate || hashing) return;
    setBusy(true);
    setErr("");
    try {
      // Dosya adı = parmak izi: aynı dosya iki kez depolanmaz.
      const path = `${picked.sha}.${EXT[picked.file.type]}`;
      const up = await sb.storage.from(BUCKET).upload(path, picked.file, {
        contentType: picked.file.type, cacheControl: "31536000", upsert: true,
      });
      if (up.error) throw new Error(up.error.message);
      const { data, error } = await sb
        .from("memes")
        .insert({
          title: title.trim(), tags, caption: caption.trim(), storage_path: path, media_type: picked.file.type,
          width: picked.w || null, height: picked.h || null, size_bytes: picked.file.size, sha256: picked.sha,
        })
        .select(MEME_COLUMNS)
        .single();
      if (error) throw new Error(error.code === "23505" ? "Bu dosya zaten arşivde." : error.message);
      reset();
      onSaved(data as Meme);
    } catch (e) {
      setErr(`Kaydedilemedi: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  const isVid = picked?.file.type.startsWith("video/");

  return (
    <section className="panel-card" aria-labelledby="up-h">
      <h2 id="up-h">Yeni caps ekle</h2>
      <div className="uploader">
        <div
          className={`drop${over ? " over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault(); setOver(false);
            const f = [...e.dataTransfer.files].find((x) => TYPES.includes(x.type)) ?? e.dataTransfer.files[0];
            if (f) take(f);
          }}
        >
          <div className="drop-inner">
            <UploadIcon />
            <strong>Görseli buraya bırak</strong>
            <p>ya da kopyaladığın görseli bu sayfada <b>Ctrl+V</b> ile yapıştır</p>
            <button type="button" className="btn btn-sm" onClick={() => fileRef.current?.click()}>Dosya seç</button>
            <p>PNG · JPG · GIF · WEBP · MP4 — en fazla 20 MB</p>
          </div>
          <input ref={fileRef} type="file" accept={TYPES.join(",")} hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) take(f); }} />
          {picked && (
            <div className="preview">
              {isVid ? <video src={picked.url} muted loop autoPlay playsInline /> : <img src={picked.url} alt="Önizleme" />}
              <button type="button" className="btn btn-sm swap" onClick={() => fileRef.current?.click()}>Değiştir</button>
            </div>
          )}
        </div>

        <div className="form-col">
          <div className="field">
            <label htmlFor="up-title">Başlık</label>
            <input id="up-title" ref={titleRef} className="input" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn. Ben bu filmi görmüştüm" />
          </div>
          <div className="field">
            <label htmlFor="up-tags">Etiketler <span>· Enter ya da virgülle ekle</span></label>
            <TagInput id="up-tags" value={tags} onChange={setTags} known={known} />
          </div>
          <div className="field">
            <label htmlFor="up-cap">Görseldeki yazı <span>· isteğe bağlı, aramada kullanılır</span></label>
            <textarea id="up-cap" className="input" maxLength={1000} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Görselde yazan cümleyi buraya yaz." />
          </div>
          {duplicate && (
            <div className="warn-box">Bu dosyanın aynısı zaten arşivde: <b>{duplicate.title}</b> ({archiveNo(duplicate.no)}).</div>
          )}
          {picked && <div className="fp">{hashing ? "Parmak izi hesaplanıyor…" : `SHA-256 · ${picked.sha}`}</div>}
          {err && <div className="err-text" role="alert">{err}</div>}
          <div className="form-actions">
            {picked && <button type="button" className="btn btn-ghost" onClick={reset}>Temizle</button>}
            <button type="button" className="btn btn-neon" onClick={save} disabled={!picked || !title.trim() || !!duplicate || hashing || busy}>
              {busy ? "Yükleniyor…" : "Arşive ekle"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
