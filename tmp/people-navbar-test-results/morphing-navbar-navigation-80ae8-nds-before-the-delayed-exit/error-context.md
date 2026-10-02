# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: morphing-navbar.spec.mjs >> navigation mounts the tower behind the bands before the delayed exit
- Location: tests\browser\morphing-navbar.spec.mjs:166:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 1280
Received: 0
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
          - button "Open menu" [active] [ref=e7] [cursor=pointer]
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
                      - generic: x
                      - generic: p
                      - generic: e
                      - generic: r
                      - generic: i
                      - generic: e
                      - generic: "n"
                      - generic: c
                      - generic: e
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
    - region [ref=e12]:
      - heading "The people behind Nucleus" [level=1] [ref=e13]
      - generic [ref=e15]:
        - generic [ref=e18]: 02 / The people
        - generic [aria-hidden]:
          - paragraph:
            - text: The
            - emphasis: whole team.
          - generic: Meet everyone
        - paragraph: Click a block to pull it out. Drag to play. Scroll to meet the team.
        - generic [ref=e20]:
          - generic [ref=e21]:
            - generic [ref=e22]: —
            - generic [ref=e23]: / 15
          - generic [ref=e24]:
            - generic [ref=e25]: Jump to a member
            - combobox "Jump to a member" [ref=e26]:
              - option "Meet the members" [disabled] [selected]
              - option "Poorvik Kuthyala"
              - option "Dinol Castelino"
              - option "Joylin Mathias"
              - option "Karthik"
              - option "Nishanth Uday Naik"
              - option "Prajwal Gaonkar"
              - option "Mohit"
              - option "Rakshith Dsouza"
              - option "Navya Suvarna"
              - option "Deona Rego"
              - option "Sweedan Cardoza"
              - option "Manvitha Lewis"
              - option "Salim Pallikal"
              - option "Nikhitha Dsouza"
              - option "Aisahath Saniya"
          - button "Rebuild tower" [ref=e27] [cursor=pointer]
```

# Test source

```ts
  92  |       cancelAnimationFrame(window.reopenFrameId);
  93  |       return window.reopenFrames;
  94  |     });
  95  |     await testInfo.attach(`sweep-after-${closeDelay ?? 'initial'}-close`, { body: JSON.stringify(frames), contentType: 'application/json' });
  96  |     expect(frames.some(frame => frame.bands[0] > 10 && frame.bands[0] < 1300 &&
  97  |       frame.bands[4] > frame.bands[0] + 100 && frame.lastBandOffset > 1439 && frame.text < .1),
  98  |     closeDelay === null ? 'Expected a visible band stagger on first open' :
  99  |       `Expected a visible band stagger after a ${closeDelay} ms close`).toBe(true);
  100 |   }
  101 | });
  102 | 
  103 | test('keyboard focus stays in the full-screen menu and Escape restores the page', async ({ page }) => {
  104 |   await page.goto('/recruitment');
  105 |   await toggle(page).focus();
  106 |   await page.keyboard.press('Enter');
  107 |   await settledOpen(page);
  108 |   await expect(page.getByRole('dialog', { name: 'Navigation menu' })).toBeVisible();
  109 |   await expect(page.locator('main')).toHaveAttribute('inert');
  110 |   await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  111 |   for (const [title] of destinations) {
  112 |     await page.keyboard.press('Tab');
  113 |     await expect(menu(page).getByRole('link', { name: title, exact: true })).toBeFocused();
  114 |   }
  115 |   for (const title of ['Instagram', 'LinkedIn', 'GitHub', 'Email']) {
  116 |     await page.keyboard.press('Tab');
  117 |     await expect(menu(page).getByRole('link', { name: title, exact: true })).toBeFocused();
  118 |   }
  119 |   await page.keyboard.press('Tab');
  120 |   await expect(page.locator('.morph-nav__join')).toBeFocused();
  121 |   await page.keyboard.press('Tab');
  122 |   await expect(page.locator('.morph-nav__brand')).toBeFocused();
  123 |   await page.keyboard.press('Shift+Tab');
  124 |   await expect(page.locator('.morph-nav__join')).toBeFocused();
  125 |   await page.keyboard.press('Escape');
  126 |   await expect(toggle(page)).toBeFocused();
  127 |   await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  128 |   await expect(page.locator('main')).not.toHaveAttribute('inert');
  129 |   await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  130 |   await expect(menu(page).getByRole('link', { name: 'Home', exact: true })).toHaveCount(0);
  131 | });
  132 | 
  133 | test('routes, social destinations, reduced motion, and the community action remain functional', async ({ page }) => {
  134 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  135 |   await page.goto('/recruitment');
  136 |   for (const [title, path] of destinations) {
  137 |     await toggle(page).click();
  138 |     await menu(page).getByRole('link', { name: title, exact: true }).click();
  139 |     await expect(page).toHaveURL(url => url.pathname === path);
  140 |     await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  141 |     await expect(page.locator('main')).not.toHaveAttribute('inert');
  142 |     await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  143 |     await toggle(page).click();
  144 |     await expect(menu(page).getByRole('link', { name: title, exact: true })).toHaveAttribute('aria-current', 'page');
  145 |     await expect(page.locator('.morph-nav__overlay')).toHaveCSS('transform', 'none');
  146 |     await expect(page.locator('.morph-nav__letter').first()).toHaveCSS('animation-name', 'none');
  147 |     await toggle(page).click();
  148 |   }
  149 |   await toggle(page).click();
  150 |   await expect(menu(page).getByRole('link', { name: 'Instagram', exact: true })).toHaveAttribute('href', site.settings.instagramUrl);
  151 |   await expect(menu(page).getByRole('link', { name: 'LinkedIn', exact: true })).toHaveAttribute('href', site.settings.linkedinUrl);
  152 |   await expect(menu(page).getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute('href', site.settings.githubUrl);
  153 |   await page.locator('.morph-nav__join').click();
  154 |   await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  155 |   await expect(page.locator('dialog.modal')).toBeVisible();
  156 |   await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  157 |   await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
  158 |   await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  159 |   await expect(toggle(page)).toBeFocused();
  160 |   await toggle(page).click();
  161 |   await page.goBack();
  162 |   await expect(page).toHaveURL(/\/projects$/);
  163 |   await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  164 | });
  165 | 
  166 | test('navigation mounts the tower behind the bands before the delayed exit', async ({ page }) => {
  167 |   await page.goto('/recruitment');
  168 |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 15000 });
  169 |   await toggle(page).click();
  170 |   await settledOpen(page);
  171 |   await expect(page.locator('.morph-nav__footer > div').last()).toHaveCSS('opacity', '1');
  172 |   await page.clock.install({ time: new Date('2026-10-02T12:00:00Z') });
  173 |   await page.clock.pauseAt(new Date('2026-10-02T12:00:01Z'));
  174 | 
  175 |   await menu(page).getByRole('link', { name: 'The people', exact: true }).dispatchEvent('click');
  176 |   await expect(page).toHaveURL(/\/team$/);
  177 |   await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
  178 |   await expect(page.locator('.people-tower__world canvas')).toHaveCount(1);
  179 |   await page.clock.runFor(399);
  180 |   await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
  181 |   await expect(page.locator('main')).toHaveAttribute('inert');
  182 |   await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  183 |   for (const band of await page.locator('.morph-nav__band').all()) await expect(band).toHaveCSS('transform', 'none');
  184 | 
  185 |   await page.clock.runFor(1);
  186 |   await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  187 |   await expect(toggle(page)).toBeFocused();
  188 |   await expect(page.locator('main')).not.toHaveAttribute('inert');
  189 |   await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  190 |   await page.clock.runFor(1400);
  191 |   const overlay = await page.locator('.morph-nav__overlay').boundingBox();
> 192 |   expect(Math.round(overlay.x)).toBe(page.viewportSize().width);
      |                                 ^ Error: expect(received).toBe(expected) // Object.is equality
  193 | });
  194 | 
  195 | test('repeated navigation restarts the delay and reopening cancels a stale close', async ({ page }) => {
  196 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  197 |   await page.goto('/recruitment');
  198 |   await toggle(page).click();
  199 |   await settledOpen(page);
  200 |   await page.clock.install({ time: new Date('2026-10-02T12:00:00Z') });
  201 |   await page.clock.pauseAt(new Date('2026-10-02T12:00:01Z'));
  202 | 
  203 |   await menu(page).getByRole('link', { name: 'Our work', exact: true }).dispatchEvent('click');
  204 |   await expect(page).toHaveURL(/\/projects$/);
  205 |   await page.clock.runFor(200);
  206 |   await menu(page).getByRole('link', { name: 'The people', exact: true }).dispatchEvent('click');
  207 |   await expect(page).toHaveURL(/\/team$/);
  208 |   await page.clock.runFor(399);
  209 |   await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
  210 |   await page.clock.runFor(1);
  211 |   await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  212 | 
  213 |   await toggle(page).dispatchEvent('click');
  214 |   await page.locator('.morph-nav__brand').dispatchEvent('click');
  215 |   await expect(page).toHaveURL(url => url.pathname === '/');
  216 |   await page.clock.runFor(200);
  217 |   await toggle(page).dispatchEvent('click');
  218 |   await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  219 |   await toggle(page).dispatchEvent('click');
  220 |   await page.clock.runFor(400);
  221 |   await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
  222 |   await expect(page.locator('main')).toHaveAttribute('inert');
  223 | });
  224 | 
  225 | test('mobile and landscape menus fit long labels and keep every action reachable', async ({ browser }) => {
  226 |   const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  227 |   const page = await context.newPage();
  228 |   await page.route('**/api/site', route => route.fulfill({ json: site }));
  229 |   await page.goto('/events');
  230 |   for (const viewport of [{ width: 390, height: 844 }, { width: 280, height: 653 }, { width: 844, height: 390 }]) {
  231 |     await page.setViewportSize(viewport);
  232 |     await toggle(page).tap();
  233 |     await settledOpen(page);
  234 |     const pill = await page.locator('.morph-nav__pill').boundingBox();
  235 |     expect(Math.abs(pill.x + pill.width / 2 - viewport.width / 2)).toBeLessThan(1);
  236 |     for (const title of await page.locator('.morph-nav__title').all()) {
  237 |       const box = await title.boundingBox();
  238 |       expect(box.x).toBeGreaterThanOrEqual(0);
  239 |       expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  240 |       await expect(title).toBeInViewport();
  241 |     }
  242 |     await expect(page.locator('.morph-nav__join')).toBeInViewport();
  243 |     expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
  244 |     await page.screenshot({ path: 'output/navbar-match/mobile-' + viewport.width + '-open.png' });
  245 |     await toggle(page).tap();
  246 |     await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  247 |   }
  248 |   await context.close();
  249 | });
  250 | 
  251 | test('opening from a scrolled page locks the background and rapid toggles recover cleanly', async ({ page }) => {
  252 |   await page.goto('/');
  253 |   await expect(page.locator('html')).toHaveClass(/lenis/);
  254 |   await page.mouse.move(20, 450);
  255 |   await page.mouse.wheel(0, 600);
  256 |   await expect.poll(() => page.evaluate(() => scrollY)).toBe(360);
  257 |   await toggle(page).click();
  258 |   await settledOpen(page);
  259 |   await expect(page.locator('html')).not.toHaveClass(/lenis/);
  260 |   const position = await page.evaluate(() => scrollY);
  261 |   await page.mouse.move(600, 450);
  262 |   await page.mouse.wheel(0, 1200);
  263 |   await page.waitForTimeout(200);
  264 |   expect(await page.evaluate(() => scrollY)).toBe(position);
  265 |   await page.keyboard.press('Escape');
  266 |   await expect(page.locator('html')).toHaveClass(/lenis/);
  267 |   expect(await page.evaluate(() => scrollY)).toBe(position);
  268 |   for (let index = 0; index < 6; index++) {
  269 |     await toggle(page).dispatchEvent('click');
  270 |     await page.waitForTimeout(50);
  271 |   }
  272 |   await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  273 |   await expect(page.locator('.morph-nav__overlay')).toHaveAttribute('inert');
  274 |   await expect(page.locator('main')).not.toHaveAttribute('inert');
  275 |   await toggle(page).click();
  276 |   await settledOpen(page);
  277 |   await expect(menu(page).getByRole('link', { name: 'Our work', exact: true })).toBeVisible();
  278 |   await page.keyboard.press('Escape');
  279 | });
  280 | 
```