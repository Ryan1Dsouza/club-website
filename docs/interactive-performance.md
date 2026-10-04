# Interactive performance optimization

## Bottlenecks and changes

The desktop loader changed a CSS mask from a JavaScript animation-frame callback and decoded 17 separate images. It now plays one silent native video at the same 20fps artwork cadence, with a branded static fallback. Its curtain only translates; full-screen clipping is gone. The portrait composition retains aspect ratio, safe areas, and dynamic viewport sizing. A high-priority responsive preload keeps artwork ahead of background page assets on cold connections. See [loading-screen.md](loading-screen.md) for the native-video transfer-size tradeoff and reproduction instructions.

The ripple already used a single canvas, bounded waves, and no per-cell DOM. Its remaining churn came from building and sorting a new array of cell objects on every click, filtering waves every frame, and retaining the same pixel budget on weak hardware. It now pools the wave objects and shares a typed-array radial stencil, keeps the existing desktop visual behavior, and caps constrained devices at one wave, a five-cell radius, 24 paints/sec, and 350,000 backing pixels. Modern touch devices retain 30fps and desktop 60fps. The loop stops when waves finish, the tab hides, or reduced motion is requested.

The Jenga tower already had instanced rendering and box colliders. Its previous mobile simplification retained rounded geometry, physically based lighting, a detailed foundation collider, and 10 solver iterations. Runtime scaling changed visual effects/resolution but never reduced physics work. The new extreme tier uses plain 12-triangle block geometry, Lambert materials, a simpler board and eight-segment foundation collider, six solver iterations at 60Hz, at most two substeps per rendered update, and a 30fps render cap. Its initial 3D buffer is at most 450,000 pixels at DPR 1; sustained overload may reduce that further to half the initial DPR. The DOM member profile stays at full resolution.

Two-core or <=2GB devices start in that extreme tier. Phones with missing hints use the existing balanced tier. Capable desktops retain rounded geometry, full lighting, shadows, antialiasing, and the original resolution budget. Sustained frame drops reduce geometry, materials, shadow work, physics and then resolution without restarting the tower or losing a held block. Repeated very slow frames also trigger relief. Idle/offscreen/hidden periods reset sampling, intentional 30fps pacing does not trigger further degradation, and quality does not oscillate during the scene.

Two pre-existing physics regressions were repaired while exercising these paths: removing supporting blocks wakes the layers above, and collision-resolved story poses are copied back to the rendered block position.

## Reproduction

- Build: `npm run build`
- Unit/integration: `npm test`
- Browser: `npm run test:browser -- tests/browser/background-ripple.spec.mjs tests/browser/loading-screen.spec.mjs tests/browser/mobile-loader-startup.spec.mjs tests/browser/interaction-adaptive.spec.mjs tests/browser/people-tower-performance.spec.mjs tests/browser/people-tower-startup.spec.mjs tests/browser/people-tower-touch.spec.mjs`
- Measurement: `node scripts/profile-interactions.mjs output/interaction-performance/latest.json`

The measurement script uses local Vite assets and headless Chromium at 6× CPU slowdown, with desktop and two-core/2GB phone hints. It records CPU work, animation frame intervals, canvas pixels, draw calls and triangles. Host contention and software GPU scheduling make FPS measurements approximate; physical old-phone testing is still needed to establish a device-specific FPS floor. Before/after reports are in `output/interaction-performance/`.
