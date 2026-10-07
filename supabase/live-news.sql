-- Run in the Supabase SQL Editor for the same project used by both websites.
-- All rows in this table are public news. Keep unpublished drafts elsewhere.
begin;

create table if not exists public.live_news (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  description text not null default '' check (char_length(description) <= 4000),
  image_url text check (image_url is null or image_url ~ '^https://'),
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists live_news_created_at_idx
  on public.live_news (created_at desc, id desc);

alter table public.live_news enable row level security;

revoke all on public.live_news from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.live_news to anon, authenticated;
grant insert, update, delete on public.live_news to authenticated;

drop policy if exists "live_news_public_read" on public.live_news;
create policy "live_news_public_read" on public.live_news
  for select to anon, authenticated using (true);

-- app_metadata is set by a trusted server or the Supabase dashboard, never
-- by a user's editable user_metadata or a browser-side service role key.
drop policy if exists "live_news_admin_insert" on public.live_news;
create policy "live_news_admin_insert" on public.live_news
  for insert to authenticated
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "live_news_admin_update" on public.live_news;
create policy "live_news_admin_update" on public.live_news
  for update to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "live_news_admin_delete" on public.live_news;
create policy "live_news_admin_delete" on public.live_news
  for delete to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Public poster URLs work without expiring signed URLs or viewer sign-in.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('news-posters', 'news-posters', true, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])
on conflict (id) do nothing;

drop policy if exists "news_posters_public_read" on storage.objects;
create policy "news_posters_public_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'news-posters');

drop policy if exists "news_posters_admin_insert" on storage.objects;
create policy "news_posters_admin_insert" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'news-posters'
    and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

drop policy if exists "news_posters_admin_update" on storage.objects;
create policy "news_posters_admin_update" on storage.objects
  for update to authenticated using (
    bucket_id = 'news-posters'
    and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  ) with check (
    bucket_id = 'news-posters'
    and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

drop policy if exists "news_posters_admin_delete" on storage.objects;
create policy "news_posters_admin_delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'news-posters'
    and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

commit;

-- Optional: promote an existing Admin Portal user. Replace the UUID and run
-- this separately as the database owner. The user must sign in again afterward.
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
--   || '{"role":"admin"}'::jsonb
-- where id = 'REPLACE_WITH_ADMIN_USER_UUID'::uuid;
