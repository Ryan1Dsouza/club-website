export type QualityLevel = 0 | 1 | 2;

/** Safari omits memory hints; touch input still earns a conservative effects budget. */
export function rideQuality(device: { coarse: boolean; cores?: number; memory?: number }): { initial: QualityLevel; maximum: QualityLevel } {
  const constrained = device.coarse || (device.cores !== undefined && device.cores > 0 && device.cores <= 4)
    || (device.memory !== undefined && device.memory > 0 && device.memory <= 4);
  return { initial: constrained ? 0 : 1, maximum: constrained ? 1 : 2 };
}

/** Touch screens need extra samples for crisp edges, even with simpler effects.
 * Total pixels remain bounded to limit GPU cost on tablets and large displays. */
export function qualityPixelRatio(level: QualityLevel, width: number, height: number, deviceRatio: number, touch: boolean) {
  const cap = (touch ? [1.25, 1.75, 2] : [.75, 1, 1.5])[level];
  const pixels = (touch ? [1_400_000, 1_800_000, 2_200_000] : [700_000, 1_300_000, 2_200_000])[level];
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

