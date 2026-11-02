"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { catColor, vars } from "@/lib/colors";
import { archiveNo, categoryCounts, filterMemes, isVideo, searchTerms, tagCounts } from "@/lib/text";
import type { Category, Meme, SortKey } from "@/lib/types";
import { CloseIcon, NextIcon, PrevIcon, SearchIcon } from "./Icons";
import { Mascot } from "./Mascot";
import { MemeDetail } from "./MemeDetail";
import { MemeMedia } from "./MemeMedia";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "new", label: "En yeni" },
  { key: "old", label: "En eski" },
  { key: "az", label: "A–Z" },
];
const EXAMPLES = ["pazartesi", "hocam", "kedi", "derbi", "maaş günü", "annem", "vize"];

type Props = { memes: Meme[]; categories: Category[] };

export function Gallery({ memes, categories }: Props) {
  const [q, setQ] = useState("");
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [cat, setCat] = useState<number | null>(null);
  const [sort, setSort] = useState<SortKey>("new");
  const [openId, setOpenId] = useState<string | null>(null);
  const [ex, setEx] = useState(0);
  const [rolling, setRolling] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const pushed = useRef(false);

  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const catCounts = useMemo(() => categoryCounts(memes), [memes]);
  const usedCats = useMemo(() => categories.filter((c) => catCounts.has(c.id)), [categories, catCounts]);
  const tagList = useMemo(() => tagCounts(memes).slice(0, 12), [memes]);

  // Paylaşılan bağlantılardan filtreleri oku: ?k=kategori&tag=etiket&q=arama
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const k = p.get("k");
    if (k) {
      const c = categories.find((x) => x.slug === k);
      if (c) setCat(c.id);
    }
    const t = p.getAll("tag").filter(Boolean);
    if (t.length) setTags(new Set(t));
    const qq = p.get("q");
    if (qq) setQ(qq);
  }, [categories]);

  // Kategori değişince adresi güncelle (bağlantı paylaşılabilsin).
  useEffect(() => {
    if (openId) return;
    const url = new URL(window.location.href);
    const slug = cat != null ? catById.get(cat)?.slug : null;
    if (slug) url.searchParams.set("k", slug);
    else url.searchParams.delete("k");
    window.history.replaceState(window.history.state, "", url.pathname + url.search);
  }, [cat, catById, openId]);

  // Arama kutusunda dönen örnekler
  useEffect(() => {
    const t = setInterval(() => setEx((i) => (i + 1) % EXAMPLES.length), 2600);
    return () => clearInterval(t);
  }, []);

  const terms = searchTerms(q);
  const tooShort = q.trim().length > 0 && terms.length === 0;
  const visible = useMemo(
    () => filterMemes(memes, { q, tags, sort, categoryId: cat, categories }),
    [memes, q, tags, sort, cat, categories],
  );
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

  const random = () => {
    const pool = visible.length ? visible : memes;
    if (!pool.length) return;
    setRolling(true);
    setTimeout(() => {
      setRolling(false);
      openMeme(pool[Math.floor(Math.random() * pool.length)].id);
    }, 450);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement)?.tagName ?? "");
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

  useEffect(() => {
    document.body.style.overflow = openId ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openId]);

  const filtering = terms.length > 0 || tags.size > 0 || cat != null;
  const reset = () => {
    setQ("");
    setTags(new Set());
    setCat(null);
  };
  const showcase = memes.filter((m) => !isVideo(m.media_type)).slice(0, 3);
  const activeCat = cat != null ? catById.get(cat) : undefined;

  return (
    <>
      <section className="container hero">
        <div className="hero-copy">
          <span className="pill-badge">
            <span className="live" aria-hidden />
            {memes.length > 0 ? <><b>{memes.length}</b> caps arşivde</> : <>Arşiv açılıyor</>}
          </span>
          <h1>
            Aradığın <span className="swash">caps</span> burada.
          </h1>
          <p className="lead">Aklında kalan tek bir kelimeyi yaz, gerisini biz bulalım. Kopyala, X&apos;e yapıştır, ortamı coştur.</p>
          {memes.length > 0 && (
            <div className="hero-actions">
              <button className={`btn btn-primary${rolling ? " rolling" : ""}`} onClick={random}>
                <span className="dice" aria-hidden>🎲</span> Bana rastgele bir caps göster
              </button>
            </div>
          )}
        </div>
        <div className="hero-art" aria-hidden>
          {showcase.map((m) => (
            <div key={m.id} className="float-card"><MemeMedia meme={m} mode="thumb" /></div>
          ))}
          <Mascot size={210} track bob mood={memes.length ? "happy" : "wow"} />
        </div>
      </section>

      {memes.length > 0 && (
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
                  placeholder={`“${EXAMPLES[ex]}” diye ara…`}
                  autoComplete="off"
                  spellCheck={false}
                  enterKeyHint="search"
                />
                <span className="kbd">
                  {q ? (
                    <button className="clear-x" onClick={() => setQ("")} aria-label="Aramayı temizle"><CloseIcon size={14} /></button>
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

            {usedCats.length > 0 && (
              <div className="cats" role="group" aria-label="Kategoriler">
                <button className="cat" aria-pressed={cat == null} onClick={() => setCat(null)} style={vars({ "--c": "var(--text)" })}>
                  <span className="e" aria-hidden>✨</span> Tümü <span className="n">{memes.length}</span>
                </button>
                {usedCats.map((c) => (
                  <button
                    key={c.id}
                    className="cat"
                    aria-pressed={cat === c.id}
                    onClick={() => setCat(cat === c.id ? null : c.id)}
                    style={vars({ "--c": catColor(c) })}
                  >
                    <span className="e" aria-hidden>{c.emoji}</span> {c.name} <span className="n">{catCounts.get(c.id)}</span>
                  </button>
                ))}
              </div>
            )}

            {tagList.length > 0 && (
              <div className="tags-row" role="group" aria-label="Popüler etiketler">
                <span className="lbl">Popüler:</span>
                {tagList.map(([t, n]) => (
                  <button key={t} className="chip" aria-pressed={tags.has(t)} onClick={() => toggleTag(t)}>
                    #{t} <span className="n">{n}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <main className="container">
        {memes.length === 0 ? (
          <div className="empty">
            <Mascot size={120} mood="wow" bob />
            <h2>İlk caps&apos;ler yolda</h2>
            <p>Arşiv çok yakında dolmaya başlıyor. Yeni eklemelerden haberdar olmak için X hesabını takip et.</p>
          </div>
        ) : (
          <>
            <div className="result-line" aria-live="polite">
              <span>
                {tooShort ? (
                  <>Aramak için en az {2} harf yaz</>
                ) : filtering ? (
                  <><b>{visible.length}</b> caps bulundu{activeCat ? <> · {activeCat.emoji} {activeCat.name}</> : null}</>
                ) : (
                  <><b>{memes.length}</b> caps</>
                )}
              </span>
              {filtering && <button className="linkish" onClick={reset}>Filtreleri temizle</button>}
            </div>
            {visible.length > 0 ? (
              <div className="grid">
                {visible.map((m, i) => {
                  const c = m.category_id != null ? catById.get(m.category_id) : undefined;
                  return (
                    <button
                      key={m.id}
                      className="card"
                      style={vars({ animationDelay: `${Math.min(i, 14) * 35}ms`, "--c": catColor(c) })}
                      onClick={() => openMeme(m.id)}
                      aria-label={`${m.title} — ${archiveNo(m.no)}`}
                    >
                      <div className="media" style={vars({ "--ar": m.width && m.height ? m.width / m.height : 1 })}>
                        <span className="badges">
                          {c ? <span className="badge cat-badge" title={c.name}>{c.emoji}</span> : <span />}
                          {isVideo(m.media_type) ? <span className="badge">▶ VİDEO</span> : m.media_type === "image/gif" ? <span className="badge">GIF</span> : null}
                        </span>
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
                  );
                })}
              </div>
            ) : (
              <div className="empty">
                <Mascot size={110} mood="sad" />
                <h2>Bunu bulamadım</h2>
                <p>Başka bir kelime dene ya da filtreleri kaldır. Türkçe karakter yazmasan da olur, “sasirdim” yazınca “şaşırdım” çıkar.</p>
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
            category={open.category_id != null ? catById.get(open.category_id) : undefined}
            onTag={(t) => {
              setTags(new Set([t]));
              setQ("");
              closeMeme();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onCategory={(id) => {
              setCat(id);
              setTags(new Set());
              setQ("");
              closeMeme();
              window.scrollTo({ top: 0, behavior: "smooth" });
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
