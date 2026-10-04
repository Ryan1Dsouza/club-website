# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: people-carousel.spec.mjs >> 393x851 >> fan and fullscreen profile fit, contain focus, and restore the card
- Location: tests\browser\people-carousel.spec.mjs:73:5

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  getByRole('dialog', { name: 'Poorvik Kuthyala' }).getByRole('link', { name: 'LeetCode' })
Expected: focused
Received: inactive
Timeout:  5000ms

Call log:
  - Expect "toBeFocused" getByRole('dialog', { name: 'Poorvik Kuthyala' }).getByRole('link', { name: 'LeetCode' }) with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Poorvik Kuthyala' }).getByRole('link', { name: 'LeetCode' })
    14 × locator resolved to <a href="#" rel="noopener noreferrer">…</a>
       - unexpected value "inactive"

```

```yaml
- link "LeetCode":
  - /url: "#"
  - img
  - text: LeetCode
  - img
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { readFile } from 'node:fs/promises';
  3   | import AxeBuilder from '@axe-core/playwright';
  4   | 
  5   | const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
  6   | test.beforeEach(async ({ page }) => {
  7   |   await page.route('**/api/site', route => route.fulfill({ json: site }));
  8   | });
  9   | async function openTeam(page) {
  10  |   await page.goto('/team');
  11  |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  12  |   await expect(page.locator('.fan-layout')).toHaveAttribute('data-settled', 'true');
  13  | }
  14  | 
  15  | test('default view fetches only visible small portraits and never starts the tower', async ({ page }) => {
  16  |   const requests = [], errors = [];
  17  |   page.on('request', request => requests.push(new URL(request.url()).pathname));
  18  |   page.on('pageerror', error => errors.push(error.message));
  19  |   await page.emulateMedia({ reducedMotion: 'reduce' });
  20  |   await openTeam(page);
  21  |   await expect(page.locator('.fan-card')).toHaveCount(7);
  22  |   await expect(page.locator('canvas')).toHaveCount(0);
  23  |   const photos = [...new Set(requests.filter(path => path.includes('/team_images/')))];
  24  |   expect(photos).toHaveLength(7);
  25  |   expect(photos.every(path => path.endsWith('-480.webp'))).toBe(true);
  26  |   expect(requests.filter(path => /people-tower|PeopleTower|three|cannon/.test(path))).toEqual([]);
  27  |   await page.getByLabel('Find a team member').selectOption('8');
  28  |   await expect(page.locator('.fan-carousel')).toHaveAttribute('data-active-index', '8');
  29  |   await expect(page.locator('.fan-card')).toHaveCount(7);
  30  |   const accessibility = await new AxeBuilder({ page }).include('.people-page').analyze();
  31  |   expect(accessibility.violations).toEqual([]);
  32  |   expect(errors).toEqual([]);
  33  | });
  34  | 
  35  | test('idle autoplay pauses on hover, focus, explicit pause and profiles, then resumes', async ({ page }) => {
  36  |   await page.setViewportSize({ width: 1440, height: 1000 });
  37  |   await openTeam(page);
  38  |   const carousel = page.locator('.fan-carousel');
  39  |   await expect(carousel).toHaveAttribute('data-autoplay', 'playing');
  40  |   const initial = await carousel.getAttribute('data-active-index');
  41  |   await expect(carousel).not.toHaveAttribute('data-active-index', initial, { timeout: 5000 });
  42  |   await page.locator('.fan-card[data-active="true"]').hover();
  43  |   await expect(carousel).toHaveAttribute('data-autoplay', 'paused');
  44  |   const hovered = await carousel.getAttribute('data-active-index');
  45  |   await page.waitForTimeout(3200);
  46  |   await expect(carousel).toHaveAttribute('data-active-index', hovered);
  47  |   await page.mouse.move(5, 5);
  48  |   await expect(carousel).toHaveAttribute('data-autoplay', 'playing');
  49  |   await page.getByLabel('Pause automatic rotation').click();
  50  |   await page.getByRole('heading', { level: 1 }).click();
  51  |   await expect(carousel).toHaveAttribute('data-autoplay', 'paused');
  52  |   await page.getByLabel('Start automatic rotation').click();
  53  |   await page.getByRole('heading', { level: 1 }).click();
  54  |   await expect(carousel).toHaveAttribute('data-autoplay', 'playing');
  55  |   await page.getByLabel('Find a team member').focus();
  56  |   await expect(carousel).toHaveAttribute('data-autoplay', 'paused');
  57  |   await page.getByLabel('Find a team member').selectOption('0');
  58  |   await expect(page.locator('.fan-layout')).toHaveAttribute('data-settled', 'true');
  59  |   await page.locator('.fan-card[data-active="true"]').click();
  60  |   await expect(carousel).toHaveAttribute('data-autoplay', 'paused');
  61  |   await page.waitForTimeout(3200);
  62  |   await expect(carousel).toHaveAttribute('data-active-index', '0');
  63  |   await page.keyboard.press('Escape');
  64  |   await expect(page.getByRole('dialog')).toHaveCount(0);
  65  |   await page.getByRole('heading', { level: 1 }).click();
  66  |   await expect(carousel).toHaveAttribute('data-autoplay', 'playing');
  67  |   await expect(carousel).toHaveAttribute('data-active-index', '1', { timeout: 5000 });
  68  | });
  69  | 
  70  | for (const viewport of [{ width: 1440, height: 1000 }, { width: 393, height: 851 }, { width: 320, height: 568 }, { width: 851, height: 393 }]) {
  71  |   test.describe(`${viewport.width}x${viewport.height}`, () => {
  72  |     test.use({ viewport, isMobile: viewport.width < 900, hasTouch: viewport.width < 900 });
  73  |     test('fan and fullscreen profile fit, contain focus, and restore the card', async ({ page }, info) => {
  74  |       const requests = [], errors = [];
  75  |       page.on('request', request => requests.push(request.url()));
  76  |       page.on('pageerror', error => errors.push(error.message));
  77  |       await openTeam(page);
  78  |       await page.getByLabel('Find a team member').selectOption('0');
  79  |       await expect(page.locator('.fan-layout')).toHaveAttribute('data-settled', 'true');
  80  |       await page.screenshot({ path: info.outputPath('carousel.png'), fullPage: true });
  81  |       expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
  82  |       const trigger = page.locator('.fan-card[data-index="0"]');
  83  |       await trigger.click();
  84  |       const dialog = page.getByRole('dialog', { name: 'Poorvik Kuthyala' });
  85  |       await expect(dialog).toBeVisible();
  86  |       await expect(dialog).toHaveCSS('opacity', '1');
  87  |       await expect(dialog.getByText('turning coffee into algorithms')).toBeVisible();
  88  |       await expect(dialog.getByText('President', { exact: true })).toBeVisible();
  89  |       await expect(dialog.locator('.team-profile__portrait')).toHaveAttribute('src', /-800\.webp$/);
  90  |       await expect.poll(() => dialog.locator('.team-profile__portrait').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  91  |       const rect = await dialog.boundingBox();
  92  |       expect(rect).toEqual({ x: 0, y: 0, ...viewport });
  93  |       expect(await dialog.evaluate(el => el.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  94  |       await page.screenshot({ path: info.outputPath('profile.png') });
  95  |       const close = dialog.getByRole('button', { name: 'Back to the constellation' });
  96  |       await close.focus();
  97  |       await page.keyboard.press('Shift+Tab');
> 98  |       await expect(dialog.getByRole('link', { name: 'LeetCode' })).toBeFocused();
      |                                                                    ^ Error: expect(locator).toBeFocused() failed
  99  |       await page.keyboard.press('Tab');
  100 |       await expect(close).toBeFocused();
  101 |       const before = page.url();
  102 |       await dialog.getByRole('link', { name: 'LinkedIn' }).click();
  103 |       expect(page.url()).toBe(before);
  104 |       const accessibility = await new AxeBuilder({ page }).include('.team-profile').analyze();
  105 |       expect(accessibility.violations).toEqual([]);
  106 |       await page.keyboard.press('Escape');
  107 |       await expect(dialog).toHaveCount(0);
  108 |       await expect(trigger).toBeFocused();
  109 |       expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  110 |       expect(requests.filter(url => /people-tower|PeopleTower|three|cannon/.test(url))).toEqual([]);
  111 |       expect(errors).toEqual([]);
  112 |     });
  113 |   });
  114 | }
  115 | 
  116 | test('direct navigation, rapid cycling, resize and reduced motion keep a bounded usable fan', async ({ page }) => {
  117 |   await openTeam(page);
  118 |   await page.getByLabel('Find a team member').selectOption('14');
  119 |   await expect(page.locator('.fan-layout')).toHaveAttribute('data-settled', 'true');
  120 |   await page.getByLabel('Next team member', { exact: true }).click();
  121 |   await expect(page.locator('.fan-carousel')).toHaveAttribute('data-active-index', '0');
  122 |   await page.getByLabel('Next team member', { exact: true }).evaluate(button => { for (let i = 0; i < 30; i++) button.click(); });
  123 |   expect(await page.locator('.fan-card').count()).toBeLessThanOrEqual(8);
  124 |   await page.setViewportSize({ width: 393, height: 700 });
  125 |   await expect(page.locator('.fan-layout')).toHaveAttribute('data-settled', 'true');
  126 |   await expect(page.locator('.fan-card')).toHaveCount(7);
  127 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  128 |   await expect(page.locator('.fan-carousel')).toHaveAttribute('data-autoplay', 'paused');
  129 |   await page.getByLabel('Find a team member').selectOption('6');
  130 |   await expect(page.locator('.fan-card')).toHaveCount(7);
  131 |   await expect(page.locator('.fan-layout')).toHaveAttribute('data-settled', 'true');
  132 |   await page.locator('.fan-card[data-active="true"]').focus();
  133 |   await page.keyboard.press('ArrowLeft');
  134 |   await expect(page.locator('.fan-carousel')).toHaveAttribute('data-active-index', '5');
  135 | });
  136 | 
  137 | test('empty and singleton teams remain useful and real profile props replace placeholders', async ({ page }) => {
  138 |   await page.route('**/api/site', route => route.fulfill({ json: { ...site, team: [] } }));
  139 |   await page.goto('/team');
  140 |   await expect(page.locator('.fan-empty')).toHaveText('The team will be announced here soon.');
  141 |   await expect(page.getByRole('button', { name: 'Play Interactive Tower' })).toBeDisabled();
  142 |   await page.route('**/api/site', route => route.fulfill({ json: { ...site, team: [{ ...site.team[0], tagline: 'Building useful things.', socials: { github: 'https://github.com/example' } }] } }));
  143 |   await page.reload();
  144 |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  145 |   await expect(page.locator('.fan-card')).toHaveCount(1);
  146 |   await expect(page.getByLabel('Next team member', { exact: true })).toBeDisabled();
  147 |   await page.locator('.fan-card').click();
  148 |   await expect(page.getByText('Building useful things.')).toBeVisible();
  149 |   await expect(page.locator('.team-profile__socials a')).toHaveCount(1);
  150 |   await expect(page.locator('.team-profile__socials a')).toHaveAttribute('href', 'https://github.com/example');
  151 | });
  152 | 
  153 | test('tower loads only on demand and releases GPU resources on return to quick view', async ({ page }) => {
  154 |   const requests = [];
  155 |   page.on('request', request => requests.push(request.url()));
  156 |   await page.addInitScript(() => {
  157 |     window.__THREE_DEVTOOLS__ = { dispatchEvent({ detail: renderer }) {
  158 |       if (!renderer?.isWebGLRenderer) return;
  159 |       const dispose = renderer.dispose.bind(renderer);
  160 |       renderer.dispose = () => { dispose(); window.__disposedTower = { ...renderer.info.memory }; };
  161 |     } };
  162 |   });
  163 |   await openTeam(page);
  164 |   expect(requests.some(url => /people-tower|PeopleTower|three|cannon/.test(url))).toBe(false);
  165 |   await page.getByRole('button', { name: 'Play Interactive Tower' }).click();
  166 |   await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
  167 |   await expect(page.locator('.people-tower canvas')).toHaveCount(1);
  168 |   await expect(page.locator('.fan-carousel')).toHaveCount(0);
  169 |   expect(requests.some(url => url.includes('people-tower.ts'))).toBe(true);
  170 |   await page.getByLabel('Jump to a member').selectOption('14');
  171 |   await expect(page.getByRole('button', { name: 'Back to Quick view' })).toBeInViewport();
  172 |   await page.getByRole('button', { name: 'Back to Quick view' }).click();
  173 |   await expect(page.locator('.fan-carousel')).toBeVisible();
  174 |   await expect(page.locator('canvas')).toHaveCount(0);
  175 |   await expect.poll(() => page.evaluate(() => window.__disposedTower)).toEqual({ geometries: 0, textures: 0 });
  176 |   expect(await page.evaluate(() => scrollY)).toBe(0);
  177 | });
  178 | 
```