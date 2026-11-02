import type { Meme, SortKey } from "./types";

/** Türkçe karakterden bağımsız karşılaştırma: "Şaşırdım" → "sasirdim". */
export function norm(s: string | null | undefined): string {
  return String(s ?? "")
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function cleanTag(raw: string): string {
  return raw.replace(/^#+/, "").trim().replace(/\s+/g, " ").toLocaleLowerCase("tr").slice(0, 32);
}

export function parseTags(raw: string): string[] {
  return [...new Set(raw.split(",").map(cleanTag).filter(Boolean))].slice(0, 20);
}

export const archiveNo = (n: number) => `No. ${String(n).padStart(4, "0")}`;

export function filterMemes(memes: Meme[], q: string, tags: Set<string>, sort: SortKey): Meme[] {
  const terms = norm(q).split(/\s+/).filter(Boolean);
  const out = memes.filter((m) => {
    for (const t of tags) if (!m.tags.includes(t)) return false;
    if (!terms.length) return true;
    const hay = norm([m.title, m.tags.join(" "), m.caption, archiveNo(m.no), String(m.no)].join(" "));
    return terms.every((t) => hay.includes(t));
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

export function formatSize(b: number | null): string {
  if (!b) return "—";
  return b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;
}

const dtf = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" });
export const formatDate = (iso: string) => dtf.format(new Date(iso));

export function timeAgo(iso: string): string {
  const rtf = new Intl.RelativeTimeFormat("tr", { numeric: "auto" });
  const d = (new Date(iso).getTime() - Date.now()) / 1000;
  const a = Math.abs(d);
  if (a < 60) return "az önce";
  if (a < 3600) return rtf.format(Math.round(d / 60), "minute");
  if (a < 86400) return rtf.format(Math.round(d / 3600), "hour");
  if (a < 2592000) return rtf.format(Math.round(d / 86400), "day");
  return formatDate(iso);
}

export const isVideo = (type: string) => type.startsWith("video/");
