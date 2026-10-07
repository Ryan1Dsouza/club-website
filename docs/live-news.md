# Live News

The public bulletin is available at `/news` and `/live-news`, with `/news` as the canonical URL and a Live News link in the main menu. It reads Supabase directly through the existing `src/lib/supabase.ts` client. It has no publishing, upload, edit, delete, or sign-in controls.

## Setup

1. Run [`supabase/live-news.sql`](../supabase/live-news.sql) in your project's Supabase SQL Editor. It creates the table, chronological index, public `news-posters` bucket, and row-level security policies. This file is supplied for setup; the website does not execute it.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the main site's `.env.local` and hosting build environment. Use the project's publishable/anon key. Restart Vite after local changes and rebuild production after deployment configuration changes. The Admin Portal should use the same project.
3. Give your existing Admin Portal user `app_metadata.role = "admin"` through trusted administration. An optional SQL example is included at the end of the setup file. Sign in again to refresh the user's token. Ordinary authenticated users can read news but cannot write it; editable `user_metadata` does not grant admin access.
4. From the separate Admin Portal, upload a poster to `news-posters`, get its public URL with `supabase.storage.from('news-posters').getPublicUrl(path)`, and store `data.publicUrl` in `live_news.image_url` along with the other fields. The public page fetches updates on each visit and on error retry; it does not subscribe to real-time changes.

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | UUID, generated | Stable card identifier |
| `title` | Text, required | News headline, up to 200 characters |
| `description` | Text | Short news description; plain text, not HTML |
| `image_url` | Nullable text | Full HTTPS public Supabase Storage URL |
| `date` | Date | Display date, defaults to today |
| `created_at` | Timestamp with time zone | Publication timestamp, defaults to now; newest first |

All records in `live_news` are public. The provided schema does not include a draft state. Missing or unavailable posters display the Nucleus mark; date-only values render consistently without shifting to the previous day in another timezone. Missing configuration, a failed query, or a 15-second timeout produces the retry state. Cleanup cancels requests when leaving the page.

The setup is intended for a new table/bucket with these names. `create table if not exists` does not migrate an existing incompatible schema, and existing policies are not removed except for this script's named policies. If `news-posters` already exists, keep it public for public poster URLs. The Express production CSP permits `https://*.supabase.co` for API requests and posters; add your exact origin if using a Supabase custom domain.

## Components and styling

- `src/pages/LiveNews.tsx`: fetch lifecycle, skeletons, retry/empty states, and the responsive grid.
- `src/components/news/NewsCard.tsx`: reusable poster, date, headline, description, and image fallback.
- `src/lib/live-news.ts`: typed read query, ordered by `created_at DESC, id DESC`.
- `src/pages/live-news.css` and `src/components/news/news-card.css`: home page palette variables, one/two/three-column layout, and hover effects with reduced-motion support. The page shares the home page backdrop and ripple grid; headings and empty states use short, functional copy.

The supplied Supabase credentials returned HTTP 401 during initial verification. Browser tests use intercepted Supabase responses; a live database connection must be checked after valid project credentials and the SQL setup are in place.

Run `npm run build`, `npm test`, and `npx playwright test tests/browser/live-news.spec.mjs` to verify.
