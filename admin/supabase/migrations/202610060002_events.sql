-- This migration creates the events and event_photos tables and storage buckets for the admin panel.
begin;

create table public.events (
  id text primary key default gen_random_uuid()::text,
  title text not null check (title = btrim(title) and char_length(title) between 2 and 120),
  description text not null check (description = btrim(description) and char_length(description) between 20 and 1600),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text not null check (location = btrim(location) and char_length(location) between 2 and 200),
  category text not null check (category = btrim(category) and char_length(category) between 2 and 60),
  registration_url text,
  album_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_dates check (ends_at >= starts_at)
);

create index events_starts_at on public.events(starts_at desc, id);

create function private.touch_event()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.created_at = old.created_at;
  new.updated_at = clock_timestamp();
  return new;
end;
$$;
revoke all on function private.touch_event() from public, anon, authenticated;
create trigger event_updated before update on public.events
for each row execute function private.touch_event();

alter table public.events enable row level security;
revoke all on public.events from public, anon, authenticated;
grant select on public.events to anon, authenticated;
grant all on public.events to authenticated;

create policy "Public events" on public.events for select to anon, authenticated using (true);
create policy "Admins add events" on public.events for insert to authenticated with check ((select public.is_admin()));
create policy "Admins edit events" on public.events for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete events" on public.events for delete to authenticated using ((select public.is_admin()));


create table public.event_photos (
  id text primary key default gen_random_uuid()::text,
  event_id text not null references public.events(id) on delete cascade,
  name text not null,
  photo_url text not null,
  photo_path text not null unique,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  constraint event_photo_pair check (
    photo_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(webp|png|avif)$'
    and photo_url ~ '^https://[^/]+/storage/v1/object/public/event-photos/'
    and right(photo_url, length(photo_path)) = photo_path
  )
);

create index event_photos_event_id on public.event_photos(event_id, position);

alter table public.event_photos enable row level security;
revoke all on public.event_photos from public, anon, authenticated;
grant select on public.event_photos to anon, authenticated;
grant all on public.event_photos to authenticated;

create policy "Public event photos" on public.event_photos for select to anon, authenticated using (true);
create policy "Admins add event photos" on public.event_photos for insert to authenticated with check ((select public.is_admin()));
create policy "Admins edit event photos" on public.event_photos for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete event photos" on public.event_photos for delete to authenticated using ((select public.is_admin()));


insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('event-photos', 'event-photos', true, 10485760, array['image/webp', 'image/png', 'image/avif']);

create policy "Admins upload event photos" on storage.objects for insert to authenticated
with check (bucket_id = 'event-photos' and (select public.is_admin())
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(webp|png|avif)$');
create policy "Admins read event storage metadata" on storage.objects for select to authenticated
using (bucket_id = 'event-photos' and (select public.is_admin()));
create policy "Admins remove unused event photos" on storage.objects for delete to authenticated
using (bucket_id = 'event-photos' and (select public.is_admin())
  and not exists (select 1 from public.event_photos where photo_path = storage.objects.name));

commit;
