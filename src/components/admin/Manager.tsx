"use client";
import { useMemo, useState } from "react";
import { BUCKET } from "@/lib/config";
import { getBrowserClient } from "@/lib/supabase";
import { archiveNo, filterMemes, formatDate } from "@/lib/text";
import type { Category, Meme } from "@/lib/types";
import { CategoryPick } from "./Uploader";
import { SearchIcon } from "../Icons";
import { MemeMedia } from "../MemeMedia";
import { TagInput } from "./TagInput";

type Props = { memes: Meme[]; known: string[]; categories: Category[]; onChanged: () => void; toast: (m: string, err?: boolean) => void };

export function Manager({ memes, known, categories, onChanged, toast }: Props) {
  const [q, setQ] = useState("");
  const list = useMemo(() => filterMemes(memes, { q, categories }), [memes, q, categories]);

  return (
    <section className="panel-card" aria-labelledby="mg-h">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <h2 id="mg-h" style={{ margin: 0 }}>Arşivdekiler</h2>
        <div className="search" style={{ flex: "0 1 320px" }}>
          <SearchIcon />
          <label htmlFor="mg-q" className="sr-only">Arşivde ara</label>
          <input id="mg-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Arşivde ara…" style={{ height: 44, paddingRight: 16 }} />
        </div>
      </div>
      {memes.length === 0 ? (
        <p className="hint">Henüz caps yok. Yukarıdan ilkini ekle.</p>
      ) : list.length === 0 ? (
        <p className="hint">Aramayla eşleşen caps yok.</p>
      ) : (
        <div className="manage-grid">
          {list.map((m) => <Item key={m.id} meme={m} known={known} categories={categories} onChanged={onChanged} toast={toast} />)}
        </div>
      )}
    </section>
  );
}

function Item({ meme, known, categories, onChanged, toast }: { meme: Meme } & Omit<Props, "memes">) {
  const sb = getBrowserClient()!;
  const [mode, setMode] = useState<"view" | "edit" | "confirm">("view");
  const [title, setTitle] = useState(meme.title);
  const [tags, setTags] = useState(meme.tags);
  const [caption, setCaption] = useState(meme.caption);
  const [categoryId, setCategoryId] = useState<number | null>(meme.category_id);
  const [busy, setBusy] = useState(false);
  const cat = categories.find((c) => c.id === meme.category_id);

  async function save() {
    if (!title.trim()) return toast("Başlık boş olamaz.", true);
    setBusy(true);
    const { error } = await sb.from("memes").update({ title: title.trim(), tags, caption: caption.trim(), category_id: categoryId }).eq("id", meme.id);
    setBusy(false);
    if (error) return toast(`Kaydedilemedi: ${error.message}`, true);
    setMode("view");
    toast("Değişiklikler kaydedildi");
    onChanged();
  }

  async function remove() {
    setBusy(true);
    const { error } = await sb.from("memes").delete().eq("id", meme.id);
    if (error) {
      setBusy(false);
      return toast(`Silinemedi: ${error.message}`, true);
    }
    await sb.storage.from(BUCKET).remove([meme.storage_path]);
    toast("Caps silindi");
    onChanged();
  }

  return (
    <article className="m-item">
      <div className="thumb"><MemeMedia meme={meme} mode="thumb" /></div>
      <div className="body">
        {mode === "edit" ? (
          <>
            <div className="field">
              <label htmlFor={`t-${meme.id}`}>Başlık</label>
              <input id={`t-${meme.id}`} className="input" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            {categories.length > 0 && (
              <div className="field">
                <label>Kategori</label>
                <CategoryPick categories={categories} value={categoryId} onChange={setCategoryId} />
              </div>
            )}
            <div className="field">
              <label htmlFor={`g-${meme.id}`}>Etiketler</label>
              <TagInput id={`g-${meme.id}`} value={tags} onChange={setTags} known={known} />
            </div>
            <div className="field">
              <label htmlFor={`c-${meme.id}`}>Görseldeki yazı</label>
              <textarea id={`c-${meme.id}`} className="input" maxLength={1000} value={caption} onChange={(e) => setCaption(e.target.value)} />
            </div>
            <div className="acts">
              <button className="btn btn-primary btn-sm" onClick={save} disabled={busy}>{busy ? "Kaydediliyor…" : "Kaydet"}</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setTitle(meme.title); setTags(meme.tags); setCaption(meme.caption); setCategoryId(meme.category_id); setMode("view"); }}>Vazgeç</button>
            </div>
          </>
        ) : (
          <>
            <div className="row">
              <span className="title">{meme.title}</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--neon)", whiteSpace: "nowrap" }}>{archiveNo(meme.no)}</span>
            </div>
            {meme.tags.length > 0 && <div className="hint" style={{ color: "var(--muted)" }}>{meme.tags.map((t) => `#${t}`).join("  ")}</div>}
            <div className="hint">{cat ? `${cat.emoji} ${cat.name} · ` : "Kategorisiz · "}{formatDate(meme.created_at)}</div>
            {mode === "confirm" ? (
              <div className="confirm">
                <span><b>{meme.title}</b> kalıcı olarak silinsin mi? Görsel dosyası da silinir.</span>
                <div className="acts">
                  <button className="btn btn-danger btn-sm" onClick={remove} disabled={busy}>{busy ? "Siliniyor…" : "Evet, sil"}</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setMode("view")}>Vazgeç</button>
                </div>
              </div>
            ) : (
              <div className="acts">
                <a className="btn btn-sm" href={`/m/${meme.id}`} target="_blank" rel="noopener">Aç</a>
                <button className="btn btn-sm" onClick={() => setMode("edit")}>Düzenle</button>
                <button className="btn btn-danger btn-sm" onClick={() => setMode("confirm")}>Sil</button>
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}
