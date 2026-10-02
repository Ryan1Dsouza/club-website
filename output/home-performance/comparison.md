# Homepage mobile performance

Measured on 2 October 2026 using the local production SSR build, an isolated database, and a clean Chromium session. Both runs use Lighthouse mobile defaults: 4x CPU slowdown and simulated mobile networking. The full particle-to-logo formation is enabled in the final run.

| Metric | Local baseline | Final run |
| --- | ---: | ---: |
| Performance score | 79 | 91 |
| Total blocking time | 450 ms | 120 ms |
| First contentful paint | 2.1 s | 2.0 s |
| Largest contentful paint | 3.0 s | 3.0 s |
| Time to interactive | 5.3 s | 3.9 s |
| Transferred JavaScript, including request overhead | 362,819 bytes | 299,364 bytes |
| Cumulative layout shift | 0 | 0 |

The final run also scores 100 for accessibility, best practices, and SEO. These are individual lab runs, not field measurements. The user's score of 35 came from a different audit environment and is not the baseline used here. The rejected static-logo experiment is excluded from this comparison.

Changes include deferred secondary routes and their styles, server-rendered route stylesheet links, and shared scroll updates instead of per-letter animation subscriptions. The homepage no longer requests the People scene, Events page, or GSAP scroll module during startup. Three.js remains necessary for the requested logo formation.

The logo starts after the loader exits, uses less setup work, yields between setup stages, and retains its final frame on phones without a continuous render loop. The ambient particles use a local particles.js asset, at most 28 particles on phones and 64 on desktop, a bounded canvas, a capped draw rate, automatic quality reduction, and pause/cleanup behavior for hidden tabs, overlays, and route changes. Reduced motion and data saving use a static ambient field.

Reports: [baseline](before.html), [final](after.html), and their accompanying JSON files. Reproduce with `npm.cmd run build` followed by `node scripts/audit-site.mjs mobile-home`.
