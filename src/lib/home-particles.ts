import particlesScriptUrl from 'particles.js/particles.js?url';

type Particle = { x: number; y: number };
type ParticleInstance = {
  canvas: { el: HTMLCanvasElement; w: number; h: number };
  particles: {
    array: Particle[];
    number: { value: number };
    size: { value: number };
    move: { enable: boolean; speed: number };
    line_linked: { enable: boolean; distance: number; width: number };
  };
  fn: { particlesDraw: () => void; particlesCreate: () => void; particlesEmpty: () => void };
};
type ParticleWindow = Window & {
  particlesJS?: (id: string, options: object) => void;
  pJSDom?: { pJS: ParticleInstance }[];
};
type DeviceNavigator = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

let library: Promise<void> | undefined;

function loadLibrary() {
  const scope = window as ParticleWindow;
  if (scope.particlesJS) return Promise.resolve();
  // v2 is a classic browser script (it uses arguments.callee), not an ES module.
  // Bundle the installed MIT library locally, without a CDN or an eager request.
  return library ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = particlesScriptUrl;
    script.async = true;
    script.onload = () => { script.onload = script.onerror = null; resolve(); };
    script.onerror = () => { script.remove(); library = undefined; reject(new Error('Particles unavailable')); };
    document.head.append(script);
  });
}

export function prefersStaticParticles() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches || Boolean((navigator as DeviceNavigator).connection?.saveData);
}

export async function createHomeParticles(host: HTMLDivElement, signal: AbortSignal) {
  await loadLibrary();
  if (signal.aborted) return;
  const scope = window as ParticleWindow;
  scope.particlesJS!(host.id, {
    // Avoid a full-resolution allocation before our bounded resize runs.
    canvas: { w: 1, h: 1 },
    particles: {
      number: { value: 0, density: { enable: false } },
      color: { value: ['#c3e5c8', '#8fbd99', '#6b947b'] },
      shape: { type: 'circle' },
      opacity: { value: .52, random: true, anim: { enable: false } },
      size: { value: 2, random: true, anim: { enable: false } },
      line_linked: { enable: true, distance: 175, color: '#93bc9e', opacity: .19, width: .7 },
      // Start still: our capped scheduler owns the only animation loop.
      move: { enable: false, speed: .55, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false, attract: { enable: false } },
    },
    // v2's anonymous listeners cannot be removed; own resize and lifecycle here.
    interactivity: { events: { onhover: { enable: false, mode: [] }, onclick: { enable: false, mode: [] }, resize: false } },
    retina_detect: false,
  });
  const entry = scope.pJSDom!.find(item => item.pJS.canvas.el.parentElement === host)!;
  const engine = entry.pJS;
  const device = navigator as DeviceNavigator;
  const compact = matchMedia('(max-width: 760px), (pointer: coarse)');
  const lowPower = (device.hardwareConcurrency || 8) <= 4 || (device.deviceMemory || 8) <= 4;
  let frame = 0, resizeTimer = 0, previous = 0, lastDraw = 0;
  let running = false, inView = true, degraded = false, slowFrames = 0;
  let scale = 1;

  function draw(now: number) {
    frame = 0;
    if (!running || !inView || document.hidden || signal.aborted) return;
    const interval = 1000 / (lowPower || degraded ? 20 : compact.matches ? 24 : 30);
    if (!previous || now - previous >= interval - .5) {
      const delta = lastDraw ? Math.min(now - lastDraw, 80) : interval;
      engine.particles.move.speed = .55 * scale * delta / (1000 / 60);
      const started = performance.now();
      engine.fn.particlesDraw();
      // Back off if this decoration consistently costs too much on the device.
      slowFrames = performance.now() - started > 4 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      if (!degraded && slowFrames >= 8) {
        degraded = true;
        engine.particles.array.splice(24);
        engine.particles.line_linked.enable = false;
      }
      previous = now - ((now - previous) % interval);
      lastDraw = now;
    }
    frame = requestAnimationFrame(draw);
  }

  function sync() {
    cancelAnimationFrame(frame);
    frame = previous = lastDraw = 0;
    engine.particles.move.enable = running && inView && !document.hidden;
    if (engine.particles.move.enable && !signal.aborted) frame = requestAnimationFrame(draw);
  }

  function resize() {
    if (signal.aborted) return;
    const width = host.clientWidth, height = host.clientHeight;
    // A viewport canvas, capped at one million pixels even on retina / 4K screens.
    scale = Math.min(1, Math.sqrt((lowPower ? 600_000 : 1_000_000) / Math.max(1, width * height)));
    const w = Math.max(1, Math.floor(width * scale)), h = Math.max(1, Math.floor(height * scale));
    if (engine.canvas.w === w && engine.canvas.h === h && engine.particles.array.length) return;
    engine.canvas.el.width = engine.canvas.w = w;
    engine.canvas.el.height = engine.canvas.h = h;
    engine.particles.number.value = degraded || lowPower ? 24 : compact.matches ? 28 : Math.min(64, Math.max(38, Math.round(width * height / 22_000)));
    engine.particles.size.value = (compact.matches ? 1.8 : 2.2) * scale;
    engine.particles.line_linked.distance = (compact.matches ? 125 : 190) * scale;
    engine.particles.line_linked.width = .7 * scale;
    engine.particles.line_linked.enable = !lowPower && !degraded;
    engine.fn.particlesEmpty();
    engine.fn.particlesCreate();
    engine.fn.particlesDraw();
  }

  const observer = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 160);
  });
  const visibility = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
  const cleanup = () => {
    running = false;
    cancelAnimationFrame(frame);
    clearTimeout(resizeTimer);
    observer.disconnect();
    visibility.disconnect();
    document.removeEventListener('visibilitychange', sync);
    signal.removeEventListener('abort', cleanup);
    engine.fn.particlesEmpty();
    engine.canvas.el.remove();
    // v2's destroypJS nulls the whole global registry. Remove only our instance.
    const index = scope.pJSDom?.indexOf(entry) ?? -1;
    if (index >= 0) scope.pJSDom!.splice(index, 1);
  };

  signal.addEventListener('abort', cleanup, { once: true });
  document.addEventListener('visibilitychange', sync);
  observer.observe(host);
  visibility.observe(host);
  resize();
  return { setRunning(value: boolean) { running = value; sync(); } };
}
