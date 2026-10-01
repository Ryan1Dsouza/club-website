# Nucleus loading screen

The complete component is in [`LoadingScreen.tsx`](../src/components/shared/LoadingScreen.tsx), with its responsive styles in [`loading-screen.css`](../src/components/shared/loading-screen.css). Framer Motion is already installed.

The design takes its oversized, wandering line and scattered sketches from [Freshman](https://freshman.tv/). The published reference uses 17 image frames in a 1.7-second loop. Nucleus uses original SVG paths: an atom, a laptop with code brackets, an event calendar, and a community of three people.

## Current mounting

`App.tsx` mounts the component once, outside the site shell. It appears after hydration on the initial public-page load, waits for the first `/api/site` request and local fonts, and fades out. The first sketch has a 1.6-second minimum display time; an 8-second deadline reveals the existing seed/server-rendered content if a request stalls. Reduced motion removes that minimum and shows static illustrations.

SPA route changes and background API refreshes do not replay it. The separate admin entry point is unaffected. The underlying site remains inert until the fade-out finishes; scrolling is restored when the overlay unmounts. Requests, timers, and scroll locks clean up under React Strict Mode and on unmount.

## Reuse

Import the component near the root of a page or async boundary, outside ancestors with `transform`, `filter`, or clipping. Keep `LoadingScreen` mounted and change `active` when the real work finishes so its internal `AnimatePresence` can complete the exit.

```tsx
import { useState } from 'react';
import LoadingScreen from './components/shared/LoadingScreen';

export function Example() {
  const [loading, setLoading] = useState(true);
  const [covered, setCovered] = useState(true);

  // Call setLoading(false) when your request/task settles, including failure.
  return <>
    <LoadingScreen
      active={loading}
      message="Connecting the dots…"
      onExitComplete={() => setCovered(false)}
    />
    <div inert={covered} aria-busy={covered}>
      {/* Your page content */}
    </div>
  </>;
}
```

When reopening an instance for another task, set both `covered` and `loading` to `true`. Mount a single full-screen instance at a time.

| Prop | Default | Purpose |
| --- | --- | --- |
| `active` | `true` | Shows the overlay; `false` begins the exit. |
| `message` | `Connecting the dots…` | Accessible live loading status. |
| `onExitComplete` | — | Runs after the overlay is removed. |

Colors inherit `var(--bg, #000000)` and `var(--mint, #c3e5c8)`. `LOOP_SECONDS` controls the 5.2-second draw/erase cycle. The wire and doodles use `pathLength` and `pathOffset`; their endpoints are invisible so the next loop does not flash. All art uses inline SVG paths, without image downloads, filters, or canvas render loops.
