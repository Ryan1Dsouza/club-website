export const GLIMPSE_EXIT = 8;
export const GLIMPSE_FADE_IN = 1.2;
export const GLIMPSE_ENLARGE = 2.6;
export const GLIMPSE_HOLD = .8;
export const GLIMPSE_FADE_OUT = 1.4;
export const GLIMPSE_LIFETIME = GLIMPSE_FADE_IN + GLIMPSE_ENLARGE + GLIMPSE_HOLD + GLIMPSE_FADE_OUT;
export const GLIMPSE_INTERVAL = GLIMPSE_LIFETIME + .4;
export const GLIMPSE_SLOTS = 4;
export const GLIMPSE_FADE = .9;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };

export const ARRIVAL_TIME_SCALE = .22;
export const STATION_PAN_SECONDS = .4;
export const stationPanAngle = (progress: number) => progress <= 0 ? 0 : -Math.PI / 2 * (1 - Math.pow(1 - clamp(progress), 3));

/** One proximity curve coordinates the station reveal and the final slow coast. */
export function stationArrivalFrame(remaining: number, radius: number, reduced = false) {
  const proximity = Number.isFinite(remaining) && radius > 0 ? smooth(1 - Math.max(0, remaining) / radius) : 0;
  return {
    proximity,
    timeScale: reduced ? 1 : 1 - (1 - ARRIVAL_TIME_SCALE) * proximity,
    opacity: reduced ? 0 : smooth((proximity - .08) / .72),
    focus: reduced ? 0 : smooth((proximity - .15) / .85),
  };
}

/** Present one photo at a time near alternating sides, with a quiet gap between shots. */
export function glimpseFrame(elapsed: number, slot: number, remaining: number) {
  const age = elapsed - slot * GLIMPSE_INTERVAL;
  const period = GLIMPSE_INTERVAL * GLIMPSE_SLOTS;
  const cycle = Math.max(0, Math.floor(age / period));
  const shotAge = age < 0 ? 0 : age % period;
  const fadeOutStart = GLIMPSE_LIFETIME - GLIMPSE_FADE_OUT;
  const fadeIn = smooth(shotAge / GLIMPSE_FADE_IN);
  const fadeOut = 1 - smooth((shotAge - fadeOutStart) / GLIMPSE_FADE_OUT);
  const proximityFade = smooth((remaining - GLIMPSE_EXIT) / 12);
  const opacity = age < 0 ? 0 : fadeIn * fadeOut * proximityFade;

  // Prepare the next photo only after this layer is fully transparent.
  const photoIndex = (cycle + (shotAge >= GLIMPSE_LIFETIME ? 1 : 0)) * GLIMPSE_SLOTS + slot;
  return {
    photoIndex,
    opacity,
    // Complete the push-in before the hold, then dissolve without moving.
    scale: .96 + .29 * smooth((shotAge - GLIMPSE_FADE_IN) / GLIMPSE_ENLARGE),
  };
}

/** Small, bounded camera impulses; phone framing has gentler lateral motion. */
export function cinematicCamera(speed: number, acceleration: number, slope: number, cruise: number, compact: boolean, reduced: boolean, boostFocus = 0) {
  const pace = Math.min(1.6, Math.abs(speed) / cruise);
  const focus = reduced ? 0 : clamp(boostFocus) * smooth(pace);
  return {
    // Give phones more breathing room, with bounded widening as speed increases.
    fov: (compact ? 105 : 68) + (reduced ? 0 : pace * (compact ? 4 : 6) + Math.max(0, -slope * Math.sign(speed)) * pace * (compact ? 2 : 3)) + focus * (compact ? 3 : 8),
    pullback: focus * (compact ? .4 : .7),
    lift: reduced ? 0 : Math.max(-.1, Math.min(.1, -acceleration * .006)),
    pitch: reduced ? 0 : Math.max(-.025, Math.min(.025, acceleration * -.0018)) * (compact ? .6 : 1),
    bankScale: (compact ? .55 : .85) * (1 - focus * .3),
  };
}
