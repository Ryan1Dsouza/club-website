// Avoid speculative graphics preloads on small screens and constrained networks.
// The requested logo formation has its own reduced-motion check and mobile budget.
export const LIGHTWEIGHT_GRAPHICS = '(max-width: 760px), (pointer: coarse), (prefers-reduced-motion: reduce)';
export function useLightweightGraphics() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return matchMedia(LIGHTWEIGHT_GRAPHICS).matches || Boolean(connection?.saveData);
}
