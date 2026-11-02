-- ============================================================
-- Seyma's Archive — Güncelleme 2: Kategoriler + 50 MB video
-- Supabase > SQL Editor içine yapıştırıp "Run" de.
-- Tekrar çalıştırmak güvenlidir.
-- ============================================================

-- 1) Kategori tablosu
create table if not exists public.categories (
  id         bigint generated always as identity primary key,
  name       text not null check (char_length(name) between 1 and 40),
  emoji      text not null default '✨' check (char_length(emoji) <= 16),
  slug       text not null unique check (slug ~ '^[a-z0-9-]{1,40}$'),
  position   integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;

drop policy if exists "herkes kategorileri okur" on public.categories;
create policy "herkes kategorileri okur" on public.categories
  for select to anon, authenticated using (true);

drop policy if exists "yonetici kategori ekler" on public.categories;
create policy "yonetici kategori ekler" on public.categories
  for insert to authenticated with check (public.is_admin());

drop policy if exists "yonetici kategori duzenler" on public.categories;
create policy "yonetici kategori duzenler" on public.categories
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "yonetici kategori siler" on public.categories;
create policy "yonetici kategori siler" on public.categories
  for delete to authenticated using (public.is_admin());

-- 2) Her caps bir kategoriye bağlanabilir (kategori silinirse caps kategorisiz kalır).
alter table public.memes
  add column if not exists category_id bigint references public.categories(id) on delete set null;
create index if not exists memes_category_idx on public.memes (category_id);

-- 3) Başlangıç kategorileri (yönetim panelinden değiştirebilirsin)
insert into public.categories (name, emoji, slug, position) values
  ('Tepki',        '😮', 'tepki',     1),
  ('Hayvanlar',    '🐱', 'hayvanlar', 2),
  ('Okul',         '🎓', 'okul',      3),
  ('İş hayatı',    '💼', 'is-hayati', 4),
  ('Aşk',          '💔', 'ask',       5),
  ('Aile',         '🏠', 'aile',      6),
  ('Futbol',       '⚽', 'futbol',    7),
  ('Dizi & Film',  '🎬', 'dizi-film', 8),
  ('Yemek',        '🍕', 'yemek',     9),
  ('Gündem',       '📰', 'gundem',   10)
on conflict (slug) do nothing;

-- 4) Video için dosya sınırını 50 MB'a çıkar (Supabase ücretsiz planının üst sınırı).
update storage.buckets set file_size_limit = 52428800 where id = 'memes';
