type Device = { coarsePointer: boolean; cores?: number; memory?: number };
export type TowerDetail = 0 | 1 | 2;

/** Hardware hints are optional (notably on Safari); small/touch screens still
 * get a conservative budget when the browser does not expose them. */
export function towerQuality(width: number, height: number, devicePixelRatio: number, device: Device) {
  const lowEnd = (device.cores !== undefined && device.cores > 0 && device.cores <= 4)
    || (device.memory !== undefined && device.memory > 0 && device.memory <= 4);
  const mobile = device.coarsePointer || width <= 768;
  const extreme = (device.cores !== undefined && device.cores > 0 && device.cores <= 2)
    || (device.memory !== undefined && device.memory > 0 && device.memory <= 2);
  const simplified = mobile || lowEnd;
  // Spend the budget on legible edges first. Lighting and idle motion are cheaper
  // to simplify than stretching a sub-resolution canvas across the screen.
  const maxPixels = lowEnd ? (mobile ? 900_000 : 2_100_000) : mobile ? 1_400_000 : 3_600_000;
  const maxRatio = lowEnd && mobile ? 1 : lowEnd ? 1.25 : mobile ? 1.75 : 2;
  return {
    simplified, lowEnd, detail: (extreme ? 0 : simplified ? 1 : 2) as TowerDetail,
    // On a struggling phone only the 3D buffer may downshift below native
    // resolution. The shared DOM profile and its text stay at full resolution.
    minPixelRatio: extreme ? .5 : mobile ? .75 : 1,
    pixelRatio: Math.min(devicePixelRatio || 1, maxRatio, Math.sqrt(maxPixels / Math.max(1, width * height))),
    maxTextureSize: extreme ? 1024 : lowEnd ? 2048 : 4096,
  };
}

/** Degrade only after sustained load. Idle time, isolated stalls, and time spent
 * in background tabs must not penalize a capable device. No quality oscillation. */
export function createTowerQualityController(initial: TowerDetail) {
  let detail = initial, scale = 1, duration = 0, frames = 0, slowWindows = 0, severeFrames = 0;
  function reduce() {
    duration = frames = slowWindows = severeFrames = 0;
    if (detail > 0) detail = (detail - 1) as TowerDetail;
    else if (scale > .5) scale = Math.max(.5, scale - .25);
    else return false;
    return true;
  }
  return {
    get detail() { return detail; },
    get scale() { return scale; },
    reset() { duration = frames = slowWindows = severeFrames = 0; },
    sample(seconds: number) {
      if (seconds <= 0 || seconds > 2) { this.reset(); return false; }
      // A genuinely overloaded renderer can take over 500ms repeatedly. Do not
      // discard those samples forever as if every one were a background pause.
      severeFrames = seconds > .09 ? severeFrames + 1 : 0;
      if (severeFrames >= 3) return reduce();
      duration += seconds; frames++;
      if (duration < .75) return false;
      const slow = duration / frames > (detail === 0 ? 1 / 24 : 1 / 45);
      duration = frames = 0;
      slowWindows = slow ? slowWindows + 1 : 0;
      if (slowWindows < 2) return false;
      return reduce();
    },
  };
}

/** Desktop keeps native detail; phones can trade a little 3D detail for latency. */
export function towerPixelRatio(baseRatio: number, resolutionScale: number, minimum = 1) {
  return Math.max(Math.min(minimum, baseRatio), baseRatio * resolutionScale);
}
