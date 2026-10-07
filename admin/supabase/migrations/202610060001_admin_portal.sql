-- Apply once in the Supabase SQL editor or with the Supabase CLI.
-- This migration creates the NEW portal schema. It does not import legacy site data.
begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table private.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table private.admin_users enable row level security;
revoke all on private.admin_users from public, anon, authenticated;

create function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists(select 1 from private.admin_users where user_id = (select auth.uid())); $$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null check (name = btrim(name) and char_length(name) between 1 and 100),
  role text not null check (role = btrim(role) and char_length(role) between 1 and 100),
  photo_url text,
  photo_path text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint team_photo_pair check (
    (photo_url is null and photo_path is null) or
    (photo_url is not null and photo_path is not null
      and photo_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(webp|png)$'
      and photo_url ~ '^https://[^/]+/storage/v1/object/public/team-photos/'
      and right(photo_url, length(photo_path)) = photo_path)
  )
);
create index team_members_newest on public.team_members(created_at desc, id);
create function private.touch_team_member()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.created_at = old.created_at;
  new.updated_at = clock_timestamp();
  return new;
end;
$$;
revoke all on function private.touch_team_member() from public, anon, authenticated;
create trigger team_member_updated before update on public.team_members
for each row execute function private.touch_team_member();

alter table public.team_members enable row level security;
revoke all on public.team_members from public, anon, authenticated;
-- Published directory fields and public photos are intentionally readable by the main website.
grant select on public.team_members to anon, authenticated;
grant insert(name, role, photo_url, photo_path), update(name, role, photo_url, photo_path), delete on public.team_members to authenticated;
create policy "Public team directory" on public.team_members for select to anon, authenticated using (true);
create policy "Admins add members" on public.team_members for insert to authenticated with check ((select public.is_admin()));
create policy "Admins edit members" on public.team_members for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete members" on public.team_members for delete to authenticated using ((select public.is_admin()));

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('team-photos', 'team-photos', true, 5242880, array['image/webp', 'image/png']);

-- Unique, immutable uploads: no UPDATE policy, so existing objects cannot be overwritten.
create policy "Admins upload team photos" on storage.objects for insert to authenticated
with check (bucket_id = 'team-photos' and (select public.is_admin())
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(webp|png)$');
create policy "Admins read team storage metadata" on storage.objects for select to authenticated
using (bucket_id = 'team-photos' and (select public.is_admin()));
-- A failed client request may actually have committed. Never clean up a referenced photo.
create policy "Admins remove unused team photos" on storage.objects for delete to authenticated
using (bucket_id = 'team-photos' and (select public.is_admin())
  and not exists (select 1 from public.team_members where photo_path = storage.objects.name));

commit;
