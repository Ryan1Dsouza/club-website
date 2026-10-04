# Nucleus loading screen

The loader uses [Freshman's](https://freshman.tv/) frame sequence and curtain transition with a rapid 20 fps cadence. Its animation is a succession of complete scanned sketches.

## Cadence and curtain timing

Desktop replaces one mask every 50 ms, looping over 850 ms. A single animation-frame callback skips missed beats on busy devices and stops when the tab is hidden. Mobile uses one native animated WebP with the same 17 frames and 50 ms cadence, so playback does not wait for 17 separate downloads or depend on JavaScript timers. The loader keeps the existing 1,400 ms minimum measured from startup. Desktop retains centered `cover` sizing. Phones and touch tablets use a dedicated portrait composition: empty margins are trimmed, the main sketches and Nucleus marks are enlarged, and safe-area padding keeps the subjects visible in both orientations.

When data is ready and the minimum interval has elapsed, the curtain exits immediately, with no extra pause. The exit animates from `x: 0%` and `clip-path: inset(0%)` to `x: -20%` and `clip-path: inset(0% 100% 0% 0%)`, using cubic Bézier `(0.77, 0, 0.175, 1)`. Desktop retains this 0.45-second exit. Compact/touch screens use a 0.35-second translation to `x: -100%`, avoiding animated full-screen clipping on mobile GPUs. Opacity stays at 1: the page is revealed from right to left.

## Implementation

- [`LoadingScreen.tsx`](../src/components/shared/LoadingScreen.tsx) owns the overlay, responsive exit, live status, and scroll lock.
- [`loading-screen.css`](../src/components/shared/loading-screen.css) controls responsive artwork fitting. The mask color is `var(--mint, #c3e5c8)` over `var(--bg, #000000)`.
- [`loading-frames.ts`](../src/components/shared/loading-frames.ts) caches desktop frame decoding across overlay mounts, limits desktop decoding to two concurrent images, and defines the startup timing limits. A failed desktop frame uses a decoded replacement. Mobile bypasses this decoding queue entirely. Artwork decoding never delays access to the page.
- [`src/assets/loading`](../src/assets/loading) contains the 17 local WebP alpha masks (about 490 KB in total). They adapt the reference artwork, replacing its wordmark with hand-lettered Nucleus and its tally marks with the official Nucleus brain-and-atom logo in frames 07, 12, and 14. No reference website or CDN is contacted by visitors.
- [`build-mobile-loading-animation.py`](../scripts/build-mobile-loading-animation.py) generates a 480 ? 600 portrait sequence and a static Nucleus poster. Run `python scripts/build-mobile-loading-animation.py` after rebuilding desktop masks. The complete mobile animation is approximately 113 KB in one request. `index.html` preloads it for mobile users who allow motion, before the app and events images start competing for bandwidth. The `<picture>` sources select the static poster for reduced motion and avoid requesting the mobile image on desktop.
- [`build-loading-frames.py`](../scripts/build-loading-frames.py) reproduces those masks from the original `frame-00.webp` through `frame-16.webp` downloads. It preserves the source compositions and alpha at half resolution; frame 15 retains its different aspect ratio. Asset source URLs are recorded in [`sources.json`](../src/assets/loading/sources.json).

The frame builder rasterizes [`public/favicon.svg`](../public/favicon.svg) using the project's Playwright Chromium installation, then composites its alpha mask with Pillow. The favicon uses the existing Nucleus vector paths with `fill-rule="evenodd"` to preserve the openings in the brain and atom. Rebuild the frames after changing those paths so the tab and loading animation share the same mark. `LoadingScreen.tsx` consumes these generated masks; it does not hardcode logo paths or fetch the favicon at runtime.

`App.tsx` renders the first frame with server HTML, then plays the intro once after hydration on both client-rendered and production server-rendered pages. A `noscript` rule hides the curtain when JavaScript is disabled, leaving server content usable. Startup waits only for the first API request when server data is absent; local fonts and loader artwork load independently. The 1,400 ms minimum starts when the startup effect begins, and decoding never restarts it. With data ready, the visible sequence takes approximately **1.85 seconds on desktop** or **1.75 seconds on mobile**, measured from startup after hydration.

Server-rendered data stays usable as the background API refresh runs. A 1.5-second startup deadline begins the exit if the initial request stalls, revealing seed data while the request continues in the background. This limits the intended blocking interval to approximately 1.95 seconds on desktop or 1.85 seconds on mobile. The site remains inert and scroll-locked until the curtain finishes; route changes and background refreshes do not replay it. The home logo's scene code warms up behind the loader, and its particle assembly begins when the loading stage switches to `done`, after the curtain has exited. Admin has a separate entry point.

Reduced motion shows one static frame (the larger Nucleus wordmark poster on mobile) with no artificial minimum, pause, or curtain motion. All timers, listeners, scroll styles, and pending state updates clean up on unmount and under React Strict Mode.

## Reuse and verification

Mount one `LoadingScreen` outside transformed/clipped ancestors. Keep it mounted and set `active={false}` when the parent finishes its work and minimum display interval; use `onExitComplete` to restore access to covered content. `message` defaults to the screen-reader status “Connecting the dots…”.

Run `npm run test:browser -- tests/browser/loading-screen.spec.mjs` for browser checks covering desktop frame cuts and loop boundaries, native mobile playback with JS paused, desktop/mobile duration, the opaque curtain exit, prominent phone/tablet/landscape artwork, image failure, reduced motion, the startup deadline, navigation, and hydration. `tests/browser/mobile-loader-startup.spec.mjs` tests the production static `/events` entry with a cold cache, 4? CPU slowdown, 150 ms latency, and 200 KB/s throughput; the mobile animation must be ready at least 500 ms before the curtain starts exiting. The home-motion suite covers the logo assembly handoff.
