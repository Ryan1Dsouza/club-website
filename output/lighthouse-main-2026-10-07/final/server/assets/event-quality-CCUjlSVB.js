function rideQuality(device) {
  const constrained = device.coarse || device.cores !== void 0 && device.cores > 0 && device.cores <= 4 || device.memory !== void 0 && device.memory > 0 && device.memory <= 4;
  return { initial: constrained ? 0 : 1, maximum: constrained ? 1 : 2 };
}
function qualityPixelRatio(level, width, height, deviceRatio, touch) {
  const cap = (touch ? [1.25, 1.75, 2] : [0.75, 1, 1.5])[level];
  const pixels = (touch ? [14e5, 18e5, 22e5] : [7e5, 13e5, 22e5])[level];
  return Math.max(0.35, Math.min(deviceRatio || 1, cap, Math.sqrt(pixels / Math.max(1, width * height))));
}
function createQualityController(initial, maximum = 2) {
  let level = Math.min(initial, maximum), total = 0, frames = 0, stable = 0, cooldown = 0.75, slowFrames = 0;
  return {
    get level() {
      return level;
    },
    reset() {
      total = frames = stable = slowFrames = 0;
      cooldown = 0.75;
    },
    sample(seconds) {
      if (seconds <= 0 || seconds > 1) return null;
      slowFrames = seconds > 0.05 ? slowFrames + 1 : 0;
      if (slowFrames >= 2 && level > 0) {
        level = level - 1;
        total = frames = stable = slowFrames = 0;
        cooldown = 3;
        return level;
      }
      cooldown = Math.max(0, cooldown - seconds);
      total += seconds;
      frames++;
      if (total < 1) return null;
      const average = total / frames;
      total = frames = 0;
      if (cooldown > 0) return null;
      if (average > 0.0195 && level > 0) {
        level = level - 1;
        stable = 0;
        cooldown = 3;
        return level;
      }
      stable = average < 0.0175 ? stable + 1 : 0;
      if (stable >= 12 && level < maximum) {
        level = level + 1;
        stable = 0;
        cooldown = 5;
        return level;
      }
      return null;
    }
  };
}
function shouldShowJoystick(touch, coarse, width) {
  return touch && coarse && width <= 1366;
}
export {
  createQualityController as c,
  qualityPixelRatio as q,
  rideQuality as r,
  shouldShowJoystick as s
};
