# Nucleus control room

A standalone Vite + React + TypeScript admin application in `admin/`. Uses the main website’s local fonts and logo with the requested black/mint palette.

## Included in this first phase

- Supabase email/password login, verified sessions, server-owned admin allowlist, expiration handling, and sign out.
- Responsive sidebar with Dashboard, Events, Team Members, and Settings.
- Dashboard with real team counts and recent members. No production demo data.
- Team directory with search, role filtering, sorting, pagination, and add/edit/delete dialogs.
- Photo previews, JPG/PNG/WebP validation (5 MB maximum), pixel limits, resizing, metadata removal, and re-encoding before upload.
- Public image URLs saved in `team_members.photo_url`; managed paths in `photo_path`. Previous images are removed only after the database update succeeds. Failed writes attempt safe cleanup; cleanup failures are reported.
- Optimistic concurrency checks prevent silently overwriting or deleting a profile changed by another admin.
- Settings displays the current account. Events is an explicitly marked next-phase screen; event CRUD is not implemented in this first phase.

## Setup

1. From this folder, run `npm install`.
2. Keep the existing `.env.local`, or copy `.env.example` to `.env.local`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the project's URL and **public anon/publishable key**. Never put a service-role/secret key in a `VITE_` variable. Optionally set `VITE_PUBLIC_SITE_URL` for the sidebar's public website link. Restart Vite after changing environment variables.
3. Run `supabase/migrations/202610060001_admin_portal.sql` **once** in the Supabase SQL editor (or through your migration workflow). It creates the new `team_members` table, `team-photos` public bucket, private admin allowlist, RPC, and RLS policies. The migration is transactional and deliberately fails if these objects already exist, rather than replacing existing data or policies. It has not been applied to your live project by this implementation.
4. In Supabase Authentication → Users, create the administrator's email/password account. Then add its Auth user UUID through the SQL editor:

   ```sql
   insert into private.admin_users (user_id)
   values ('REPLACE_WITH_AUTH_USER_UUID');
   ```

5. Run `npm run dev` and sign in with that account. Authentication alone does not grant portal access. The `is_admin()` RPC must succeed before protected pages mount.

To revoke access, remove that user's row from `private.admin_users`. Database and storage write permissions stop immediately; the UI rechecks access on focus, visibility changes, and auth events. Disable public signup if this Supabase project is admin-only; if the public website also has accounts, the allowlist still excludes them from administration.

## Data contract and the main website

`team_members` contains `id`, `name`, `role`, `photo_url`, `photo_path`, `created_at`, and `updated_at`. Server defaults and a trigger own IDs/timestamps. Optional photos are represented by null URL/path pairs. Admin mutations only require name and role plus any changed photo fields.

The main website currently reads its existing site-data/API model, so this separate app does **not** automatically replace that data source or import existing members. Connect its public team loader to Supabase and map to its existing `Member` model:

```ts
const { data, error } = await supabase
  .from('team_members')
  .select('id, name, role, photo_url, created_at')
  .order('created_at', { ascending: true })

if (error) throw error
const team = data.map((member) => ({
  id: member.id,
  name: member.name,
  role: member.role,
  image: member.photo_url ?? undefined,
  createdAt: member.created_at,
  initials: member.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase(),
}))
```

Paginate that read if the directory can exceed Supabase's response limit. Public directory rows and public bucket images are intentionally readable for the main site; admin screens, account details, storage listing, and all mutations require admin access. Do not store private member information in this public directory. `private.admin_users` is inaccessible to browser clients, and no user-editable metadata controls authorization.

Database and storage mutations are separate requests. The policies protect referenced images from cleanup, but a lost connection can still leave an unused upload. The UI reports failed cleanup; check unused files in the bucket before deleting them manually. Browser image re-encoding improves the normal upload flow; the bucket enforces file size and MIME types for direct API requests.

## Deployment

Deploy `admin/` as its **own** application/root directory with `npm run build` and output directory `dist`. `vercel.json` supplies SPA route rewrites and production security headers, including CSP, frame protection, and HTTPS enforcement. For another host, reproduce these headers and route non-asset requests to `index.html`.

The CSP permits standard `*.supabase.co` / `*.supabase.in` endpoints. If your project uses a custom domain, add its exact origin to `connect-src` and `img-src`. Fonts and branding are self-hosted. Configure Supabase Auth rate limits and password policy for your deployment. The app uses the SDK's persistent browser session; protect the admin origin from untrusted scripts.

## Verification

```sh
npm run build
npm run lint
npm test
npx playwright install chromium
npm run test:browser
```

`npm test` executes the actual SQL migration and tests role grants, RLS, the private allowlist, storage boundaries, revocation, and photo cleanup in isolated Postgres via PGlite. Browser tests use a separate Vite process with a fake Supabase endpoint, test credentials, and intercepted requests. They never mutate the live project. They cover auth guards, sign-in/out, permission denial, CRUD, upload failure, edit conflicts, keyboard dialogs, mobile layout, and accessibility. Screenshots are written to ignored `test-results/`.
