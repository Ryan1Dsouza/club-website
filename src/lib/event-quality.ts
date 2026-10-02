export type QualityLevel = 0 | 1 | 2;

/** Resolution is also bounded by total pixels: a 4K monitor is not a free GPU. */
export function qualityPixelRatio(level: QualityLevel, width: number, height: number, deviceRatio: number, touch: boolean) {
  const cap = (touch ? [.65, .9, 1.25] : [.75, 1, 1.5])[level];
  const pixels = (touch ? [450_000, 850_000, 1_300_000] : [700_000, 1_300_000, 2_200_000])[level];
  return Math.max(.35, Math.min(deviceRatio || 1, cap, Math.sqrt(pixels / Math.max(1, width * height))));
}

/** Hysteresis avoids oscillation; long suspended frames never count as GPU load. */
export function createQualityController(initial: QualityLevel, maximum: QualityLevel = 2) {
  let level = Math.min(initial, maximum) as QualityLevel, total = 0, frames = 0, stable = 0, cooldown = .75, slowFrames = 0;
  return {
    get level() { return level; },
    reset() { total = frames = stable = slowFrames = 0; cooldown = .75; },
    sample(seconds: number): QualityLevel | null {
      if (seconds <= 0 || seconds > 1) return null;
      // Two visibly stalled frames need relief now, including during the cooldown.
      // Visibility changes reset the sampler before resuming the render loop.
      slowFrames = seconds > .05 ? slowFrames + 1 : 0;
      if (slowFrames >= 2 && level > 0) {
        level = (level - 1) as QualityLevel;
        total = frames = stable = slowFrames = 0; cooldown = 3;
        return level;
      }
      cooldown = Math.max(0, cooldown - seconds);
      total += seconds; frames++;
      if (total < 1) return null;
      const average = total / frames;
      total = frames = 0;
      if (cooldown > 0) return null;
      if (average > .0195 && level > 0) { level = (level - 1) as QualityLevel; stable = 0; cooldown = 3; return level; }
      stable = average < .0175 ? stable + 1 : 0;
      if (stable >= 12 && level < maximum) { level = (level + 1) as QualityLevel; stable = 0; cooldown = 5; return level; }
      return null;
    },
  };
}

export function shouldShowJoystick(touch: boolean, coarse: boolean, width: number) {
  return touch && coarse && width <= 1366;
}
