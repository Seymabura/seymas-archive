"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { archiveNo, filterMemes, tagCounts, timeAgo } from "@/lib/text";
import type { Meme, SortKey } from "@/lib/types";
import { CloseIcon, NextIcon, PrevIcon, SearchIcon } from "./Icons";
import { MemeDetail } from "./MemeDetail";
import { MemeMedia } from "./MemeMedia";
import { isVideo } from "@/lib/text";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "new", label: "En yeni" },
  { key: "old", label: "En eski" },
  { key: "az", label: "A–Z" },
];

export function Gallery({ memes }: { memes: Meme[] }) {
  const [q, setQ] = useState("");
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortKey>("new");
  const [openId, setOpenId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const pushed = useRef(false);

  // Adresteki ?tag= ve ?q= parametrelerini oku (paylaşılan bağlantılar için).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.getAll("tag").filter(Boolean);
    if (t.length) setTags(new Set(t));
    const qq = p.get("q");
    if (qq) setQ(qq);
  }, []);

  const visible = useMemo(() => filterMemes(memes, q, tags, sort), [memes, q, tags, sort]);
  const counts = useMemo(() => tagCounts(memes), [memes]);
  const lastAdded = memes.reduce<string | null>((m, x) => (!m || x.created_at > m ? x.created_at : m), null);
  const open = openId ? memes.find((m) => m.id === openId) ?? null : null;

  const toggleTag = (t: string) =>
    setTags((prev) => {
      const n = new Set(prev);
      if (n.has(t)) n.delete(t);
      else n.add(t);
      return n;
    });

  const openMeme = useCallback((id: string) => {
    setOpenId(id);
    const url = `/m/${id}`;
    if (pushed.current) window.history.replaceState({ lb: id }, "", url);
    else {
      window.history.pushState({ lb: id }, "", url);
      pushed.current = true;
    }
  }, []);

  const closeMeme = useCallback(() => {
    setOpenId(null);
    if (pushed.current) {
      pushed.current = false;
      window.history.back();
    }
  }, []);

  const step = useCallback(
    (d: number) => {
      if (!openId || visible.length < 2) return;
      const i = visible.findIndex((m) => m.id === openId);
      if (i < 0) return;
      openMeme(visible[(i + d + visible.length) % visible.length].id);
    },
    [openId, visible, openMeme],
  );

  // Klavye: "/" aramaya odaklanır, Esc kapatır, ← → gezinir.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /INPUT|TEXTAREA/.test((e.target as HTMLElement)?.tagName ?? "");
      if (openId) {
        if (e.key === "Escape") closeMeme();
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
        return;
      }
      if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    const onPop = () => {
      if (pushed.current) {
        pushed.current = false;
        setOpenId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("popstate", onPop);
    };
  }, [openId, closeMeme, step]);

  // Detay açıkken arka plan kaymasın.
  useEffect(() => {
    document.body.style.overflow = openId ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openId]);

  const filtering = q.trim() !== "" || tags.size > 0;
  const reset = () => {
    setQ("");
    setTags(new Set());
  };

  return (
    <>
      <section className="container hero">
        <div className="hero-top">
          <div className="hero-title">
            <span className="eyebrow"><span className="dot" />Canlı arşiv</span>
            <h1 className="chrome-text">Seyma&apos;s<br />Archive</h1>
          </div>
          {memes.length >= 3 && (
            <div className="collage" aria-hidden>
              {memes.slice(0, 3).map((m) => (
                <div key={m.id} className="collage-card"><MemeMedia meme={m} mode="thumb" /></div>
              ))}
            </div>
          )}
        </div>
        <div className="hero-row">
          <p className="lead">
            Türk internetinin caps arşivi. Her caps etiketli, numaralı ve aranabilir. Aklında kalan tek bir kelimeyle bile bulursun.
          </p>
          {memes.length > 0 && (
            <div className="stats">
              <div className="stat"><b>{memes.length}</b><span>Caps</span></div>
              <div className="stat"><b>{counts.length}</b><span>Etiket</span></div>
              {lastAdded && <div className="stat"><b>{timeAgo(lastAdded)}</b><span>Son ekleme</span></div>}
            </div>
          )}
        </div>
      </section>

      <div className="toolbar">
        <div className="container">
          <div className="toolbar-row">
            <div className="search">
              <SearchIcon />
              <label htmlFor="q" className="sr-only">Caps ara</label>
              <input
                id="q"
                ref={searchRef}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Başlık, etiket ya da görseldeki yazı…"
                autoComplete="off"
                spellCheck={false}
              />
              <span className="kbd">
                {q ? (
                  <button className="clear-x" onClick={() => setQ("")} aria-label="Aramayı temizle"><CloseIcon size={13} /></button>
                ) : (
                  <kbd aria-hidden>/</kbd>
                )}
              </span>
            </div>
            <div className="seg" role="group" aria-label="Sıralama">
              {SORTS.map((s) => (
                <button key={s.key} aria-pressed={sort === s.key} onClick={() => setSort(s.key)}>{s.label}</button>
              ))}
            </div>
          </div>
          {counts.length > 0 && (
            <div className="tags-row" role="group" aria-label="Etiketle filtrele">
              {[...tags].filter((t) => !counts.some(([c]) => c === t)).map((t) => (
                <button key={t} className="chip" aria-pressed onClick={() => toggleTag(t)}>#{t} <span className="n">0</span></button>
              ))}
              {counts.map(([t, n]) => (
                <button key={t} className="chip" aria-pressed={tags.has(t)} onClick={() => toggleTag(t)}>
                  #{t} <span className="n">{n}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <main className="container">
        {memes.length === 0 ? (
          <div className="empty">
            <div className="empty-art" aria-hidden><i /><i /><i /></div>
            <h2>Arşiv çok yakında dolmaya başlıyor</h2>
            <p>İlk caps&apos;ler yolda. Yeni eklemelerden haberdar olmak için X hesabını takip et.</p>
          </div>
        ) : (
          <>
            <div className="result-line">
              <span>
                {filtering ? <><b>{visible.length}</b> sonuç · toplam {memes.length} caps</> : <>Toplam <b>{memes.length}</b> caps</>}
              </span>
              {filtering && <button className="linkish" onClick={reset}>Filtreleri temizle</button>}
            </div>
            {visible.length > 0 ? (
              <div className="grid">
                {visible.map((m, i) => (
                  <button
                    key={m.id}
                    className="card"
                    style={{ animationDelay: `${Math.min(i, 16) * 30}ms` }}
                    onClick={() => openMeme(m.id)}
                    aria-label={`${m.title} — ${archiveNo(m.no)}`}
                  >
                    <div className="media" style={{ "--ar": m.width && m.height ? m.width / m.height : 1 } as React.CSSProperties}>
                      {isVideo(m.media_type) ? <span className="badge">VİDEO</span> : m.media_type === "image/gif" ? <span className="badge">GIF</span> : null}
                      <MemeMedia meme={m} mode="thumb" playOnHover />
                      <div className="shade">
                        <span className="t">{m.title}</span>
                        <span className="meta">
                          <span className="no">{archiveNo(m.no)}</span>
                          <span className="mini-tags">{m.tags.slice(0, 3).map((t) => `#${t}`).join(" ")}</span>
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty">
                <h2>Bununla eşleşen caps yok</h2>
                <p>Başka bir kelime dene ya da etiket filtresini kaldır. Türkçe karakter yazmasan da bulur: “sasirdim” yazınca “şaşırdım” çıkar.</p>
                <button className="btn" onClick={reset}>Aramayı sıfırla</button>
              </div>
            )}
          </>
        )}
      </main>

      {open && (
        <div className="lightbox" onClick={closeMeme} role="dialog" aria-modal="true" aria-label={open.title}>
          <button className="icon-btn lb-close" onClick={closeMeme} aria-label="Kapat"><CloseIcon /></button>
          <MemeDetail
            meme={open}
            onTag={(t) => {
              setTags(new Set([t]));
              setQ("");
              closeMeme();
              window.scrollTo({ top: 0 });
            }}
          >
            {visible.length > 1 && (
              <>
                <button className="icon-btn lb-nav prev" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Önceki caps"><PrevIcon /></button>
                <button className="icon-btn lb-nav next" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Sonraki caps"><NextIcon /></button>
              </>
            )}
          </MemeDetail>
        </div>
      )}
    </>
  );
}
