# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: book-smoothness.spec.mjs >> a wheel notch settles without a second speed jump and the rendered cart stays with the leaf
- Location: tests\browser\book-smoothness.spec.mjs:6:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 1
Received: 0.743
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
                      - generic [ref=e40]: 7 Oct 2026
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
                      - generic [ref=e58]: 4 Oct 2026
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
                      - generic [ref=e76]: 6 Oct 2026
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
                      - generic [ref=e94]: 5 Oct 2026
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
                      - generic [ref=e112]: 3 Oct 2026
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
                      - generic [ref=e130]: 2 Oct 2026
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
                      - generic [ref=e148]: 1 Oct 2026
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
                      - generic [ref=e166]: 30 Sept 2026
                      - generic [ref=e167]: "08"
              - button "The Nucleus Ride" [ref=e169] [cursor=pointer]:
                - generic [ref=e170]:
                  - generic [ref=e171]: The Nucleus Ride
                  - generic [ref=e172]: Board the journey
              - button "The Nucleus Ride" [ref=e177] [cursor=pointer]:
                - generic [ref=e178]:
                  - generic [ref=e179]: The Nucleus Ride
                  - generic [ref=e180]: Every stop, a story
            - generic [ref=e184]:
              - generic [ref=e185]: Open a story. Relive a moment.
              - generic [ref=e186]: Made of many minds.
  - dialog "Inauguration" [ref=e187]:
    - button "Close event" [ref=e188] [cursor=pointer]
    - button "Website sound" [pressed] [ref=e192] [cursor=pointer]
    - generic [ref=e197]:
      - banner [ref=e198]:
        - generic [ref=e199]: NUCLEUS FIELD NOTES
        - generic [ref=e200]: STATION / 01
      - heading "Inauguration" [level=2] [ref=e201]
      - region "Inauguration event book" [active] [ref=e204]:
        - generic [ref=e205]:
          - region "Event story" [ref=e207]:
            - generic [ref=e208]: Workshop / Issue 01
            - generic [aria-hidden] [ref=e209]: Inauguration
            - generic [ref=e210]:
              - paragraph [ref=e211]: A moment from Inauguration. The Nucleus community came together to explore new ideas, learn with one another, and share what they discovered.
              - generic [ref=e212]:
                - generic [ref=e213]: 7 Oct 2026
                - generic [ref=e216]: St. Joseph Engineering College
              - paragraph [ref=e220]: Key highlightsIdeas shared. Skills explored. Connections made.
            - generic [ref=e221]: Made of many minds. / SJEC
          - figure [ref=e223]:
            - link "Open Inauguration photograph 3" [ref=e224] [cursor=pointer]:
              - /url: https://diqzjvlcowxhbzrvplqb.supabase.co/storage/v1/object/public/event-photos/0c1e2ce4-5129-4fe1-b313-300365be28e5/e746974d-1d1a-475f-ac92-97244b5ee111.avif
              - img "Inauguration — photograph 3" [ref=e225]
        - generic [aria-hidden]:
          - generic:
            - generic:
              - generic:
                - figure
            - generic:
              - generic:
                - figure
            - generic:
              - generic:
                - generic:
                  - figure
              - generic:
                - generic:
                  - figure
              - generic:
                - generic:
                  - generic:
                    - figure
                - generic:
                  - generic:
                    - figure
                - generic:
                  - generic:
                    - generic:
                      - figure
                  - generic:
                    - generic:
                      - figure
                  - generic:
                    - generic:
                      - generic:
                        - figure
                    - generic:
                      - generic:
                        - figure
                    - generic:
                      - generic:
                        - generic:
                          - figure
                      - generic:
                        - generic:
                          - figure
                      - generic:
                        - generic:
                          - generic:
                            - figure
                        - generic:
                          - generic:
                            - figure
                        - generic:
                          - generic:
                            - generic:
                              - figure
                          - generic:
                            - generic:
                              - figure
      - contentinfo [ref=e226]:
        - generic [ref=e228]:
          - button "Previous book page" [ref=e229] [cursor=pointer]
          - status [ref=e232]: Page 1 / 7
          - button "Next book page" [ref=e233] [cursor=pointer]
          - paragraph [ref=e236]: Scroll to turn · arrow keys work too
        - button "Back to Events" [ref=e240] [cursor=pointer]
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
> 33 |     expect(frames.at(-1).value).toBe(direction > 0 ? 1 : 0);
     |                                 ^ Error: expect(received).toBe(expected) // Object.is equality
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
  47 |     expect(increases.length).toBeGreaterThan(8);
  48 |     // The old delayed exponential snap abruptly added ~6 pages/second.
  49 |     // Allow normal frame jitter while catching that visible kick in speed.
  50 |     expect(Math.max(...increases)).toBeLessThan(2.5);
  51 |   }
  52 | });
  53 | 
```