import type { Category, Meme, SortKey } from "./types";

/** Türkçe karakterden bağımsız karşılaştırma: "Şaşırdım" → "sasirdim". */
export function norm(s: string | null | undefined): string {
  return String(s ?? "")
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Metni aranabilir kelimelere böler. */
function words(s: string): string[] {
  return norm(s).split(/[^a-z0-9]+/).filter(Boolean);
}

export function cleanTag(raw: string): string {
  return raw.replace(/^#+/, "").trim().replace(/\s+/g, " ").toLocaleLowerCase("tr").slice(0, 32);
}

export function parseTags(raw: string): string[] {
  return [...new Set(raw.split(",").map(cleanTag).filter(Boolean))].slice(0, 20);
}

export function slugify(s: string): string {
  return norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

export const archiveNo = (n: number) => `No. ${String(n).padStart(4, "0")}`;

/** Arama: en az 2 harf; her aranan kelime, caps'teki bir kelimenin BAŞIYLA eşleşmeli. */
export const MIN_QUERY = 2;
export function searchTerms(q: string): string[] {
  return words(q).filter((t) => t.length >= MIN_QUERY || /^\d+$/.test(t));
}

export function filterMemes(
  memes: Meme[],
  opts: { q?: string; tags?: Set<string>; sort?: SortKey; categoryId?: number | null; categories?: Category[] },
): Meme[] {
  const { q = "", tags = new Set<string>(), sort = "new", categoryId = null, categories = [] } = opts;
  const terms = searchTerms(q);
  const catName = new Map(categories.map((c) => [c.id, c.name]));

  const out = memes.filter((m) => {
    if (categoryId != null && m.category_id !== categoryId) return false;
    for (const t of tags) if (!m.tags.includes(t)) return false;
    if (!terms.length) return true;
    const pool = words(
      [m.title, m.tags.join(" "), m.caption, m.category_id != null ? catName.get(m.category_id) ?? "" : "", String(m.no)].join(" "),
    );
    return terms.every((t) => pool.some((w) => w.startsWith(t)));
  });

  if (sort === "new") out.sort((a, b) => b.created_at.localeCompare(a.created_at));
  else if (sort === "old") out.sort((a, b) => a.created_at.localeCompare(b.created_at));
  else out.sort((a, b) => a.title.localeCompare(b.title, "tr"));
  return out;
}

export function tagCounts(memes: Meme[]): [string, number][] {
  const c = new Map<string, number>();
  for (const m of memes) for (const t of m.tags) c.set(t, (c.get(t) ?? 0) + 1);
  return [...c.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "tr"));
}

export function categoryCounts(memes: Meme[]): Map<number, number> {
  const c = new Map<number, number>();
  for (const m of memes) if (m.category_id != null) c.set(m.category_id, (c.get(m.category_id) ?? 0) + 1);
  return c;
}

export function formatSize(b: number | null): string {
  if (!b) return "—";
  return b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;
}

const dtf = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" });
export const formatDate = (iso: string) => dtf.format(new Date(iso));

export const isVideo = (type: string) => type.startsWith("video/");
