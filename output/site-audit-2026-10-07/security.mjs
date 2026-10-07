import { readFile, writeFile } from 'node:fs/promises';
import { PGlite } from '../../admin/node_modules/@electric-sql/pglite/dist/index.js';
const db = new PGlite();
const result = {};
try {
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key);
    insert into auth.users values ('11111111-1111-4111-8111-111111111111'), ('22222222-2222-4222-8222-222222222222');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1,'/') $$;
    grant usage on schema auth,storage,public to anon,authenticated;
    grant select,insert,update,delete on storage.objects to authenticated;
  `);
  for (const name of ['202610060001_admin_portal.sql','202610060002_events.sql']) await db.exec(await readFile(`admin/supabase/migrations/${name}`, 'utf8'));
  await db.exec(`
    insert into private.admin_users values ('11111111-1111-4111-8111-111111111111', now());
    insert into public.events(id,title,description,starts_at,ends_at,location,category,published) values ('draft-test','Private draft','This is an unpublished local security audit fixture.','2026-11-01','2026-11-02','Local fixture','Workshop',false);
    insert into public.event_photos(event_id,name,photo_path,photo_url) values ('draft-test','private.webp','11111111-1111-4111-8111-111111111111/33333333-3333-4333-8333-333333333333.webp','https://example.supabase.co/storage/v1/object/public/event-photos/11111111-1111-4111-8111-111111111111/33333333-3333-4333-8333-333333333333.webp');
  `);
  result.publicPhotoBucket = (await db.query("select public from storage.buckets where id='event-photos'")).rows[0].public;
  await db.exec('set role anon');
  result.anonymousDraftRows = (await db.query('select id,published from public.events')).rows;
  result.anonymousDraftPhotoRows = (await db.query('select event_id,name from public.event_photos')).rows;
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", ['22222222-2222-4222-8222-222222222222']);
  await db.exec('set role authenticated');
  result.outsiderIsAdmin = (await db.query('select public.is_admin() as value')).rows[0].value;
  result.outsiderTruncatePrivileges = (await db.query("select has_table_privilege('public.events','TRUNCATE') as events,has_table_privilege('public.event_photos','TRUNCATE') as photos")).rows[0];
  try { await db.query("insert into public.events(title,description,starts_at,ends_at,location,category) values ('Intruder event','This should never be inserted by a non-admin.','2026-11-01','2026-11-02','Local','Workshop')"); result.outsiderInsertBlocked = false; } catch(e) { result.outsiderInsertBlocked = /row-level security/.test(e.message); }
  result.outsiderUpdateRows = (await db.query("update public.events set title='Changed draft' where id='draft-test' returning id")).rows.length;
  result.outsiderDeleteRows = (await db.query("delete from public.events where id='draft-test' returning id")).rows.length;
  console.log(JSON.stringify(result,null,2));
  await writeFile('output/site-audit-2026-10-07/security.json',JSON.stringify(result,null,2));
} finally { await db.close(); }
