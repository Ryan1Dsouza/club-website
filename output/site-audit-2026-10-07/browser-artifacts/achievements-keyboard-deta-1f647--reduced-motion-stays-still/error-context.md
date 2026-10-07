# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: achievements.spec.mjs >> keyboard details restore focus, menu route works, and reduced motion stays still
- Location: tests\browser\achievements.spec.mjs:69:1

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.focus: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'View Prajwal Gaonkar\'s achievements' })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to content" [ref=e4] [cursor=pointer]:
    - /url: "#main-content"
  - banner:
    - navigation "Main navigation":
      - generic:
        - generic [ref=e5]:
          - link "Nucleus home" [ref=e6] [cursor=pointer]:
            - /url: /
            - text: Nucleus
          - button "Open menu" [ref=e7] [cursor=pointer]
        - generic [aria-hidden]:
          - generic:
            - generic:
              - list:
                - listitem:
                  - link:
                    - /url: /
                    - generic [aria-hidden]:
                      - generic: H
                      - generic: o
                      - generic: m
                      - generic: e
                - listitem:
                  - link:
                    - /url: /events
                    - generic [aria-hidden]:
                      - generic: E
                      - generic: v
                      - generic: e
                      - generic: "n"
                      - generic: t
                      - generic: s
                - listitem:
                  - link:
                    - /url: /news
                    - generic [aria-hidden]:
                      - generic: L
                      - generic: i
                      - generic: v
                      - generic: e
                      - generic: "N"
                      - generic: e
                      - generic: w
                      - generic: s
                - listitem:
                  - link:
                    - /url: /projects
                    - generic [aria-hidden]:
                      - generic: O
                      - generic: u
                      - generic: r
                      - generic: w
                      - generic: o
                      - generic: r
                      - generic: k
                - listitem:
                  - link:
                    - /url: /achievements
                    - generic [aria-hidden]:
                      - generic: A
                      - generic: c
                      - generic: h
                      - generic: i
                      - generic: e
                      - generic: v
                      - generic: e
                      - generic: m
                      - generic: e
                      - generic: "n"
                      - generic: t
                      - generic: s
                - listitem:
                  - link:
                    - /url: /team
                    - generic [aria-hidden]:
                      - generic: T
                      - generic: h
                      - generic: e
                      - generic: p
                      - generic: e
                      - generic: o
                      - generic: p
                      - generic: l
                      - generic: e
              - list:
                - listitem:
                  - link:
                    - /url: https://www.instagram.com/nucleus_sjec/
                    - text: Instagram
                - listitem:
                  - link:
                    - /url: https://www.linkedin.com/company/nucleus-sjec/
                    - text: LinkedIn
                - listitem:
                  - link:
                    - /url: https://github.com/nucleus-sjec
                    - text: GitHub
                - listitem:
                  - link:
                    - /url: mailto:nucleussjec@gmail.com
                    - text: Email
            - generic:
              - generic:
                - generic: Made of many minds
                - generic: © 2026 Nucleus SJEC
              - generic:
                - generic: The community
                - button: Stay connected
  - main [ref=e11]:
    - generic [ref=e13]:
      - heading "Achievements" [level=1] [ref=e15]
      - region [ref=e99]:
        - heading "Member achievements" [level=2] [ref=e100]
        - generic [ref=e101]:
          - group "Filter achievements by category" [ref=e102]:
            - button "All 06" [pressed] [ref=e103] [cursor=pointer]:
              - text: All
              - generic [ref=e104]: "06"
            - button "Hackathons 05" [ref=e105] [cursor=pointer]:
              - text: Hackathons
              - generic [ref=e106]: "05"
            - button "Open source 04" [ref=e107] [cursor=pointer]:
              - text: Open source
              - generic [ref=e108]: "04"
            - button "Programming 03" [ref=e109] [cursor=pointer]:
              - text: Programming
              - generic [ref=e110]: "03"
            - button "Research 02" [ref=e111] [cursor=pointer]:
              - text: Research
              - generic [ref=e112]: "02"
          - searchbox "Search achievements or members" [ref=e117]
        - generic [ref=e118]: 06 members
        - generic [ref=e120]:
          - article [ref=e121]:
            - generic [ref=e122]:
              - generic [ref=e123]: No. 01
              - generic [ref=e124]: SAMPLE RECORD
            - generic [ref=e128]:
              - generic [ref=e129]:
                - generic [aria-hidden] [ref=e130]: DR
                - img "Deona Rego" [ref=e131]
              - generic [ref=e132]:
                - generic [ref=e133]: Event Lead
                - heading "Deona Rego" [level=3] [ref=e134]
            - list [ref=e135]:
              - listitem [ref=e136]:
                - generic [aria-hidden] [ref=e137]: ✳
                - generic [ref=e138]:
                  - generic [ref=e139]:
                    - text: Campus Buildathon
                    - generic [ref=e140]: ’26
                  - generic [ref=e141]: Winner
              - listitem [ref=e142]:
                - generic [aria-hidden] [ref=e143]: ↗
                - generic [ref=e144]:
                  - generic [ref=e145]:
                    - text: Open Source Fellowship
                    - generic [ref=e146]: ’26
                  - generic [ref=e147]: Selected contributor
              - listitem [ref=e148]:
                - generic [aria-hidden] [ref=e149]: "#"
                - generic [ref=e150]:
                  - generic [ref=e151]:
                    - text: Code Sprint
                    - generic [ref=e152]: ’25
                  - generic [ref=e153]: Top 10
            - button "View Deona Rego's achievements" [ref=e154] [cursor=pointer]:
              - generic [ref=e155]: 03 sample achievements
          - article [ref=e160]:
            - generic [ref=e161]:
              - generic [ref=e162]: No. 02
              - generic [ref=e163]: SAMPLE RECORD
            - generic [ref=e167]:
              - generic [ref=e168]:
                - generic [aria-hidden] [ref=e169]: DC
                - img "Dinol Castelino" [ref=e170]
              - generic [ref=e171]:
                - generic [ref=e172]: Vice President
                - heading "Dinol Castelino" [level=3] [ref=e173]
            - list [ref=e174]:
              - listitem [ref=e175]:
                - generic [aria-hidden] [ref=e176]: "#"
                - generic [ref=e177]:
                  - generic [ref=e178]:
                    - text: Code Sprint
                    - generic [ref=e179]: ’25
                  - generic [ref=e180]: Top 10
              - listitem [ref=e181]:
                - generic [aria-hidden] [ref=e182]: ✳
                - generic [ref=e183]:
                  - generic [ref=e184]:
                    - text: Campus Buildathon
                    - generic [ref=e185]: ’26
                  - generic [ref=e186]: Winner
            - button "View Dinol Castelino's achievements" [ref=e187] [cursor=pointer]:
              - generic [ref=e188]: 02 sample achievements
          - article [ref=e193]:
            - generic [ref=e194]:
              - generic [ref=e195]: No. 03
              - generic [ref=e196]: SAMPLE RECORD
            - generic [ref=e200]:
              - generic [ref=e201]:
                - generic [aria-hidden] [ref=e202]: JM
                - img "Joylin Mathias" [ref=e203]
              - generic [ref=e204]:
                - generic [ref=e205]: Secretary
                - heading "Joylin Mathias" [level=3] [ref=e206]
            - list [ref=e207]:
              - listitem [ref=e208]:
                - generic [aria-hidden] [ref=e209]: ✦
                - generic [ref=e210]:
                  - generic [ref=e211]:
                    - text: Student Research Forum
                    - generic [ref=e212]: ’26
                  - generic [ref=e213]: Paper presented
              - listitem [ref=e214]:
                - generic [aria-hidden] [ref=e215]: ✳
                - generic [ref=e216]:
                  - generic [ref=e217]:
                    - text: Build for Good
                    - generic [ref=e218]: ’25
                  - generic [ref=e219]: Finalist
              - listitem [ref=e220]:
                - generic [aria-hidden] [ref=e221]: ↗
                - generic [ref=e222]:
                  - generic [ref=e223]:
                    - text: Open Source Fellowship
                    - generic [ref=e224]: ’26
                  - generic [ref=e225]: Selected contributor
            - button "View Joylin Mathias's achievements" [ref=e226] [cursor=pointer]:
              - generic [ref=e227]: 03 sample achievements
          - article [ref=e232]:
            - generic [ref=e233]:
              - generic [ref=e234]: No. 04
              - generic [ref=e235]: SAMPLE RECORD
            - generic [ref=e239]:
              - generic [ref=e240]:
                - generic [aria-hidden] [ref=e241]: K
                - img "Karthik" [ref=e242]
              - generic [ref=e243]:
                - generic [ref=e244]: Treasurer
                - heading "Karthik" [level=3] [ref=e245]
            - list [ref=e246]:
              - listitem [ref=e247]:
                - generic [aria-hidden] [ref=e248]: ↗
                - generic [ref=e249]:
                  - generic [ref=e250]:
                    - text: Open Source Fellowship
                    - generic [ref=e251]: ’26
                  - generic [ref=e252]: Selected contributor
              - listitem [ref=e253]:
                - generic [aria-hidden] [ref=e254]: ↗
                - generic [ref=e255]:
                  - generic [ref=e256]:
                    - text: Community Code Fest
                    - generic [ref=e257]: ’25
                  - generic [ref=e258]: Project contributor
              - listitem [ref=e259]:
                - generic [aria-hidden] [ref=e260]: ✳
                - generic [ref=e261]:
                  - generic [ref=e262]:
                    - text: Build for Good
                    - generic [ref=e263]: ’25
                  - generic [ref=e264]: Finalist
            - button "View Karthik's achievements" [ref=e265] [cursor=pointer]:
              - generic [ref=e266]: 03 sample achievements
          - article [ref=e271]:
            - generic [ref=e272]:
              - generic [ref=e273]: No. 05
              - generic [ref=e274]: SAMPLE RECORD
            - generic [ref=e278]:
              - generic [ref=e279]:
                - generic [aria-hidden] [ref=e280]: ML
                - img "Manvitha Lewis" [ref=e281]
              - generic [ref=e282]:
                - generic [ref=e283]: Discipline Head
                - heading "Manvitha Lewis" [level=3] [ref=e284]
            - list [ref=e285]:
              - listitem [ref=e286]:
                - generic [aria-hidden] [ref=e287]: ✳
                - generic [ref=e288]:
                  - generic [ref=e289]:
                    - text: Build for Good
                    - generic [ref=e290]: ’25
                  - generic [ref=e291]: Finalist
              - listitem [ref=e292]:
                - generic [aria-hidden] [ref=e293]: ✦
                - generic [ref=e294]:
                  - generic [ref=e295]:
                    - text: Student Research Forum
                    - generic [ref=e296]: ’26
                  - generic [ref=e297]: Paper presented
            - button "View Manvitha Lewis's achievements" [ref=e298] [cursor=pointer]:
              - generic [ref=e299]: 02 sample achievements
          - article [ref=e304]:
            - generic [ref=e305]:
              - generic [ref=e306]: No. 06
              - generic [ref=e307]: SAMPLE RECORD
            - generic [ref=e311]:
              - generic [ref=e312]:
                - generic [aria-hidden] [ref=e313]: M
                - img "Mohit" [ref=e314]
              - generic [ref=e315]:
                - generic [ref=e316]: AI & ML Lead
                - heading "Mohit" [level=3] [ref=e317]
            - list [ref=e318]:
              - listitem [ref=e319]:
                - generic [aria-hidden] [ref=e320]: ↗
                - generic [ref=e321]:
                  - generic [ref=e322]:
                    - text: Community Code Fest
                    - generic [ref=e323]: ’25
                  - generic [ref=e324]: Project contributor
              - listitem [ref=e325]:
                - generic [aria-hidden] [ref=e326]: "#"
                - generic [ref=e327]:
                  - generic [ref=e328]:
                    - text: Code Sprint
                    - generic [ref=e329]: ’25
                  - generic [ref=e330]: Top 10
            - button "View Mohit's achievements" [ref=e331] [cursor=pointer]:
              - generic [ref=e332]: 02 sample achievements
      - generic [ref=e337]:
        - link "Submit an achievement" [ref=e338] [cursor=pointer]:
          - /url: mailto:nucleussjec@gmail.com?subject=Nucleus%20achievement
        - link "Our team" [ref=e342] [cursor=pointer]:
          - /url: /team
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import AxeBuilder from '@axe-core/playwright';
  3   | import { readFile } from 'node:fs/promises';
  4   | 
  5   | const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
  6   | async function openAchievements(page, data = site) {
  7   |   await page.emulateMedia({ reducedMotion: 'reduce' });
  8   |   await page.route('**/api/site', route => route.fulfill({ json: data }));
  9   |   await page.goto('/achievements');
  10  |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  11  |   await expect(page.locator('[data-loading-screen]')).toHaveCount(0);
  12  | }
  13  | 
  14  | for (const width of [1440, 768, 390, 320]) {
  15  |   test(`achievement preview fits and is accessible at ${width}px`, async ({ page }, info) => {
  16  |     await page.setViewportSize({ width, height: 900 });
  17  |     const errors = [];
  18  |     page.on('pageerror', error => errors.push(error.message));
  19  |     await openAchievements(page);
  20  |     await expect(page.locator('h1')).toHaveCount(1);
  21  |     await expect(page).toHaveTitle('Achievements — Nucleus SJEC');
  22  |     await expect(page.locator('.ach-record')).toHaveCount(6);
  23  |     await expect(page.getByText('SAMPLE RECORD', { exact: true })).toHaveCount(6);
  24  |     expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  25  |     expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
  26  |     for (const portrait of await page.locator('.ach-portrait img').all()) {
  27  |       await portrait.scrollIntoViewIfNeeded();
  28  |       await expect.poll(() => portrait.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  29  |     }
  30  |     await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  31  |     await page.screenshot({ path: info.outputPath('achievements.png'), fullPage: true });
  32  |     await page.getByRole('button', { name: "View Prajwal Gaonkar's achievements" }).click();
  33  |     const dialog = page.getByRole('dialog', { name: 'Prajwal Gaonkar' });
  34  |     await expect(dialog).toBeVisible();
  35  |     await expect(dialog.getByText('SAMPLE ACHIEVEMENTS')).toBeVisible();
  36  |     expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
  37  |     expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
  38  |     await page.screenshot({ path: info.outputPath('achievement-details.png') });
  39  |     await page.keyboard.press('Escape');
  40  |     await expect(dialog).toHaveCount(0);
  41  |     await page.getByRole('button', { name: 'Open menu' }).click();
  42  |     const menuLink = page.getByRole('link', { name: 'Achievements', exact: true });
  43  |     const menuBounds = await menuLink.boundingBox();
  44  |     expect(menuBounds.x + menuBounds.width).toBeLessThanOrEqual(width);
  45  |     await page.keyboard.press('Escape');
  46  |     expect(errors).toEqual([]);
  47  |   });
  48  | }
  49  | 
  50  | test('categories combine with search, announce counts, and recover from no matches', async ({ page }) => {
  51  |   await openAchievements(page);
  52  |   await page.getByRole('button', { name: /^Research/ }).click();
  53  |   await expect(page.locator('.ach-record')).toHaveCount(2);
  54  |   await expect(page.locator('.ach-results-note [aria-live]')).toHaveText('02 of 06 members');
  55  |   await page.getByRole('searchbox').fill('mohit');
  56  |   await expect(page.locator('.ach-record')).toHaveCount(1);
  57  |   await page.getByRole('searchbox').fill('Campus Buildathon');
  58  |   await expect(page.locator('.ach-record')).toHaveCount(0);
  59  |   await expect(page.getByText('No matching achievements.')).toBeVisible();
  60  |   await page.getByRole('button', { name: 'Clear filters' }).click();
  61  |   await expect(page.locator('.ach-record')).toHaveCount(6);
  62  |   await expect(page.getByRole('searchbox')).toBeFocused();
  63  |   await page.getByRole('searchbox').fill('  PRAJWAL  ');
  64  |   await expect(page.locator('.ach-record')).toHaveCount(1);
  65  |   await page.getByRole('button', { name: 'Clear search' }).click();
  66  |   await expect(page.locator('.ach-record')).toHaveCount(6);
  67  | });
  68  | 
  69  | test('keyboard details restore focus, menu route works, and reduced motion stays still', async ({ page }) => {
  70  |   await openAchievements(page);
  71  |   const trigger = page.getByRole('button', { name: "View Prajwal Gaonkar's achievements" });
> 72  |   await trigger.focus();
      |                 ^ Error: locator.focus: Test timeout of 60000ms exceeded.
  73  |   await page.keyboard.press('Enter');
  74  |   const close = page.getByRole('button', { name: 'Close dialog' });
  75  |   await expect(close).toBeFocused();
  76  |   await page.keyboard.press('Shift+Tab');
  77  |   await expect(close).toBeFocused();
  78  |   await page.keyboard.press('Escape');
  79  |   await expect(trigger).toBeFocused();
  80  |   expect(await page.locator('.ach-rosette').evaluate(element => element.getAnimations().length)).toBe(0);
  81  |   await page.getByRole('button', { name: 'Open menu' }).click();
  82  |   await expect(page.getByRole('link', { name: 'Achievements', exact: true })).toHaveAttribute('aria-current', 'page');
  83  |   await page.getByRole('link', { name: 'Our work', exact: true }).click();
  84  |   await expect(page).toHaveURL(/\/projects$/);
  85  |   await page.getByRole('button', { name: 'Open menu' }).click();
  86  |   await page.getByRole('link', { name: 'Achievements', exact: true }).click();
  87  |   await expect(page).toHaveURL(/\/achievements$/);
  88  |   await expect(page.locator('.ach-record')).toHaveCount(6);
  89  | });
  90  | 
  91  | test('empty team and unavailable member images have useful fallbacks', async ({ page }) => {
  92  |   await openAchievements(page, { ...site, team: [{ ...site.team[0], image: '/missing-test-portrait.png' }] });
  93  |   await expect(page.locator('.ach-record')).toHaveCount(1);
  94  |   await expect(page.locator('.ach-portrait img')).toHaveCount(0);
  95  |   await expect(page.locator('.ach-portrait')).toHaveText(site.team[0].initials);
  96  |   await page.unroute('**/api/site');
  97  |   await page.route('**/api/site', route => route.fulfill({ json: { ...site, team: [] } }));
  98  |   await page.reload();
  99  |   await expect(page.getByText('No achievements yet.')).toBeVisible();
  100 | });
  101 | 
```