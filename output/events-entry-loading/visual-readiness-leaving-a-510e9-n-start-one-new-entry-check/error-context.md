# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual-readiness.spec.mjs >> leaving a waiting Events visit cancels it; returning can start one new entry check
- Location: tests\browser\visual-readiness.spec.mjs:115:1

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Events', exact: true })
    - locator resolved to <a href="/events" aria-label="Events" class="morph-nav__link">…</a>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not stable
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not stable
    - retrying click action
      - waiting 100ms
    3 × waiting for element to be visible, enabled and stable
      - element is not stable
    - retrying click action
      - waiting 500ms
    96 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <img src="/workshop_images/irrelevant.webp"/> intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to content" [ref=e4] [cursor=pointer]:
    - /url: "#main-content"
  - banner:
    - navigation "Main navigation":
      - dialog "Navigation menu":
        - generic [ref=e5]:
          - link "Nucleus home" [ref=e6] [cursor=pointer]:
            - /url: /
            - text: Nucleus
          - button "Website sound" [pressed] [ref=e7] [cursor=pointer]
          - button "Close menu" [expanded] [active] [ref=e12] [cursor=pointer]
        - generic [ref=e23]:
          - generic [ref=e24]:
            - list [ref=e25]:
              - listitem [ref=e26]:
                - link "Home" [ref=e27] [cursor=pointer]:
                  - /url: /
                  - generic [aria-hidden] [ref=e28]:
                    - generic [ref=e29]: H
                    - generic [ref=e30]: o
                    - generic [ref=e31]: m
                    - generic [ref=e32]: e
              - listitem [ref=e33]:
                - link "Events" [ref=e34] [cursor=pointer]:
                  - /url: /events
                  - generic [aria-hidden] [ref=e35]:
                    - generic [ref=e36]: E
                    - generic [ref=e37]: v
                    - generic [ref=e38]: e
                    - generic [ref=e39]: "n"
                    - generic [ref=e40]: t
                    - generic [ref=e41]: s
              - listitem [ref=e42]:
                - link "Live News" [ref=e43] [cursor=pointer]:
                  - /url: /news
                  - generic [aria-hidden] [ref=e44]:
                    - generic [ref=e45]: L
                    - generic [ref=e46]: i
                    - generic [ref=e47]: v
                    - generic [ref=e48]: e
                    - generic [ref=e50]: "N"
                    - generic [ref=e51]: e
                    - generic [ref=e52]: w
                    - generic [ref=e53]: s
              - listitem [ref=e54]:
                - link "Our work" [ref=e55] [cursor=pointer]:
                  - /url: /projects
                  - generic [aria-hidden] [ref=e56]:
                    - generic [ref=e57]: O
                    - generic [ref=e58]: u
                    - generic [ref=e59]: r
                    - generic [ref=e61]: w
                    - generic [ref=e62]: o
                    - generic [ref=e63]: r
                    - generic [ref=e64]: k
              - listitem [ref=e65]:
                - link "Achievements" [ref=e66] [cursor=pointer]:
                  - /url: /achievements
                  - generic [aria-hidden] [ref=e67]:
                    - generic [ref=e68]: A
                    - generic [ref=e69]: c
                    - generic [ref=e70]: h
                    - generic [ref=e71]: i
                    - generic [ref=e72]: e
                    - generic [ref=e73]: v
                    - generic [ref=e74]: e
                    - generic [ref=e75]: m
                    - generic [ref=e76]: e
                    - generic [ref=e77]: "n"
                    - generic [ref=e78]: t
                    - generic [ref=e79]: s
              - listitem [ref=e80]:
                - link "The people" [ref=e81] [cursor=pointer]:
                  - /url: /team
                  - generic [aria-hidden] [ref=e82]:
                    - generic [ref=e83]: T
                    - generic [ref=e84]: h
                    - generic [ref=e85]: e
                    - generic [ref=e87]: p
                    - generic [ref=e88]: e
                    - generic [ref=e89]: o
                    - generic [ref=e90]: p
                    - generic [ref=e91]: l
                    - generic [ref=e92]: e
              - listitem [ref=e93]:
                - link "Recruitment" [ref=e94] [cursor=pointer]:
                  - /url: /recruitment
                  - generic [aria-hidden] [ref=e96]:
                    - generic [ref=e97]: R
                    - generic [ref=e98]: e
                    - generic [ref=e99]: c
                    - generic [ref=e100]: r
                    - generic [ref=e101]: u
                    - generic [ref=e102]: i
                    - generic [ref=e103]: t
                    - generic [ref=e104]: m
                    - generic [ref=e105]: e
                    - generic [ref=e106]: "n"
                    - generic [ref=e107]: t
            - list "Social links" [ref=e108]:
              - listitem [ref=e109]:
                - link "Instagram" [ref=e110] [cursor=pointer]:
                  - /url: https://www.instagram.com/nucleus_sjec/
              - listitem [ref=e114]:
                - link "LinkedIn" [ref=e115] [cursor=pointer]:
                  - /url: https://www.linkedin.com/company/nucleus-sjec/
              - listitem [ref=e119]:
                - link "Email" [ref=e120] [cursor=pointer]:
                  - /url: mailto:nucleussjec@gmail.com
          - generic [ref=e124]:
            - generic [ref=e125]:
              - generic [ref=e126]: Made of many minds
              - generic [ref=e127]: © 2026 Nucleus SJEC
            - generic [ref=e128]:
              - generic [ref=e129]: The community
              - button "Stay connected" [ref=e130] [cursor=pointer]
  - main [ref=e134]:
    - generic [ref=e135]:
      - generic [ref=e136]:
        - text: Nucleus · SJEC
        - heading "Recruitment" [level=1] [ref=e137]
      - generic [ref=e138]:
        - heading "Registrations are closed" [level=2] [ref=e143]
        - paragraph [ref=e144]: We are not currently accepting new applications. Opening dates for the next intake will be posted here.
        - generic [ref=e145]:
          - link "Updates on Instagram" [ref=e146] [cursor=pointer]:
            - /url: https://www.instagram.com/nucleus_sjec/
          - link "Contact the team" [ref=e150] [cursor=pointer]:
            - /url: mailto:nucleussjec@gmail.com
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { readFile } from 'node:fs/promises';
  3   | const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
  4   | const screen = page => page.locator('[data-loading-screen]');
  5   | const settled = page => expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 15000 });
  6   | 
  7   | test.beforeEach(async ({ page }) => {
  8   |   await page.route('**/api/site', route => route.fulfill({ json: site }));
  9   |   await page.route('**/rest/v1/events?*', route => route.fulfill({ json: [] }));
  10  |   await page.route('**/rest/v1/team_members?*', route => route.fulfill({ json: site.team.map(member => ({ ...member, photo_url: member.image })) }));
  11  |   await page.route('**/rest/v1/site_settings?*', route => route.fulfill({ json: { recruitment_open: false } }));
  12  | });
  13  | 
  14  | async function watchEntries(page) {
  15  |   await page.evaluate(() => {
  16  |     window.loaderEntries = 0;
  17  |     new MutationObserver(records => {
  18  |       for (const record of records) for (const node of record.addedNodes) {
  19  |         if (node instanceof Element && (node.matches('[data-loading-screen]') || node.querySelector('[data-loading-screen]'))) window.loaderEntries++;
  20  |       }
  21  |     }).observe(document.body, { childList: true, subtree: true });
  22  |   });
  23  | }
  24  | async function navigate(page, name) {
  25  |   await page.getByRole('button', { name: 'Open menu', exact: true }).click();
> 26  |   await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name, exact: true }).click();
      |                                                                                                            ^ Error: locator.click: Test timeout of 60000ms exceeded.
  27  | }
  28  | async function holdPhotos(page) {
  29  |   let release;
  30  |   const held = new Promise(resolve => { release = resolve; });
  31  |   await page.route('**/workshop_images/**', async route => { await held; await route.continue().catch(() => {}); });
  32  |   return release;
  33  | }
  34  | 
  35  | for (const mobile of [false, true]) {
  36  |   test.describe(mobile ? 'phone entry' : 'desktop entry', () => {
  37  |     test.use({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mobile, hasTouch: mobile });
  38  |     test('entering Events shows one curtain for the initial covers, with no replay for later photos', async ({ page }) => {
  39  |       const release = await holdPhotos(page);
  40  |       try {
  41  |         await page.goto('/recruitment', { waitUntil: 'domcontentloaded' }); await settled(page);
  42  |         await watchEntries(page);
  43  |         await navigate(page, 'Events');
  44  |         await expect(page).toHaveURL(/events$/);
  45  |         await expect(screen(page)).toBeVisible();
  46  |         await expect(page.locator('.site-shell')).toHaveAttribute('inert');
  47  |         await page.waitForTimeout(400);
  48  |         expect(await page.evaluate(() => window.loaderEntries)).toBe(1);
  49  |         release(); await settled(page); await expect(screen(page)).toHaveCount(0);
  50  |         expect(await page.locator('.event-card__photo').first().evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  51  |         // An individual image entering the viewport later cannot restart the entry loader.
  52  |         await page.route('**/*entry-check=late', route => route.abort());
  53  |         await page.locator('.event-card__photo').last().evaluate(image => {
  54  |           image.removeAttribute('srcset'); image.src = '/brain-mark.svg?entry-check=late';
  55  |           image.scrollIntoView({ block: 'center' });
  56  |         });
  57  |         await page.waitForTimeout(500);
  58  |         await expect(screen(page)).toHaveCount(0);
  59  |         await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
  60  |         expect(await page.evaluate(() => window.loaderEntries)).toBe(1);
  61  |       } finally { release(); }
  62  |     });
  63  |   });
  64  | }
  65  | 
  66  | test('a direct Events visit keeps the same startup curtain until visible covers settle', async ({ page }) => {
  67  |   const release = await holdPhotos(page);
  68  |   try {
  69  |     await page.goto('/events', { waitUntil: 'domcontentloaded' });
  70  |     await expect(screen(page)).toBeVisible();
  71  |     await screen(page).evaluate(element => { element.dataset.initialCurtain = 'true'; });
  72  |     await page.waitForTimeout(2400);
  73  |     await expect(screen(page)).toHaveAttribute('data-initial-curtain', 'true');
  74  |     release(); await settled(page); await expect(screen(page)).toHaveCount(0);
  75  |   } finally { release(); }
  76  | });
  77  | 
  78  | test('slow and failed book photos never replay the full-screen loader or block the book controls', async ({ page }) => {
  79  |   await page.goto('/events', { waitUntil: 'domcontentloaded' }); await settled(page);
  80  |   await watchEntries(page);
  81  |   await page.getByRole('button', { name: 'Open Inauguration event book', exact: true }).click();
  82  |   await expect(page.locator('.nx-book-dialog')).toBeVisible();
  83  |   let release;
  84  |   const held = new Promise(resolve => { release = resolve; });
  85  |   await page.route('**/*readiness=held', async route => { await held; await route.abort().catch(() => {}); });
  86  |   try {
  87  |     await page.locator('.nx-book-dialog').evaluate(dialog => {
  88  |       const image = document.createElement('img'); image.src = '/brain-mark.svg?readiness=held';
  89  |       image.style.cssText = 'position:fixed;top:100px;left:100px;width:200px;height:200px;pointer-events:none';
  90  |       dialog.append(image);
  91  |     });
  92  |     await page.waitForTimeout(500);
  93  |     await expect(screen(page)).toHaveCount(0);
  94  |     await page.getByRole('button', { name: 'Next book page', exact: true }).click();
  95  |     await expect(page.locator('.station-book')).toHaveAttribute('data-book-progress', '1.000');
  96  |     release();
  97  |     await page.getByRole('button', { name: 'Close event', exact: true }).click();
  98  |     await expect(page.locator('.nx-book-dialog')).toHaveCount(0);
  99  |     await page.mouse.wheel(0, 400);
  100 |     await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  101 |     expect(await page.evaluate(() => window.loaderEntries)).toBe(0);
  102 |   } finally { release(); }
  103 | });
  104 | 
  105 | test('broken event covers finish the single entry check and leave navigation usable', async ({ page }) => {
  106 |   await page.route('**/workshop_images/**', route => route.abort());
  107 |   await page.route('**/workshops/**', route => route.abort());
  108 |   await page.goto('/events', { waitUntil: 'domcontentloaded' });
  109 |   await settled(page); await expect(screen(page)).toHaveCount(0);
  110 |   await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
  111 |   await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  112 |   await expect(page.getByRole('button', { name: 'Close menu', exact: true })).toBeVisible();
  113 | });
  114 | 
  115 | test('leaving a waiting Events visit cancels it; returning can start one new entry check', async ({ page }) => {
  116 |   const release = await holdPhotos(page);
  117 |   try {
  118 |     await page.goto('/recruitment', { waitUntil: 'domcontentloaded' }); await settled(page);
  119 |     await watchEntries(page);
  120 |     await navigate(page, 'Events'); await expect(screen(page)).toBeVisible();
  121 |     await page.goBack(); await expect(page).toHaveURL(/recruitment$/);
  122 |     await settled(page); await expect(screen(page)).toHaveCount(0);
  123 |     // Slow images on other pages cannot independently request the full-screen curtain.
  124 |     await page.evaluate(() => {
  125 |       const image = document.createElement('img'); image.src = '/workshop_images/irrelevant.webp';
  126 |       image.style.cssText = 'position:fixed;top:100px;left:100px;width:150px;height:150px'; document.body.append(image);
```