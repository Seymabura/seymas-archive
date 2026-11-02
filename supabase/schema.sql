-- ============================================================
-- Seyma's Archive — veritabanı şeması
-- Supabase > SQL Editor > New query içine yapıştırıp "Run" de.
-- Tekrar çalıştırmak güvenlidir (var olanı bozmaz).
-- ============================================================

-- 1) Yöneticiler: sadece bu listedeki e-postalar caps ekleyip silebilir.
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;
-- admins tablosuna hiçbir politika eklemiyoruz: dışarıdan kimse okuyamaz, yazamaz.

-- Giriş yapan kişi yönetici mi? (Politikalar bu fonksiyonu kullanır.)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- 2) Caps tablosu
create table if not exists public.memes (
  id           uuid primary key default gen_random_uuid(),
  no           bigint generated always as identity unique,   -- arşiv numarası: No. 0001
  title        text not null check (char_length(title) between 1 and 120),
  tags         text[] not null default '{}',
  caption      text not null default '' check (char_length(caption) <= 1000),  -- görseldeki yazı
  storage_path text not null,
  media_type   text not null,
  width        integer,
  height       integer,
  size_bytes   bigint,
  sha256       text unique,                                   -- dosya parmak izi (kopya kontrolü)
  created_at   timestamptz not null default now()
);
create index if not exists memes_tags_idx on public.memes using gin (tags);
create index if not exists memes_created_idx on public.memes (created_at desc);

alter table public.memes enable row level security;

drop policy if exists "herkes okur" on public.memes;
create policy "herkes okur" on public.memes
  for select to anon, authenticated using (true);

drop policy if exists "yonetici ekler" on public.memes;
create policy "yonetici ekler" on public.memes
  for insert to authenticated with check (public.is_admin());

drop policy if exists "yonetici duzenler" on public.memes;
create policy "yonetici duzenler" on public.memes
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "yonetici siler" on public.memes;
create policy "yonetici siler" on public.memes
  for delete to authenticated using (public.is_admin());

-- 3) Görsel deposu: herkese açık okunur, sadece yönetici yükler.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memes', 'memes', true, 20971520,
  array['image/png','image/jpeg','image/gif','image/webp','video/mp4','video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Not: "varsa üzerine yaz" (upsert) yüklemesi okuma iznini de gerektirir.
drop policy if exists "yonetici dosya okur" on storage.objects;
create policy "yonetici dosya okur" on storage.objects
  for select to authenticated using (bucket_id = 'memes' and public.is_admin());

drop policy if exists "yonetici dosya yukler" on storage.objects;
create policy "yonetici dosya yukler" on storage.objects
  for insert to authenticated with check (bucket_id = 'memes' and public.is_admin());

drop policy if exists "yonetici dosya gunceller" on storage.objects;
create policy "yonetici dosya gunceller" on storage.objects
  for update to authenticated using (bucket_id = 'memes' and public.is_admin());

drop policy if exists "yonetici dosya siler" on storage.objects;
create policy "yonetici dosya siler" on storage.objects
  for delete to authenticated using (bucket_id = 'memes' and public.is_admin());

-- ============================================================
-- 4) SON ADIM: Kendi e-postanı yönetici yap.
-- Aşağıdaki satırda e-postayı kendi adresinle değiştirip ayrıca çalıştır:
--
-- insert into public.admins (email) values ('SENIN_EMAILIN@ornek.com') on conflict do nothing;
-- ============================================================

-- ============================================================
-- 5) Sıfırdan kurulumda bunun ardından 002_kategoriler.sql dosyasını da çalıştır.
-- ============================================================
