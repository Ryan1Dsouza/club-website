type Device = { coarsePointer: boolean; cores?: number; memory?: number };

/** Hardware hints are optional (notably on Safari); small/touch screens still
 * get a conservative budget when the browser does not expose them. */
export function towerQuality(width: number, height: number, devicePixelRatio: number, device: Device) {
  const lowEnd = (device.cores !== undefined && device.cores > 0 && device.cores <= 4)
    || (device.memory !== undefined && device.memory > 0 && device.memory <= 4);
  const mobile = device.coarsePointer || width <= 768;
  const simplified = mobile || lowEnd;
  const maxPixels = lowEnd ? 650_000 : mobile ? 950_000 : 1_650_000;
  const maxRatio = lowEnd ? 1 : mobile ? 1.25 : 1.5;
  return {
    simplified,
    pixelRatio: Math.min(devicePixelRatio || 1, maxRatio, Math.sqrt(maxPixels / Math.max(1, width * height))),
    maxTextureSize: lowEnd ? 1024 : simplified ? 2048 : 4096,
  };
}
