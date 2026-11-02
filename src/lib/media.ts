import { BUCKET, SUPABASE_URL } from "./config";
import type { Meme } from "./types";

export function mediaUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export function downloadUrl(m: Pick<Meme, "storage_path" | "title" | "no" | "media_type">): string {
  const ext = m.media_type.split("/")[1]?.replace("jpeg", "jpg") ?? "bin";
  const name = `seymas-archive-${String(m.no).padStart(4, "0")}.${ext}`;
  return `${mediaUrl(m.storage_path)}?download=${encodeURIComponent(name)}`;
}
