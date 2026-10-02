# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: experiences.spec.mjs >> desktop publishes a photo folder without replacing the canvas, and another visitor sees it
- Location: tests\browser\experiences.spec.mjs:158:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('.nx-world')
Expected: "true"
Received: ""
Timeout:  5000ms

Call log:
  - Expect "toHaveAttribute" locator('.nx-world') with timeout 5000ms
  - waiting for locator('.nx-world')
    13 × locator resolved to <div tabindex="0" role="group" class="nx-world" aria-describedby="nx-control-summary" aria-label="Nucleus roller coaster. W or D to accelerate, S or A to brake and reverse. Hold Shift to boost. Drag to look. E opens a nearby station.">…</div>
       - unexpected value "null"

```

```yaml
- group "Nucleus roller coaster. W or D to accelerate, S or A to brake and reverse. Hold Shift to boost. Drag to look. E opens a nearby station."
```

# Test source

```ts
  69  | });
  70  | 
  71  | test('wind is opt-in, follows motion, suspends for dialogs, and closes on navigation', async ({ page }) => {
  72  |   await page.addInitScript(() => {
  73  |     const Original = window.AudioContext;
  74  |     window.rideAudioContexts = [];
  75  |     window.AudioContext = class extends Original {
  76  |       constructor(...args) { super(...args); window.rideAudioContexts.push(this); }
  77  |     };
  78  |   });
  79  |   await page.setViewportSize({ width: 1440, height: 900 });
  80  |   await connect(page); await ready(page);
  81  |   const sound = page.getByRole('button', { name: 'Wind sound' }), world = page.locator('.nx-world');
  82  |   await expect(sound).toHaveAttribute('aria-pressed', 'false');
  83  |   expect(await page.evaluate(() => window.rideAudioContexts.length)).toBe(0);
  84  |   await expect(page.locator('.nx-minimap')).toHaveCSS('backdrop-filter', 'blur(10px)');
  85  |   await page.getByRole('button', { name: 'Return to ride' }).click();
  86  |   await expect(world).toHaveAttribute('data-drive-ready', 'true');
  87  |   await sound.click();
  88  |   await expect(sound).toHaveAttribute('aria-pressed', 'true');
  89  |   await world.focus(); await page.keyboard.down('w');
  90  |   await expect.poll(() => world.getAttribute('data-audio-gain').then(Number)).toBeGreaterThan(.002);
  91  |   await page.keyboard.up('w');
  92  |   await page.getByRole('button', { name: 'Events 3', exact: true }).click();
  93  |   await expect.poll(() => page.evaluate(() => window.rideAudioContexts[0].state)).toBe('suspended');
  94  |   await page.getByRole('button', { name: 'Close event', exact: true }).click();
  95  |   await sound.click(); await expect(sound).toHaveAttribute('aria-pressed', 'false');
  96  |   await expect.poll(() => world.getAttribute('data-audio-gain').then(Number)).toBe(0);
  97  |   await page.getByRole('button', { name: 'Open menu' }).click();
  98  |   await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Home', exact: true }).click();
  99  |   await expect.poll(() => page.evaluate(() => window.rideAudioContexts[0].state)).toBe('closed');
  100 | });
  101 | 
  102 | test('station-only travel repeats event photos, departs Station 01, and rides to another checkpoint', async ({ page }, info) => {
  103 |   test.setTimeout(180_000);
  104 |   await page.setViewportSize({ width: 1440, height: 900 });
  105 |   const errors = []; page.on('pageerror', error => errors.push(error.message));
  106 |   const events = getSite(db).events;
  107 |   for (const [eventIndex, event] of events.entries()) for (let index = 0; index < 8; index++) {
  108 |     const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><rect width="600" height="450" fill="hsl(${eventIndex * 90 + index * 18},35%,38%)"/><circle cx="300" cy="205" r="110" fill="#c3e5c8"/><text x="300" y="230" text-anchor="middle" font-family="sans-serif" font-size="70">${eventIndex + 1}.${index + 1}</text></svg>`;
  109 |     db.prepare('INSERT INTO event_photos(id,event_id,name,mime,data,position) VALUES(?,?,?,?,?,?)').run(`ride-${eventIndex}-${index}`, event.id, `Event ${eventIndex + 1} photo ${index + 1}`, 'image/svg+xml', Buffer.from(svg), index);
  110 |   }
  111 |   await connect(page); await ready(page);
  112 |   const world = page.locator('.nx-world'), map = page.getByRole('navigation', { name: 'Ride route map' });
  113 |   await expect(page.locator('[data-stop-kind=waypoint]')).toHaveCount(0);
  114 |   await map.getByRole('button', { name: /Travel to station 01/ }).click();
  115 |   await expect(world).toHaveAttribute('data-travel-target', '0');
  116 |   await expect.poll(() => world.getAttribute('data-distance').then(Number)).toBeLessThan(10);
  117 |   await expect.poll(() => world.getAttribute('data-distance').then(Number), { timeout: 20_000 }).toBeGreaterThan(10);
  118 |   const firstSources = await page.locator('.nx-glimpse img').evaluateAll(images => images.map(img => img.getAttribute('src')));
  119 |   await expect.poll(() => page.locator('.nx-glimpse img').evaluateAll(images => images.map(img => img.getAttribute('src'))), { timeout: 15_000 }).not.toEqual(firstSources);
  120 |   await expect.poll(() => page.locator('.nx-glimpse img').evaluateAll(images => images.every(img => img.naturalWidth > 0))).toBe(true);
  121 |   await page.screenshot({ path: info.outputPath('repeating-event-photos.png') });
  122 |   await expect(page.getByRole('dialog', { name: events[0].title })).toBeVisible({ timeout: 60_000 });
  123 |   await expect(world).toHaveAttribute('data-distance', '211.00');
  124 |   await expect(page.locator('.nx-glimpses')).toBeHidden();
  125 |   // One uninterrupted press must close the event AND begin driving immediately.
  126 |   await page.keyboard.down('d');
  127 |   await expect(page.getByRole('dialog')).toHaveCount(0);
  128 |   await expect.poll(() => world.getAttribute('data-distance').then(Number), { timeout: 15_000 }).toBeGreaterThan(245);
  129 |   await expect(page.locator('.nx-glimpses')).toHaveAttribute('aria-label', `A glimpse of the next event: ${events[1].title}`);
  130 |   await expect.poll(() => page.locator('.nx-glimpse').first().getAttribute('data-frame').then(Number), { timeout: 12_000 }).toBeGreaterThan(0);
  131 |   await page.keyboard.up('d');
  132 |   await map.getByRole('button', { name: /Travel to station 02/ }).click();
  133 |   await expect(world).toHaveAttribute('data-travel-target', '1');
  134 |   await expect(page.getByRole('dialog', { name: events[1].title })).toBeVisible({ timeout: 75_000 });
  135 |   const secondDistance = Number(await world.getAttribute('data-distance'));
  136 |   await page.keyboard.down('s');
  137 |   await expect(page.getByRole('dialog')).toHaveCount(0);
  138 |   await expect.poll(() => world.getAttribute('data-distance').then(Number), { timeout: 15_000 }).toBeLessThan(secondDistance - 20);
  139 |   await expect(page.locator('.nx-glimpses')).toHaveAttribute('aria-label', `A glimpse of the next event: ${events[0].title}`);
  140 |   await page.keyboard.up('s');
  141 |   expect(errors).toEqual([]);
  142 | });
  143 | 
  144 | test('continuing after docking preserves a forward key that is still held', async ({ page }) => {
  145 |   await connect(page); await ready(page);
  146 |   const world = page.locator('.nx-world');
  147 |   await page.getByRole('button', { name: 'Return to ride' }).click();
  148 |   await expect(world).toHaveAttribute('data-drive-ready', 'true');
  149 |   await page.keyboard.down('w');
  150 |   await expect(page.getByRole('dialog', { name: 'The first connection' })).toBeVisible({ timeout: 30_000 });
  151 |   const parked = Number(await world.getAttribute('data-distance'));
  152 |   await page.getByRole('button', { name: 'Continue ride', exact: true }).click();
  153 |   await expect(page.getByRole('dialog')).toHaveCount(0);
  154 |   await expect.poll(() => world.getAttribute('data-distance').then(Number), { timeout: 10_000 }).toBeGreaterThan(parked + 25);
  155 |   await page.keyboard.up('w');
  156 | });
  157 | 
  158 | test('desktop publishes a photo folder without replacing the canvas, and another visitor sees it', async ({ page, browser }, info) => {
  159 |   // Two WebGL visitors plus the frame sample need room on software-rendered CI.
  160 |   test.setTimeout(120_000);
  161 |   await page.setViewportSize({ width: 1440, height: 900 });
  162 |   const errors = []; page.on('pageerror', error => errors.push(error.message));
  163 |   await connect(page); await ready(page);
  164 |   await expect(page.locator('.nx-joystick')).toHaveCount(0); await expect(page.locator('[data-stop-kind=event]')).toHaveCount(3);
  165 |   await expect(page.locator('[data-stop-kind=waypoint]')).toHaveCount(0);
  166 |   await expect(page.getByRole('navigation', { name: 'Ride route map' }).getByRole('button')).toHaveCount(3);
  167 |   await page.evaluate(() => { window.testCanvas = document.querySelector('.nx-world canvas'); });
  168 |   await page.getByRole('button', { name: 'Return to ride' }).click();
> 169 |   await page.locator('.nx-world').focus(); await expect(page.locator('.nx-world')).toHaveAttribute('data-drive-ready', 'true');
      |                                                                                    ^ Error: expect(locator).toHaveAttribute(expected) failed
  170 |   await page.keyboard.down('w'); await expect.poll(() => page.locator('.nx-world').getAttribute('data-distance').then(Number)).toBeGreaterThan(3); await page.keyboard.up('w');
  171 |   await expect.poll(() => page.locator('.nx-world').getAttribute('data-distance').then(Number)).toBeGreaterThan(3);
  172 |   await page.getByRole('button', { name: 'Add Event', exact: true }).click();
  173 |   await page.getByLabel('Email', { exact: true }).fill('browser@example.com'); await page.getByLabel('Password', { exact: true }).fill('browser-fixture-password');
  174 |   await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  175 |   await page.getByLabel('Event title', { exact: true }).fill('A shared photo workshop');
  176 |   await page.getByLabel('Event details', { exact: true }).fill('We built a wonderful new project together. Here are the highlights from our workshop.');
  177 |   await page.getByLabel('Date and time (your local timezone)', { exact: true }).fill('2026-10-15T15:00');
  178 |   await page.getByLabel('Location', { exact: true }).fill('SJEC Innovation Lab'); await page.getByLabel('Category', { exact: true }).fill('Workshop');
  179 |   await page.getByLabel('Photo album link (Google Drive or any share URL)', { exact: false }).fill('https://drive.google.com/drive/folders/workshop');
  180 |   await page.getByLabel('Registration link', { exact: false }).fill('https://example.com/register');
  181 |   const album = info.outputPath('album'); await mkdir(album, { recursive: true });
  182 |   const png = await page.evaluate(() => { const canvas = document.createElement('canvas'); canvas.width = 100; canvas.height = 80; const ctx = canvas.getContext('2d'); ctx.fillStyle = '#b8e5c8'; ctx.fillRect(0, 0, 100, 80); return canvas.toDataURL('image/png').split(',')[1]; });
  183 |   await writeFile(resolve(album, 'workshop.png'), Buffer.from(png, 'base64')); await writeFile(resolve(album, 'notes.txt'), 'Skip this non-image');
  184 |   await page.getByLabel('Upload a photo folder', { exact: true }).setInputFiles(album);
  185 |   await expect(page.getByText('1 unsupported file skipped.')).toBeVisible();
  186 |   await page.getByRole('button', { name: 'Publish event & add station', exact: true }).click();
  187 |   await expect(page.getByRole('status')).toContainText('is published'); await expect(page.locator('[data-stop-kind=event]')).toHaveCount(4);
  188 |   expect(await page.evaluate(() => window.testCanvas === document.querySelector('.nx-world canvas'))).toBe(true);
  189 |   await page.getByRole('button', { name: 'Open holographic map' }).click(); await page.waitForTimeout(1800);
  190 |   await page.screenshot({ path: info.outputPath('desktop-map.png') });
  191 |   const stats = await page.evaluate(() => new Promise(resolve => {
  192 |     const timings = []; let last = 0;
  193 |     function frame(now) { if (last) timings.push(now - last); last = now; if (timings.length < 180) requestAnimationFrame(frame); else { timings.sort((a,b) => a-b); resolve({ medianMs: timings[90], p95Ms: timings[171], ...document.querySelector('.nx-world').dataset }); } } requestAnimationFrame(frame);
  194 |   }));
  195 |   console.log('Desktop map frame sample:', JSON.stringify(stats));
  196 |   const visitor = await browser.newContext({ baseURL: info.project.use.baseURL }), otherPage = await visitor.newPage();
  197 |   await connect(otherPage); await ready(otherPage); await expect(otherPage.locator('[data-stop-kind=event]')).toHaveCount(4);
  198 |   await otherPage.getByRole('button', { name: 'Events 4', exact: true }).click();
  199 |   await otherPage.getByRole('dialog', { name: 'Event stations' }).getByRole('button', { name: /A shared photo workshop/ }).click();
  200 |   await expect(otherPage.getByRole('heading', { name: 'A shared photo workshop' })).toBeVisible();
  201 |   await expect.poll(() => otherPage.locator('.nx-event-gallery img').evaluate(img => img.naturalWidth)).toBe(100);
  202 |   await expect(otherPage.getByRole('link', { name: 'View photo album' })).toHaveAttribute('href', 'https://drive.google.com/drive/folders/workshop');
  203 |   await expect(otherPage.getByRole('link', { name: 'Register for event' })).toHaveAttribute('href', 'https://example.com/register');
  204 |   expect(errors).toEqual([]); await visitor.close();
  205 | });
  206 | 
  207 | for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 844, height: 390 }, { width: 1024, height: 1366 }]) {
  208 |   test(`compact ride controls and camera fit ${viewport.width}x${viewport.height}`, async ({ browser }, info) => {
  209 |     const compact = viewport.width <= 768 || viewport.height <= 500;
  210 |     const context = await browser.newContext({ baseURL: info.project.use.baseURL, viewport, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  211 |     const page = await context.newPage(), errors = [];
  212 |     page.on('pageerror', error => errors.push(error.message));
  213 |     try {
  214 |       await connect(page); await ready(page);
  215 |       const world = page.locator('.nx-world');
  216 |       if (await page.getByRole('button', { name: 'Return to ride' }).isVisible()) await page.getByRole('button', { name: 'Return to ride' }).click();
  217 |       await world.focus();
  218 |       await expect(world).toHaveAttribute('data-drive-ready', 'true');
  219 |       await expect(world).toHaveAttribute('data-antialias', 'true');
  220 |       await expect(page.locator('.nx-joystick')).toBeEnabled();
  221 |       await expect(page.getByRole('button', { name: /restart|reset ride/i })).toHaveCount(0);
  222 |       await expect(page.getByRole('button', { name: 'Events 3', exact: true })).toBeVisible();
  223 |       await expect(page.getByRole('button', { name: 'Add Event', exact: true })).toBeVisible();
  224 |       if (compact) { await expect(page.locator('.nx-minimap')).toHaveCount(0); await expect(page.locator('.nx-glimpses')).toHaveCount(0); }
  225 |       const layout = await page.evaluate(() => {
  226 |         const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
  227 |         return { width: innerWidth, scroll: document.documentElement.scrollWidth, pixelWidth: document.querySelector('.nx-world canvas').width,
  228 |           world: rect('.nx-world'), controls: rect('.nx-controls'), joystick: rect('.nx-joystick'), boost: rect('.nx-boost-button'), map: rect('.nx-map-button'), top: rect('.nx-topbar') };
  229 |       });
  230 |       expect(layout.scroll).toBe(layout.width); expect(layout.pixelWidth / layout.world.width).toBeLessThanOrEqual(1.26);
  231 |       expect(layout.controls.height).toBeLessThanOrEqual(72);
  232 |       expect(layout.controls.y - layout.top.bottom).toBeGreaterThan(layout.world.height * .45);
  233 |       for (const control of [layout.joystick, layout.boost, layout.map]) {
  234 |         expect(control.width).toBeGreaterThanOrEqual(44); expect(control.height).toBeGreaterThanOrEqual(44);
  235 |         expect(control.x).toBeGreaterThanOrEqual(12); expect(control.right).toBeLessThanOrEqual(viewport.width - 12);
  236 |         expect(control.bottom).toBeLessThanOrEqual(layout.world.bottom - 10);
  237 |       }
  238 |       expect(layout.joystick.right + 8).toBeLessThanOrEqual(layout.boost.x);
  239 |       expect(layout.boost.right + 7).toBeLessThanOrEqual(layout.map.x);
  240 |       expect(Math.abs(layout.boost.y - layout.map.y)).toBeLessThan(1);
  241 |       await page.screenshot({ path: info.outputPath('mobile-ride.png') });
  242 |       await page.mouse.move(layout.boost.x + layout.boost.width / 2, layout.boost.y + layout.boost.height / 2); await page.mouse.down();
  243 |       await expect(world).toHaveAttribute('data-boost', 'true');
  244 |       await expect.poll(() => world.getAttribute('data-speed').then(Number), { timeout: 15_000 }).toBeGreaterThan(15);
  245 |       const sample = await page.evaluate(() => new Promise(resolve => {
  246 |         const timings = []; let previous = performance.now();
  247 |         function frame(now) {
  248 |           timings.push(now - previous); previous = now;
  249 |           if (timings.length < 60) requestAnimationFrame(frame);
  250 |           else { timings.sort((a, b) => a - b); resolve({ medianMs: timings[30], p95Ms: timings[57], ...document.querySelector('.nx-world').dataset }); }
  251 |         }
  252 |         requestAnimationFrame(frame);
  253 |       }));
  254 |       console.log(`Ride frame sample ${viewport.width}x${viewport.height}:`, JSON.stringify(sample));
  255 |       expect(Number(sample.cameraLag)).toBeLessThan(.16);
  256 |       expect(Number(sample.fov)).toBeGreaterThanOrEqual(76);
  257 |       await page.mouse.up(); await expect(world).toHaveAttribute('data-boost', 'false');
  258 |       await page.getByRole('button', { name: 'Open holographic map' }).click();
  259 |       await expect(page.locator('.nx-joystick')).toHaveCount(0); await expect(page.locator('.nx-boost-button')).toHaveCount(0);
  260 |       await expect(world).toHaveAttribute('data-orbit', 'true');
  261 |       await page.screenshot({ path: info.outputPath('mobile-map.png') });
  262 |       await page.locator('[data-stop-kind=event]').first().click();
  263 |       await expect(page.getByRole('dialog', { name: 'The first connection' })).toBeVisible();
  264 |       await page.getByRole('button', { name: 'Close event', exact: true }).click();
  265 |       await page.getByRole('button', { name: 'Add Event', exact: true }).click(); await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
  266 |       expect(errors).toEqual([]);
  267 |     } finally { await context.close(); }
  268 |   });
  269 | }
```