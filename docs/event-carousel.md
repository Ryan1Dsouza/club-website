# Experiences: choice, carousel, and ride

## Motion reference

The [Guitar list carousel by Sacha Jerrems](https://dribbble.com/shots/12816714-Guitar-list-carousel) was inspected before implementation. The original [animation video](https://cdn.dribbble.com/userupload/27854392/file/large-281678b1027f3085d918735c062a00c5.mp4) is 800 × 600, 60 fps, and 8.65 seconds long. Frame samples at 100 ms intervals show:

- Narrow horizontal panels expand into editorial scenes. The first expansion starts around 0.15 seconds and settles around 0.6 seconds.
- The foreground guitar grows roughly 1.5× from its compact presentation. Its neck extends beyond the panel; the performer photograph occupies a separate background plane.
- Foreground, background, and text travel at different rates. The foreground leads while background photography and copy settle behind it.
- The next scene changes around 1.95–2.4 seconds. The motion accelerates quickly, decelerates smoothly, and has very little visible overshoot.

The [sampled reference frames](../output/event-carousel/reference-motion.jpg) are retained for comparison. The shot is a rendered prototype; it does not expose exact easing curves or spring constants. This implementation translates the observed expansion and relative motion into the requested **vertical** scroll-snap layout. It uses a foreground spring of `stiffness: 115, damping: 25, mass: 1.05`, a faster panel spring of `180 / 30 / 0.8`, and a slower background spring of `85 / 28 / 1.1`. Title lines reveal through overflow masks with 65 ms staggering and a `135 / 27 / 0.9` spring.

## Structure and behavior

- `src/pages/EventsPage.tsx` is the `/events` entry point. It starts in `choice`, then lazily mounts either `EventCarousel` for `superficial` or `EventRollercoaster` for `immersive`.
- `EventRollercoaster.tsx` is the renamed `EventExplorer.tsx`. Its controls, event publishing, audio, dialogs, stations, and cleanup behavior are retained.
- `EventCarousel.tsx` uses `useScroll` for the scroll container and each panel, `useTransform` for image scale/translation and background interpolation, and `useSpring` for the different layers. Native scrolling supplies touch momentum and mandatory vertical snapping; no wheel interception is needed.
- `src/lib/event-artwork.ts` shares the ride's category hash. Each category gets a stable background, panel, accent, and fallback sculpture.
- `src/components/events/EventArtwork.tsx` supplies transparent SVG sculptures when event photos are absent. Photos remain separate from their backing panel and can extend beyond it. These are ordinary 2D assets and require no WebGL.

Only published events appear in Quick Browse. Past events are marked as archive entries; empty collections show an empty state. Full descriptions, photos, registration links, and album links are available in the event dialog. Previous/next buttons and keyboard navigation cover the same collection, and resizing preserves the active event. Switching experiences unmounts the previous scene and restores focus to its choice card.

Reduced motion removes parallax, scale changes, title animation, and animated background blending, while retaining native scroll snapping and all navigation. The global menu makes the underlying carousel inert. The existing site loader continues to run only on the initial page load.

## Checks

`tests/browser/events-page.spec.mjs` covers the choice screen, lazy ride loading, scroll snapping, changing transforms/backgrounds, overflow artwork, keyboard and dialog focus, responsive layouts, accessibility, photos, long titles, failed-image fallbacks, empty/single-event collections, and switching out of the ride. Existing ride browser tests now choose the immersive option before testing the scene, and verify that a newly published event is also available in Quick Browse. Server-rendering tests verify that `/events` returns the choice screen and an accurate published-event count.
