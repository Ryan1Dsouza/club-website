type Device = { coarsePointer: boolean; cores?: number; memory?: number };

/** Hardware hints are optional (notably on Safari); small/touch screens still
 * get a conservative budget when the browser does not expose them. */
export function towerQuality(width: number, height: number, devicePixelRatio: number, device: Device) {
  const lowEnd = (device.cores !== undefined && device.cores > 0 && device.cores <= 4)
    || (device.memory !== undefined && device.memory > 0 && device.memory <= 4);
  const mobile = device.coarsePointer || width <= 768;
  const simplified = mobile || lowEnd;
  // Spend the budget on legible edges first. Lighting and idle motion are cheaper
  // to simplify than stretching a sub-resolution canvas across the screen.
  const maxPixels = lowEnd ? (mobile ? 900_000 : 2_100_000) : mobile ? 1_400_000 : 3_600_000;
  const maxRatio = lowEnd && mobile ? 1 : lowEnd ? 1.25 : mobile ? 1.75 : 2;
  return {
    simplified, lowEnd,
    // On a struggling phone only the 3D buffer may downshift below native
    // resolution. The shared DOM profile and its text stay at full resolution.
    minPixelRatio: mobile ? .75 : 1,
    pixelRatio: Math.min(devicePixelRatio || 1, maxRatio, Math.sqrt(maxPixels / Math.max(1, width * height))),
    maxTextureSize: lowEnd ? 2048 : 4096,
  };
}

/** Desktop keeps native detail; phones can trade a little 3D detail for latency. */
export function towerPixelRatio(baseRatio: number, resolutionScale: number, minimum = 1) {
  return Math.max(Math.min(minimum, baseRatio), baseRatio * resolutionScale);
}
