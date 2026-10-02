# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site-quality.spec.mjs >> desktop >> public pages have accessible content, route metadata, and no horizontal overflow
- Location: tests\browser\site-quality.spec.mjs:15:5

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('.site-shell')
Expected: "done"
Received: "loading"
Timeout:  5000ms

Call log:
  - Expect "toHaveAttribute" locator('.site-shell') with timeout 5000ms
  - waiting for locator('.site-shell')

```

```yaml
- link "Skip to content":
  - /url: "#main-content"
- banner:
  - navigation "Main navigation"
- main:
  - region "Nucleus"
  - region "Three paths. Infinite directions."
  - text: JOIN THE COMMUNITY
  - heading "Learn. Build. Collaborate." [level=2]: LEARN. BUILD. COLLABORATE.
  - paragraph: Applications are currently closed. Check out our latest projects and events to see what we're building.
  - link "JOIN CLUB":
    - /url: /recruitment
  - link "PROJECTS":
    - /url: /projects
  - region "Community voices"
- contentinfo:
  - link "Nucleus home":
    - /url: /
    - text: NUCLEUS SJEC · MANGALURU
  - link "Nucleus Instagram":
    - /url: https://www.instagram.com/nucleus_sjec/
  - link "Nucleus LinkedIn":
    - /url: https://www.linkedin.com/company/nucleus-sjec/
  - link "Nucleus GitHub":
    - /url: https://github.com/nucleus-sjec
  - link "Email Nucleus":
    - /url: mailto:nucleussjec@gmail.com
  - text: © 2026 Nucleus SJEC Made of many minds.
  - link "Admin":
    - /url: /admin
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | import { readFile } from 'node:fs/promises';
  4  | import { pageMeta } from '../../shared/page-meta.ts';
  5  | 
  6  | const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
  7  | const paths = ['/', '/team', '/about', '/projects', '/events', '/recruitment'];
  8  | 
  9  | for (const device of [
  10 |   { name: 'desktop', viewport: { width: 1440, height: 900 } },
  11 |   { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 },
  12 | ]) {
  13 |   test.describe(device.name, () => {
  14 |     test.use({ ...device, reducedMotion: 'reduce' });
  15 |     test('public pages have accessible content, route metadata, and no horizontal overflow', async ({ page }) => {
  16 |       test.setTimeout(120_000);
  17 |       const errors = []; page.on('pageerror', error => errors.push(error.message));
  18 |       await page.route('**/api/site', route => route.fulfill({ json: site }));
  19 |       for (const path of paths) {
  20 |         await page.goto(path);
> 21 |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
     |                                             ^ Error: expect(locator).toHaveAttribute(expected) failed
  22 |         await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
  23 |         const meta = pageMeta(path);
  24 |         await expect(page).toHaveTitle(meta.title);
  25 |         await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', meta.canonical);
  26 |         await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', meta.description);
  27 |         await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', meta.canonical);
  28 |         await expect(page.locator('h1')).toHaveCount(1);
  29 |         expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBe(device.viewport.width);
  30 |         const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  31 |         expect(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) })), path).toEqual([]);
  32 |       }
  33 |       expect(errors).toEqual([]);
  34 |     });
  35 |   });
  36 | }
  37 | 
  38 | test('client navigation updates canonical and social metadata, including unknown routes', async ({ page }) => {
  39 |   await page.route('**/api/site', route => route.fulfill({ json: site }));
  40 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  41 |   await page.goto('/');
  42 |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  43 |   await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  44 |   await page.getByRole('link', { name: 'The people', exact: true }).click();
  45 |   await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', pageMeta('/team').canonical);
  46 |   await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', pageMeta('/team').description);
  47 |   await page.goto('/unknown');
  48 |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  49 |   await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
  50 | });
  51 | 
  52 | test('moving voices have a keyboard pause control', async ({ page }) => {
  53 |   await page.route('**/api/site', route => route.fulfill({ json: site }));
  54 |   await page.goto('/');
  55 |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  56 |   const button = page.getByRole('button', { name: 'Pause moving voices' });
  57 |   await button.scrollIntoViewIfNeeded();
  58 |   await button.focus();
  59 |   await page.keyboard.press('Space');
  60 |   await expect(button).toHaveAttribute('aria-pressed', 'true');
  61 |   for (const row of await page.locator('.vm-marquee-content').all()) await expect(row).toHaveCSS('animation-play-state', 'paused');
  62 | });
  63 | 
```