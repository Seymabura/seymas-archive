export { mediaUrl, downloadUrl } from "./media";
import { getServerClient } from "./supabase";
import type { Category, Meme } from "./types";

export const MEME_COLUMNS =
  "id,no,title,tags,caption,storage_path,media_type,width,height,size_bytes,sha256,created_at,category_id";
export const CATEGORY_COLUMNS = "id,name,emoji,slug,position";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function fetchMemes(): Promise<{ memes: Meme[]; error: string | null }> {
  const sb = getServerClient();
  if (!sb) return { memes: [], error: null };
  const { data, error } = await sb
    .from("memes")
    .select(MEME_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) return { memes: [], error: error.message };
  return { memes: (data ?? []) as Meme[], error: null };
}

export async function fetchCategories(): Promise<Category[]> {
  const sb = getServerClient();
  if (!sb) return [];
  const { data, error } = await sb.from("categories").select(CATEGORY_COLUMNS).order("position").order("name");
  if (error) return [];
  return (data ?? []) as Category[];
}

export async function fetchMeme(id: string): Promise<Meme | null> {
  if (!UUID_RE.test(id)) return null;
  const sb = getServerClient();
  if (!sb) return null;
  const { data } = await sb.from("memes").select(MEME_COLUMNS).eq("id", id).maybeSingle();
  return (data as Meme | null) ?? null;
}
