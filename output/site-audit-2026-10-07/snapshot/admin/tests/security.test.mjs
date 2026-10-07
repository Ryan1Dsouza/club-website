import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

test('Postgres policies enforce the admin boundary and safe photo cleanup', async () => {
  const db = new PGlite()
  const admin = '11111111-1111-4111-8111-111111111111'
  const outsider = '22222222-2222-4222-8222-222222222222'
  const photo = `${admin}/33333333-3333-4333-8333-333333333333.webp`
  try {
    // Minimal Supabase-owned schemas. The actual migration and RLS run in real Postgres (WASM).
    await db.exec(`
      create role anon; create role authenticated;
      create schema auth; create schema storage;
      create table auth.users(id uuid primary key);
      insert into auth.users values ('${admin}'), ('${outsider}');
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
      create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text, name text);
      alter table storage.objects enable row level security;
      create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1,'/') $$;
      grant usage on schema auth, storage, public to anon, authenticated;
      grant select, insert, update, delete on storage.objects to authenticated;
    `)
    await db.exec(
      await readFile(
        new URL('../supabase/migrations/202610060001_admin_portal.sql', import.meta.url),
        'utf8',
      ),
    )
    await db.exec(`insert into private.admin_users(user_id) values ('${admin}')`)
    const asUser = async (role, id = '') => {
      await db.exec('reset role')
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id])
      await db.exec(`set role ${role}`)
    }
    await asUser('anon')
    assert.equal((await db.query('select * from public.team_members')).rows.length, 0)
    await assert.rejects(
      db.query("insert into public.team_members(name,role) values ('Intruder','Owner')"),
      /permission denied/,
    )
    await assert.rejects(db.query('select public.is_admin()'), /permission denied/)
    await asUser('authenticated', outsider)
    assert.equal((await db.query('select public.is_admin() as allowed')).rows[0].allowed, false)
    await assert.rejects(db.query('select * from private.admin_users'), /permission denied/)
    await assert.rejects(
      db.query('insert into private.admin_users(user_id) values ($1)', [outsider]),
      /permission denied/,
    )
    await assert.rejects(
      db.query("insert into public.team_members(name,role) values ('Intruder','Owner')"),
      /row-level security/,
    )
    await assert.rejects(
      db.query("insert into storage.objects(bucket_id,name) values ('team-photos',$1)", [photo]),
      /row-level security/,
    )
    await asUser('authenticated', admin)
    assert.equal((await db.query('select public.is_admin() as allowed')).rows[0].allowed, true)
    await assert.rejects(
      db.query("insert into storage.objects(bucket_id,name) values ('other-bucket',$1)", [photo]),
      /row-level security/,
    )
    await assert.rejects(
      db.query("insert into storage.objects(bucket_id,name) values ('team-photos',$1)", [
        photo.replace(admin, outsider),
      ]),
      /row-level security/,
    )
    await db.query("insert into storage.objects(bucket_id,name) values ('team-photos',$1)", [photo])
    const member = (
      await db.query(
        "insert into public.team_members(name,role,photo_url,photo_path) values ('Alex Test','Design Lead',$1,$2) returning *",
        [`https://test.supabase.co/storage/v1/object/public/team-photos/${photo}`, photo],
      )
    ).rows[0]
    assert.equal(
      (await db.query('delete from storage.objects where name=$1 returning *', [photo])).rows
        .length,
      0,
      'Referenced photos cannot be deleted',
    )
    assert.equal(
      (
        await db.query("update storage.objects set name='overwrite' where name=$1 returning *", [
          photo,
        ])
      ).rows.length,
      0,
      'Existing photos cannot be overwritten',
    )
    await assert.rejects(
      db.query("insert into public.team_members(name,role) values ('   ','Owner')"),
      /check constraint/,
    )
    await assert.rejects(
      db.query('update public.team_members set created_at=now()'),
      /permission denied/,
    )
    await asUser('authenticated', outsider)
    assert.equal(
      (await db.query("update public.team_members set name='Hijacked' returning *")).rows.length,
      0,
    )
    assert.equal((await db.query('delete from public.team_members returning *')).rows.length, 0)
    await asUser('anon')
    assert.equal(
      (await db.query('select name,role,photo_url from public.team_members')).rows[0].name,
      'Alex Test',
      'Public website can read directory data',
    )
    await asUser('authenticated', admin)
    const update = (
      await db.query(
        "update public.team_members set role='President' where id=$1 and updated_at=$2 returning *",
        [member.id, member.updated_at],
      )
    ).rows[0]
    assert.ok(update)
    assert.notEqual(update.updated_at, member.updated_at)
    assert.equal(
      (
        await db.query(
          "update public.team_members set role='Stale overwrite' where id=$1 and updated_at=$2 returning *",
          [member.id, member.updated_at],
        )
      ).rows.length,
      0,
    )
    await db.query('delete from public.team_members where id=$1', [member.id])
    assert.equal(
      (await db.query('delete from storage.objects where name=$1 returning *', [photo])).rows
        .length,
      1,
    )
    await db.exec('reset role')
    await db.query('delete from private.admin_users where user_id=$1', [admin])
    await asUser('authenticated', admin)
    assert.equal((await db.query('select public.is_admin() as allowed')).rows[0].allowed, false)
    await assert.rejects(
      db.query("insert into public.team_members(name,role) values ('Revoked','Owner')"),
      /row-level security/,
    )
  } finally {
    await db.close()
  }
})
