import Lenis from '@studio-freight/lenis';

/** Shared Lenis configuration for page scrolling and the ride's local book surface. */
export function createCinematicLenis(options: ConstructorParameters<typeof Lenis>[0] = {}) {
  return new Lenis({
    smoothWheel: true, syncTouch: false, wheelMultiplier: 1,
    duration: .6, easing: (t: number) => 1 - Math.pow(1 - t, 4),
    ...options,
  });
}
