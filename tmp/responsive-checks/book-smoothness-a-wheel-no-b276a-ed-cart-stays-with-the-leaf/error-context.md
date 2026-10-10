# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: book-smoothness.spec.mjs >> a wheel notch settles without a second speed jump and the rendered cart stays with the leaf
- Location: tests\browser\book-smoothness.spec.mjs:6:1

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 8
Received:   1
```

# Page snapshot

```yaml
- generic [ref=e1]:
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
            - button "Website sound" [pressed] [ref=e7] [cursor=pointer]
            - button "Open menu" [ref=e12] [cursor=pointer]
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
    - main [ref=e16]:
      - region "Nucleus events" [ref=e17]:
        - generic [ref=e18]:
          - heading "Events." [level=1] [ref=e20]
          - generic [ref=e21]:
            - article [ref=e22]:
              - button "Open Inauguration event book" [ref=e23] [cursor=pointer]:
                - generic [ref=e24]:
                  - generic [ref=e25]: FIELD NOTES / 01
                  - generic [ref=e26]: Open the story
                - generic [ref=e30]:
                  - generic [ref=e31]:
                    - text: Workshop
                    - generic [ref=e32]: 12 photographs
                  - generic [ref=e33]: Inauguration
                  - generic [ref=e37]:
                    - generic [ref=e38]: 7 Oct 2026
                    - generic [ref=e39]: "01"
            - article [ref=e40]:
              - button "Open LinkedIn event book" [ref=e41] [cursor=pointer]:
                - generic [ref=e42]:
                  - generic [ref=e43]: FIELD NOTES / 02
                  - generic [ref=e44]: Open the story
                - generic [ref=e48]:
                  - generic [ref=e49]:
                    - text: Workshop
                    - generic [ref=e50]: 09 photographs
                  - generic [ref=e51]: LinkedIn
                  - generic [ref=e55]:
                    - generic [ref=e56]: 4 Oct 2026
                    - generic [ref=e57]: "02"
            - article [ref=e58]:
              - button "Open Dev event book" [ref=e59] [cursor=pointer]:
                - generic [ref=e60]:
                  - generic [ref=e61]: FIELD NOTES / 03
                  - generic [ref=e62]: Open the story
                - generic [ref=e66]:
                  - generic [ref=e67]:
                    - text: Workshop
                    - generic [ref=e68]: 02 photographs
                  - generic [ref=e69]: Dev
                  - generic [ref=e73]:
                    - generic [ref=e74]: 6 Oct 2026
                    - generic [ref=e75]: "03"
            - article [ref=e76]:
              - button "Open Khoj event book" [ref=e77] [cursor=pointer]:
                - generic [ref=e78]:
                  - generic [ref=e79]: FIELD NOTES / 04
                  - generic [ref=e80]: Open the story
                - generic [ref=e84]:
                  - generic [ref=e85]:
                    - text: Workshop
                    - generic [ref=e86]: 04 photographs
                  - generic [ref=e87]: Khoj
                  - generic [ref=e91]:
                    - generic [ref=e92]: 5 Oct 2026
                    - generic [ref=e93]: "04"
            - article [ref=e94]:
              - button "Open n8n event book" [ref=e95] [cursor=pointer]:
                - generic [ref=e96]:
                  - generic [ref=e97]: FIELD NOTES / 05
                  - generic [ref=e98]: Open the story
                - generic [ref=e102]:
                  - generic [ref=e103]:
                    - text: Workshop
                    - generic [ref=e104]: 04 photographs
                  - generic [ref=e105]: n8n
                  - generic [ref=e109]:
                    - generic [ref=e110]: 3 Oct 2026
                    - generic [ref=e111]: "05"
            - article [ref=e112]:
              - button "Open Noesis event book" [ref=e113] [cursor=pointer]:
                - generic [ref=e114]:
                  - generic [ref=e115]: FIELD NOTES / 06
                  - generic [ref=e116]: Open the story
                - generic [ref=e120]:
                  - generic [ref=e121]:
                    - text: Workshop
                    - generic [ref=e122]: 07 photographs
                  - generic [ref=e123]: Noesis
                  - generic [ref=e127]:
                    - generic [ref=e128]: 2 Oct 2026
                    - generic [ref=e129]: "06"
            - article [ref=e130]:
              - button "Open Unlocked event book" [ref=e131] [cursor=pointer]:
                - generic [ref=e132]:
                  - generic [ref=e133]: FIELD NOTES / 07
                  - generic [ref=e134]: Open the story
                - generic [ref=e138]:
                  - generic [ref=e139]:
                    - text: Workshop
                    - generic [ref=e140]: 06 photographs
                  - generic [ref=e141]: Unlocked
                  - generic [ref=e145]:
                    - generic [ref=e146]: 1 Oct 2026
                    - generic [ref=e147]: "07"
            - article [ref=e148]:
              - button "Open Coding event book" [ref=e149] [cursor=pointer]:
                - generic [ref=e150]:
                  - generic [ref=e151]: FIELD NOTES / 08
                  - generic [ref=e152]: Open the story
                - generic [ref=e156]:
                  - generic [ref=e157]:
                    - text: Workshop
                    - generic [ref=e158]: 11 photographs
                  - generic [ref=e159]: Coding
                  - generic [ref=e163]:
                    - generic [ref=e164]: 30 Sept 2026
                    - generic [ref=e165]: "08"
            - button "The Nucleus Ride" [ref=e167] [cursor=pointer]:
              - generic [ref=e168]:
                - generic [ref=e169]: The Nucleus Ride
                - generic [ref=e170]: Board the journey
            - button "The Nucleus Ride" [ref=e175] [cursor=pointer]:
              - generic [ref=e176]:
                - generic [ref=e177]: The Nucleus Ride
                - generic [ref=e178]: Every stop, a story
          - generic [ref=e182]:
            - generic [ref=e183]: Open a story. Relive a moment.
            - generic [ref=e184]: Made of many minds.
  - dialog "Inauguration" [ref=e185]:
    - button "Close event" [ref=e186] [cursor=pointer]
    - button "Website sound" [pressed] [ref=e190] [cursor=pointer]
    - generic [ref=e195]:
      - banner [ref=e196]:
        - generic [ref=e197]: NUCLEUS FIELD NOTES
        - generic [ref=e198]: STATION / 01
      - heading "Inauguration" [level=2] [ref=e199]
      - region "Inauguration event book" [active] [ref=e202]:
        - generic [ref=e203]:
          - figure [ref=e205]:
            - link "Open Inauguration photograph 2" [ref=e206] [cursor=pointer]:
              - /url: https://diqzjvlcowxhbzrvplqb.supabase.co/storage/v1/object/public/event-photos/0c1e2ce4-5129-4fe1-b313-300365be28e5/9f212dc6-bd01-4e2e-b8cd-a15fe51d882c.avif
              - img "Inauguration — photograph 2" [ref=e207]
          - figure [ref=e209]:
            - link "Open Inauguration photograph 3" [ref=e210] [cursor=pointer]:
              - /url: https://diqzjvlcowxhbzrvplqb.supabase.co/storage/v1/object/public/event-photos/0c1e2ce4-5129-4fe1-b313-300365be28e5/e746974d-1d1a-475f-ac92-97244b5ee111.avif
              - img "Inauguration — photograph 3" [ref=e211]
      - contentinfo [ref=e212]:
        - generic [ref=e214]:
          - button "Previous book page" [ref=e215] [cursor=pointer]
          - status [ref=e218]: Page 2 / 7
          - button "Next book page" [ref=e219] [cursor=pointer]
          - paragraph [ref=e222]: Scroll to turn · arrow keys work too
        - button "Back to Events" [ref=e226] [cursor=pointer]
    - status [ref=e230]: Connecting the dots…
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { readFile } from 'node:fs/promises';
  3  | 
  4  | const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
  5  | 
  6  | test('a wheel notch settles without a second speed jump and the rendered cart stays with the leaf', async ({ page }, info) => {
  7  |   await page.setViewportSize({ width: 1440, height: 900 });
  8  |   await page.route('**/api/site', route => route.fulfill({ json: site }));
  9  |   await page.goto('/events');
  10 |   await expect(page.locator('[data-loading-screen]')).toHaveCount(0, { timeout: 20_000 });
  11 |   await page.getByRole('button', { name: 'Open Inauguration event book', exact: true }).click();
  12 |   await page.locator('.nx-book-dialog').evaluate(async dialog => {
  13 |     await Promise.all(dialog.getAnimations().map(animation => animation.finished));
  14 |     await Promise.all([...dialog.querySelectorAll('img')].map(image => image.decode()));
  15 |   });
  16 |   const book = page.locator('.station-book');
  17 |   for (const direction of [1, -1]) {
  18 |     const frames = await book.evaluate(async (element, direction) => {
  19 |       const scroller = element.querySelector('.station-book__scroller');
  20 |       const journey = element.querySelector('.railway-track__journey');
  21 |       const width = journey.getBoundingClientRect().width;
  22 |       const count = Number(element.querySelector('[role=status]').textContent.split('/')[1]);
  23 |       const frames = [], start = performance.now();
  24 |       scroller.dispatchEvent(new WheelEvent('wheel', { deltaY: direction * 80, bubbles: true, cancelable: true }));
  25 |       while (performance.now() - start < 1100) {
  26 |         const time = await new Promise(requestAnimationFrame);
  27 |         frames.push({ time, value: Number(element.dataset.bookProgress),
  28 |           cart: new DOMMatrix(getComputedStyle(journey).transform).m41 / width * count });
  29 |       }
  30 |       return frames;
  31 |     }, direction);
  32 |     await info.attach(`wheel-${direction}.json`, { body: JSON.stringify(frames), contentType: 'application/json' });
  33 |     expect(frames.at(-1).value).toBe(direction > 0 ? 1 : 0);
  34 |     const increases = [];
  35 |     for (let i = 1; i < frames.length; i++) {
  36 |       const current = frames[i], previous = frames[i - 1];
  37 |       expect((current.value - previous.value) * direction).toBeGreaterThanOrEqual(0);
  38 |       // Check the real CSS transform, not just the requested progress value.
  39 |       expect(current.cart).toBeCloseTo(current.value, 2);
  40 |       if (i < 2 || current.value < .04 || current.value > .96) continue;
  41 |       const before = frames[i - 2], dt = current.time - previous.time, previousDt = previous.time - before.time;
  42 |       if (dt < 8 || dt > 40 || previousDt < 8 || previousDt > 40) continue;
  43 |       const speed = direction * (current.value - previous.value) * 1000 / dt;
  44 |       const previousSpeed = direction * (previous.value - before.value) * 1000 / previousDt;
  45 |       increases.push(speed - previousSpeed);
  46 |     }
> 47 |     expect(increases.length).toBeGreaterThan(8);
     |                              ^ Error: expect(received).toBeGreaterThan(expected)
  48 |     // The old delayed exponential snap abruptly added ~6 pages/second.
  49 |     // Allow normal frame jitter while catching that visible kick in speed.
  50 |     expect(Math.max(...increases)).toBeLessThan(2.5);
  51 |   }
  52 | });
  53 | 
```