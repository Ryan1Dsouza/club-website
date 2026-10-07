# Achievements page

The page lives at `/achievements` and is linked from the main menu. It takes the
reference's member profiles, category filtering, and name search, with Nucleus's
home page palette, background and ripple grid, with a custom rosette and numbered
member cards. Headings and controls use direct labels; decorative slogans are omitted.

## Preview content

The user requested clearly labelled sample achievements for the design preview.
The six profile cards use existing team names and portraits; every achievement
is illustrative. The page banner, each card, and the detail dialog identify this.
The route is `noindex,nofollow` and is intentionally absent from the sitemap.

The content is in `src/content/achievements.ts`. Populate `memberAchievements`
with confirmed results, using existing team IDs in `memberIds`. The component
then replaces the samples with those records automatically. A result shared by
several people can list each person's ID. Optional `href` values must be HTTPS
links to an official result or project. Empty or missing portraits use initials.

Before making the real archive indexable, update the preview description and
robots rule in `shared/page-meta.ts` and add the route to `public/sitemap.xml`.
No new backend fields, admin screens, or dependencies were introduced.

## Verification

`npx playwright test tests/browser/achievements.spec.mjs` covers four viewport
sizes, accessibility, category + search combinations, empty results, missing
portraits, keyboard dialogs, menu navigation, and reduced motion. The backend
production-render test also checks this route and its metadata.
