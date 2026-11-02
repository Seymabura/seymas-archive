export type Meme = {
  id: string;
  no: number;
  title: string;
  tags: string[];
  caption: string;
  storage_path: string;
  media_type: string;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  sha256: string | null;
  created_at: string;
  category_id: number | null;
};

export type Category = {
  id: number;
  name: string;
  emoji: string;
  slug: string;
  position: number;
};

export type SortKey = "new" | "old" | "az";
