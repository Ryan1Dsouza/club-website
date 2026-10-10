# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual-readiness.spec.mjs >> a slow modal photo shows the same loader above the dialog and restores scrolling
- Location: tests\browser\visual-readiness.spec.mjs:33:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - status [ref=e4]: Connecting the dots…
    - generic [ref=e5]:
      - link "Skip to content" [ref=e6] [cursor=pointer]:
        - /url: "#main-content"
      - banner:
        - navigation "Main navigation":
          - generic:
            - generic [ref=e7]:
              - link "Nucleus home" [ref=e8] [cursor=pointer]:
                - /url: /
                - text: Nucleus
              - button "Website sound" [pressed] [ref=e9] [cursor=pointer]
              - button "Open menu" [ref=e14] [cursor=pointer]
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
                    - listitem:
                      - link:
                        - /url: /recruitment
                        - generic [aria-hidden]:
                          - generic: R
                          - generic: e
                          - generic: c
                          - generic: r
                          - generic: u
                          - generic: i
                          - generic: t
                          - generic: m
                          - generic: e
                          - generic: "n"
                          - generic: t
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
                        - /url: mailto:nucleussjec@gmail.com
                        - text: Email
                - generic:
                  - generic:
                    - generic: Made of many minds
                    - generic: © 2026 Nucleus SJEC
                  - generic:
                    - generic: The community
                    - button: Join Nucleus
      - main [ref=e18]:
        - region "Nucleus events" [ref=e19]:
          - generic [ref=e20]:
            - heading "Events." [level=1] [ref=e22]
            - generic [ref=e23]:
              - article [ref=e24]:
                - button "Open Inauguration event book" [ref=e25] [cursor=pointer]:
                  - generic [ref=e26]:
                    - generic [ref=e27]: FIELD NOTES / 01
                    - generic [ref=e28]: Open the story
                  - generic [ref=e32]:
                    - generic [ref=e33]:
                      - text: Workshop
                      - generic [ref=e34]: 12 photographs
                    - generic [ref=e35]: Inauguration
                    - generic [ref=e39]:
                      - generic [ref=e40]: From the Nucleus archive
                      - generic [ref=e41]: "01"
              - article [ref=e42]:
                - button "Open LinkedIn event book" [ref=e43] [cursor=pointer]:
                  - generic [ref=e44]:
                    - generic [ref=e45]: FIELD NOTES / 02
                    - generic [ref=e46]: Open the story
                  - generic [ref=e50]:
                    - generic [ref=e51]:
                      - text: Workshop
                      - generic [ref=e52]: 09 photographs
                    - generic [ref=e53]: LinkedIn
                    - generic [ref=e57]:
                      - generic [ref=e58]: From the Nucleus archive
                      - generic [ref=e59]: "02"
              - article [ref=e60]:
                - button "Open Dev event book" [ref=e61] [cursor=pointer]:
                  - generic [ref=e62]:
                    - generic [ref=e63]: FIELD NOTES / 03
                    - generic [ref=e64]: Open the story
                  - generic [ref=e68]:
                    - generic [ref=e69]:
                      - text: Workshop
                      - generic [ref=e70]: 02 photographs
                    - generic [ref=e71]: Dev
                    - generic [ref=e75]:
                      - generic [ref=e76]: From the Nucleus archive
                      - generic [ref=e77]: "03"
              - article [ref=e78]:
                - button "Open Khoj event book" [ref=e79] [cursor=pointer]:
                  - generic [ref=e80]:
                    - generic [ref=e81]: FIELD NOTES / 04
                    - generic [ref=e82]: Open the story
                  - generic [ref=e86]:
                    - generic [ref=e87]:
                      - text: Workshop
                      - generic [ref=e88]: 04 photographs
                    - generic [ref=e89]: Khoj
                    - generic [ref=e93]:
                      - generic [ref=e94]: From the Nucleus archive
                      - generic [ref=e95]: "04"
              - article [ref=e96]:
                - button "Open n8n event book" [ref=e97] [cursor=pointer]:
                  - generic [ref=e98]:
                    - generic [ref=e99]: FIELD NOTES / 05
                    - generic [ref=e100]: Open the story
                  - generic [ref=e104]:
                    - generic [ref=e105]:
                      - text: Workshop
                      - generic [ref=e106]: 04 photographs
                    - generic [ref=e107]: n8n
                    - generic [ref=e111]:
                      - generic [ref=e112]: From the Nucleus archive
                      - generic [ref=e113]: "05"
              - article [ref=e114]:
                - button "Open Noesis event book" [ref=e115] [cursor=pointer]:
                  - generic [ref=e116]:
                    - generic [ref=e117]: FIELD NOTES / 06
                    - generic [ref=e118]: Open the story
                  - generic [ref=e122]:
                    - generic [ref=e123]:
                      - text: Workshop
                      - generic [ref=e124]: 07 photographs
                    - generic [ref=e125]: Noesis
                    - generic [ref=e129]:
                      - generic [ref=e130]: From the Nucleus archive
                      - generic [ref=e131]: "06"
              - article [ref=e132]:
                - button "Open Unlocked event book" [ref=e133] [cursor=pointer]:
                  - generic [ref=e134]:
                    - generic [ref=e135]: FIELD NOTES / 07
                    - generic [ref=e136]: Open the story
                  - generic [ref=e140]:
                    - generic [ref=e141]:
                      - text: Workshop
                      - generic [ref=e142]: 06 photographs
                    - generic [ref=e143]: Unlocked
                    - generic [ref=e147]:
                      - generic [ref=e148]: From the Nucleus archive
                      - generic [ref=e149]: "07"
              - article [ref=e150]:
                - button "Open Coding event book" [ref=e151] [cursor=pointer]:
                  - generic [ref=e152]:
                    - generic [ref=e153]: FIELD NOTES / 08
                    - generic [ref=e154]: Open the story
                  - generic [ref=e158]:
                    - generic [ref=e159]:
                      - text: Workshop
                      - generic [ref=e160]: 11 photographs
                    - generic [ref=e161]: Coding
                    - generic [ref=e165]:
                      - generic [ref=e166]: From the Nucleus archive
                      - generic [ref=e167]: "08"
              - article [ref=e168]:
                - button "Open The first connection event book" [ref=e169] [cursor=pointer]:
                  - generic [ref=e170]:
                    - generic [ref=e188]: FIELD NOTES / 09
                    - generic [ref=e189]: Open the story
                  - generic [ref=e193]:
                    - generic [ref=e194]:
                      - text: Inauguration
                      - generic [ref=e195]: 00 photographs
                    - generic [ref=e196]: The first connection
                    - generic [ref=e200]:
                      - generic [ref=e201]: 12 Mar 2026
                      - generic [ref=e202]: "09"
              - article [ref=e203]:
                - button "Open Beyond the baseline event book" [ref=e204] [cursor=pointer]:
                  - generic [ref=e205]:
                    - generic [ref=e246]: FIELD NOTES / 10
                    - generic [ref=e247]: Open the story
                  - generic [ref=e251]:
                    - generic [ref=e252]:
                      - text: AI workshop
                      - generic [ref=e253]: 00 photographs
                    - generic [ref=e254]: Beyond the baseline
                    - generic [ref=e258]:
                      - generic [ref=e259]: 12 Mar 2026
                      - generic [ref=e260]: "10"
              - article [ref=e261]:
                - button "Open Find your people event book" [ref=e262] [cursor=pointer]:
                  - generic [ref=e263]:
                    - generic [ref=e286]: FIELD NOTES / 11
                    - generic [ref=e287]: Open the story
                  - generic [ref=e291]:
                    - generic [ref=e292]:
                      - text: Community
                      - generic [ref=e293]: 00 photographs
                    - generic [ref=e294]: Find your people
                    - generic [ref=e298]:
                      - generic [ref=e299]: 12 Mar 2026
                      - generic [ref=e300]: "11"
              - button "The Nucleus Ride" [ref=e302] [cursor=pointer]:
                - generic [ref=e303]:
                  - generic [ref=e304]: The Nucleus Ride
                  - generic [ref=e305]: Board the journey
              - button "The Nucleus Ride" [ref=e310] [cursor=pointer]:
                - generic [ref=e311]:
                  - generic [ref=e312]: The Nucleus Ride
                  - generic [ref=e313]: Every stop, a story
            - generic [ref=e317]:
              - generic [ref=e318]: Open a story. Relive a moment.
              - generic [ref=e319]: Made of many minds.
  - dialog "Inauguration" [ref=e320]:
    - button "Close event" [ref=e321] [cursor=pointer]
    - button "Website sound" [pressed] [ref=e325] [cursor=pointer]
    - generic [ref=e330]:
      - banner [ref=e331]:
        - generic [ref=e332]: NUCLEUS FIELD NOTES
        - generic [ref=e333]: STATION / 01
      - heading "Inauguration" [level=2] [ref=e334]
      - region "Inauguration event book" [active] [ref=e337]:
        - generic [ref=e338]:
          - region "Event story" [ref=e340]:
            - generic [ref=e341]: Workshop / Issue 01
            - generic [aria-hidden] [ref=e342]: Inauguration
            - generic [ref=e343]:
              - paragraph [ref=e344]: A moment from Inauguration. The Nucleus community came together to explore new ideas, learn with one another, and share what they discovered. This chapter collects the people and moments that made the event. A full event recap will be added here.
              - generic [ref=e345]: Date to be added
              - paragraph [ref=e349]: Key highlightsIdeas shared. Skills explored. Connections made.
            - generic [ref=e350]: Made of many minds. / SJEC
          - figure [ref=e352]:
            - link "Open Inauguration photograph 1" [ref=e353] [cursor=pointer]:
              - /url: /workshops/inauguration/in1.avif
              - img "Inauguration — photograph 1" [ref=e354]
      - contentinfo [ref=e355]:
        - generic [ref=e357]:
          - button "Previous book page" [disabled] [ref=e358]
          - status [ref=e361]: Page 1 / 7
          - button "Next book page" [ref=e362] [cursor=pointer]
          - paragraph [ref=e365]: Scroll to turn · arrow keys work too
        - button "Back to Events" [ref=e369] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { readFile } from 'node:fs/promises';
  3  | const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
  4  | 
  5  | test.beforeEach(async ({ page }) => {
  6  |   await page.route('**/api/site', route => route.fulfill({ json: site }));
  7  |   await page.route('**/rest/v1/events?*', route => route.fulfill({ json: [] }));
  8  | });
  9  | 
  10 | test('slow visible images retain the animated loader until decoded', async ({ page }) => {
  11 |   let release;
  12 |   const held = new Promise(resolve => { release = resolve; });
  13 |   await page.route('**/workshop_images/**', async route => { await held; await route.continue().catch(() => {}); });
  14 |   await page.goto('/events', { waitUntil: 'domcontentloaded' });
  15 |   await page.waitForTimeout(2400);
  16 |   await expect(page.locator('[data-loading-screen]')).toBeVisible();
  17 |   await expect(page.locator('.site-shell')).toHaveAttribute('inert');
  18 |   release();
  19 |   await expect(page.locator('[data-loading-screen]')).toHaveCount(0, { timeout: 15000 });
  20 |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  21 |   expect(await page.locator('.event-card__photo').first().evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  22 | });
  23 | 
  24 | test('failed photos release the loading curtain and leave the page usable', async ({ page }) => {
  25 |   await page.route('**/workshop_images/**', route => route.abort());
  26 |   await page.route('**/workshops/**', route => route.abort());
  27 |   await page.goto('/events', { waitUntil: 'domcontentloaded' });
  28 |   await expect(page.locator('[data-loading-screen]')).toHaveCount(0, { timeout: 10000 });
  29 |   await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
  30 |   await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeEnabled();
  31 | });
  32 | 
  33 | test('a slow modal photo shows the same loader above the dialog and restores scrolling', async ({ page }) => {
  34 |   await page.goto('/events');
  35 |   await expect(page.locator('[data-loading-screen]')).toHaveCount(0, { timeout: 15000 });
  36 |   await page.getByRole('button', { name: 'Open Inauguration event book', exact: true }).click();
  37 |   await expect(page.locator('.nx-book-dialog')).toBeVisible();
  38 |   let release;
  39 |   const held = new Promise(resolve => { release = resolve; });
  40 |   await page.route('**/*readiness=held', async route => { await held; await route.continue().catch(() => {}); });
  41 |   await page.locator('.nx-book-dialog').evaluate(dialog => {
  42 |     const image = document.createElement('img'); image.src = '/brain-mark.svg?readiness=held';
  43 |     image.style.cssText = 'position:fixed;top:100px;left:100px;width:200px;height:200px';
  44 |     dialog.append(image);
  45 |   });
  46 |   await expect(page.locator('[data-loading-screen]')).toBeVisible();
> 47 |   expect(await page.evaluate(() => !!document.elementFromPoint(20, 20)?.closest('[data-loading-screen]'))).toBe(true);
     |                                                                                                            ^ Error: expect(received).toBe(expected) // Object.is equality
  48 |   release();
  49 |   await expect(page.locator('[data-loading-screen]')).toHaveCount(0, { timeout: 10000 });
  50 |   await page.getByRole('button', { name: 'Close event', exact: true }).click();
  51 |   await expect(page.locator('.nx-book-dialog')).toHaveCount(0);
  52 |   expect(await page.locator('body').evaluate(body => body.style.overflow)).toBe('');
  53 |   await page.mouse.wheel(0, 400);
  54 |   await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  55 | });
  56 | 
```