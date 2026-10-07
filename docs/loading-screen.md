# Nucleus loading screen

The loader preserves the 17 scanned sketches and 20fps cadence (an 850ms loop). Landscape screens use a 1440 × 810 silent H.264 clip; portrait screens use a 480 × 1040 composition. Both clips and their posters use the current `--mint` ink (#9bcfa2) and shared `--page-backdrop` background (6% mint mixed into `--surface-raised`, rounded to #0f1c11), read from `src/styles.css` by the asset builder. This matches the base background used by the home, events, work, achievements, and news pages. The loader's CSS uses the same backdrop token; the initial HTML background and browser theme color use its hex equivalent. Native inline video owns playback and decoding, so the artwork has no JavaScript frame timer, React render loop, or changing CSS mask. A static Nucleus poster remains behind it if playback is blocked, unsupported, delayed, or unavailable.

The curtain exits using only `transform: translateX(-100%)`, over 450ms on desktop or 350ms on compact/touch screens. It remains opaque and does not animate a full-screen clip path. Artwork uses `object-fit: cover` and dynamic viewport height in both orientations, without a padded container or letterboxing. The portrait asset keeps its subjects in a central 400 × 600 safe region so tall phones and 4:3 tablets crop only the background. Rotating to landscape selects the wide composition for both poster and video. The viewport extends under display cutouts. Reduced motion shows only the poster and has no artificial minimum or curtain animation.

The artwork group uses `mix-blend-mode: lighten` inside the isolated, opaque loader. This absorbs the video decoder's small dark-background shift (the mobile clip's sampled edges are #0f1c10, versus the poster's #0f1c11) without visible rectangular seams. Blending the group, rather than the video and poster individually, keeps the video opaque over its fallback and prevents a second sketch from showing through. The rule applies in both orientations and at every screen size.

## Startup and lifecycle

`index.html` preloads the orientation-matched clip as a high-priority fetch before the application and route assets compete for bandwidth. The loader reuses that response as a revocable blob URL; native low-priority video requests otherwise arrive too late on a cold mobile connection. The production CSP explicitly allows blob media. Nonmatching and reduced-motion preloads do not download. The clips are approximately 369KB landscape / 157KB portrait. Mobile video is larger than the previous animated WebP; this trades transfer size for native media presentation independent of the JavaScript animation clock.

Startup still has a 1400ms minimum and a 1500ms deadline, measured after boot. Fonts, artwork, and a stalled API cannot extend that deadline. Server data stays usable while refreshing, the site stays inert until exit completes, and navigation does not replay the loader. The home logo assembly starts after the curtain exits. Without JavaScript, the server content remains accessible.

Playback pauses in hidden tabs. Unmount, motion preference changes, and responsive source changes cancel fetches, pause playback, and revoke object URLs. Reduced motion neither fetches nor decodes video. Scroll styles and media listeners are restored on cleanup, including Strict Mode.

## Assets and verification

- `scripts/build-loading-frames.py` rebuilds the original alpha masks and Nucleus substitutions.
- `scripts/build-mobile-loading-animation.py` builds the intermediate portrait compositions from those masks.
- `python scripts/build-loading-video.py` generates both clips and posters using Pillow and ffmpeg, recolors them from the site palette (including the backdrop's sRGB color mix), and reframes portrait artwork for a full-screen canvas. Rerun it after changing the palette tokens and update the matching hex fallbacks in `index.html` and `loading-screen.css`. It preserves all cuts, uses baseline H.264, and places MP4 metadata first. Original masks remain as source assets and are not imported into the application bundle.
- `src/components/shared/LoadingScreen.tsx` owns playback, readiness, exit, and scroll locking. `loading-screen.css` owns responsive fitting. `loading-frames.ts` contains only the startup limits.

Run `npm run build` and `npm run test:browser -- tests/browser/loading-screen.spec.mjs tests/browser/mobile-loader-startup.spec.mjs`. Coverage includes desktop/mobile playback with JS clocks paused, portrait/landscape/tablet fitting, reduction of motion, media failure, delayed assets, the startup deadline, navigation, and SSR hydration. The cold-start check uses the production SPA with a 4× CPU slowdown, 150ms latency and 200KB/s throughput.
