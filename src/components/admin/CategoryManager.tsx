"use client";
import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase";
import { categoryCounts, slugify } from "@/lib/text";
import type { Category, Meme } from "@/lib/types";

type Props = {
  categories: Category[];
  memes: Meme[];
  onChanged: () => void;
  toast: (m: string, err?: boolean) => void;
};

export function CategoryManager({ categories, memes, onChanged, toast }: Props) {
  const sb = getBrowserClient()!;
  const counts = categoryCounts(memes);
  const [emoji, setEmoji] = useState("✨");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    const slug = slugify(n);
    if (!n || !slug) return toast("Kategori adı boş olamaz.", true);
    if (categories.some((c) => c.slug === slug)) return toast("Bu adda bir kategori zaten var.", true);
    setBusy(true);
    const position = categories.reduce((m, c) => Math.max(m, c.position), 0) + 1;
    const { error } = await sb.from("categories").insert({ name: n, emoji: emoji.trim() || "✨", slug, position });
    setBusy(false);
    if (error) return toast(`Eklenemedi: ${error.message}`, true);
    setName("");
    setEmoji("✨");
    toast(`${emoji} ${n} eklendi`);
    onChanged();
  }

  async function move(c: Category, dir: -1 | 1) {
    const i = categories.findIndex((x) => x.id === c.id);
    const other = categories[i + dir];
    if (!other) return;
    // Sıraları değiştir (aynıysa farklılaştır).
    const a = other.position === c.position ? c.position + dir : other.position;
    const b = c.position;
    const r1 = await sb.from("categories").update({ position: a }).eq("id", c.id);
    const r2 = await sb.from("categories").update({ position: b }).eq("id", other.id);
    if (r1.error || r2.error) return toast("Sıralama kaydedilemedi.", true);
    onChanged();
  }

  return (
    <section className="panel-card" aria-labelledby="cat-h">
      <h2 id="cat-h">Kategoriler</h2>
      <div className="cat-admin">
        {categories.map((c, i) => (
          <Row
            key={c.id}
            c={c}
            count={counts.get(c.id) ?? 0}
            first={i === 0}
            last={i === categories.length - 1}
            onMove={(d) => move(c, d)}
            onChanged={onChanged}
            toast={toast}
          />
        ))}
        <form className="cat-row" onSubmit={add} style={{ borderStyle: "dashed" }}>
          <input className="input emoji-in" aria-label="Yeni kategori emojisi" value={emoji} maxLength={8} onChange={(e) => setEmoji(e.target.value)} />
          <input className="input" aria-label="Yeni kategori adı" placeholder="Yeni kategori adı" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
          <span className="count" />
          <button className="btn btn-primary btn-sm" disabled={busy || !name.trim()}>Ekle</button>
        </form>
      </div>
    </section>
  );
}

function Row({
  c, count, first, last, onMove, onChanged, toast,
}: {
  c: Category; count: number; first: boolean; last: boolean;
  onMove: (d: -1 | 1) => void; onChanged: () => void; toast: (m: string, err?: boolean) => void;
}) {
  const sb = getBrowserClient()!;
  const [emoji, setEmoji] = useState(c.emoji);
  const [name, setName] = useState(c.name);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const dirty = emoji !== c.emoji || name !== c.name;

  async function save() {
    if (!name.trim()) return toast("Kategori adı boş olamaz.", true);
    setBusy(true);
    const { error } = await sb.from("categories").update({ name: name.trim(), emoji: emoji.trim() || "✨" }).eq("id", c.id);
    setBusy(false);
    if (error) return toast(`Kaydedilemedi: ${error.message}`, true);
    toast("Kategori güncellendi");
    onChanged();
  }

  async function remove() {
    setBusy(true);
    const { error } = await sb.from("categories").delete().eq("id", c.id);
    setBusy(false);
    if (error) return toast(`Silinemedi: ${error.message}`, true);
    toast(`${c.name} silindi`);
    onChanged();
  }

  if (confirm)
    return (
      <div className="confirm">
        <span>
          <b>{c.emoji} {c.name}</b> silinsin mi? {count > 0 ? `İçindeki ${count} caps silinmez, kategorisiz kalır.` : ""}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-danger btn-sm" onClick={remove} disabled={busy}>{busy ? "Siliniyor…" : "Evet, sil"}</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setConfirm(false)}>Vazgeç</button>
        </div>
      </div>
    );

  return (
    <div className="cat-row">
      <input className="input emoji-in" aria-label={`${c.name} emojisi`} value={emoji} maxLength={8} onChange={(e) => setEmoji(e.target.value)} />
      <input className="input" aria-label="Kategori adı" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
      <span className="count" title="Bu kategorideki caps sayısı">{count}</span>
      <div style={{ display: "flex", gap: 6 }}>
        {dirty ? (
          <button className="btn btn-primary btn-sm" onClick={save} disabled={busy}>Kaydet</button>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => onMove(-1)} disabled={first} aria-label="Yukarı taşı">↑</button>
            <button className="btn btn-ghost btn-sm" onClick={() => onMove(1)} disabled={last} aria-label="Aşağı taşı">↓</button>
            <button className="btn btn-danger btn-sm" onClick={() => setConfirm(true)}>Sil</button>
          </>
        )}
      </div>
    </div>
  );
}
