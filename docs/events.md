# Events

`/events` opens a responsive photo archive: three columns on desktop, two on tablets and one on phones. Cards show the workshop, title, photo count and date, with a staggered entrance, a raised hover state and a gallery link. The green ride bars sit between desktop columns; a horizontal bar appears above the cards on phones. A green sweep and stepped text reveal repeat every seven seconds. Reduced motion keeps the labels visible without animation.

Both ride bars open the same invitation. Accepting starts a green flash and tunnel transition while the lazy-loaded ride renders underneath. The transition waits for the first rendered scene (or the accessible fallback) before fading away. Returning restores focus to the originating bar. Query parameters cannot bypass the invitation.

`src/events/stations.ts` maps stations 1–7 to inauguration, dev, khoj, linkedin, n8n, noesis and unlocked. `workshop-content.ts` discovers assets under `workshops/`; `photo-order.ts` orders both numbered filenames and names such as `photo(1)`. Dates and recaps that have not been supplied retain their placeholders.

The shared `Book` serves both the archive and the ride. Desktop opens with the story on the left and photograph 1 on the right, followed by pairs of photographs. On phones, the first report page places a compact, scrollable story above photograph 1; each subsequent page contains one photograph. Images use `object-fit: contain` in large panels to preserve the full frame and original proportions. A final unpaired desktop image faces blank paper.

The local Lenis instance drives the page angle and settling motion. Wheel gestures and captured touch pointers pull one leaf at a time; release completes the turn or returns it to its resting page. Pointer capture keeps the gesture alive when the visible image changes. Connected strips bend horizontally on desktop and vertically on phones, with the same geometry running backward for reverse gestures. Page content is memoized so each animation frame only updates the turn styles. The next images preload before they appear. Resizing preserves the current photograph. Arrow keys, buttons, Escape, focus restoration and background scroll locking remain available. One extra turn closes the book.

Arrival time scaling bottoms out at 72% rather than 22%, while the braking solver still docks exactly. The arrival caption remains centered instead of drifting out of the camera view. Once parked, the camera pans right over 360ms of real elapsed time and opens the book immediately; the caption fades during the pan. Depth of field stays disabled through docking and the open book.

Validation: `npm run build`, `npm test`, and Playwright coverage in `events-page.spec.mjs`, `book-gestures.spec.mjs`, `ride-book.spec.mjs`, and `station-arrival.spec.mjs`. The gesture tests inspect both swipe directions, full-width mobile images and equal-sized page strips.
