import { test, expect } from '@playwright/test';

test('depth blur preserves near edges, bloom lifts highlights, and quality changes release buffers', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.route('**/render-probe.html', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Ride rendering check</title>' }));
  await page.goto('/render-probe.html');
  const result = await page.evaluate(async () => {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const { createRidePostprocessing } = await import('/src/lib/event-postprocessing.ts');
    const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
    renderer.setSize(256, 128); renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const pipeline = createRidePostprocessing(renderer);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 2, .1, 400);
    const geometry = new THREE.PlaneGeometry(1, 1);
    const grey = new THREE.MeshBasicMaterial({ color: new THREE.Color(.3, .3, .3) });
    const bright = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 3, 3) });
    const near = new THREE.Mesh(geometry, grey); near.position.set(-2, 0, -8); near.scale.set(1, 4, 1);
    const far = new THREE.Mesh(geometry, grey); far.position.set(40, 0, -160); far.scale.set(20, 80, 1);
    const star = new THREE.Mesh(geometry, bright); star.position.set(0, 0, -8); star.scale.set(.05, 2, 1);
    scene.add(near, far, star);
    const sample = () => {
      const gl = renderer.getContext(), pixels = new Uint8Array(256 * 128 * 4);
      gl.readPixels(0, 0, 256, 128, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      return { near: pixels[(64 * 256 + 109) * 4], far: pixels[(64 * 256 + 164) * 4], glow: pixels[(64 * 256 + 130) * 4] };
    };
    try {
      renderer.render(scene, camera);
      const before = sample();
      pipeline.resize(256, 128, 2, false);
      if (!pipeline.enabled) return { supported: false };
      pipeline.render(scene, camera, 0, false, 0);
      const after = sample(), image = renderer.domElement.toDataURL('image/png');
      const depthOfField = pipeline.depthOfField;
      pipeline.resize(256, 128, 1, false); pipeline.render(scene, camera, 0, false, 0);
      const lowTier = { enabled: pipeline.enabled, depthOfField: pipeline.depthOfField };
      pipeline.resize(256, 128, 0, false);
      const disabled = { enabled: pipeline.enabled, textures: renderer.info.memory.textures };
      pipeline.resize(256, 128, 2, true);
      return { supported: true, before, after, image, depthOfField, lowTier, disabled, reducedEnabled: pipeline.enabled };
    } finally {
      pipeline.dispose(); geometry.dispose(); grey.dispose(); bright.dispose(); renderer.dispose(); renderer.forceContextLoss();
    }
  });
  test.skip(!result.supported, 'Floating-point render targets are unavailable; the ride uses its direct-render fallback.');
  await info.attach('depth-and-bloom.png', { body: Buffer.from(result.image.split(',')[1], 'base64'), contentType: 'image/png' });
  expect(result.after.near).toBeLessThanOrEqual(result.before.near + 2);
  expect(result.after.far).toBeGreaterThan(result.before.far + 3);
  expect(result.after.glow).toBeGreaterThan(result.before.glow + 3);
  expect(result.depthOfField).toBe(true);
  expect(result.lowTier).toEqual({ enabled: true, depthOfField: false });
  expect(result.disabled).toEqual({ enabled: false, textures: 0 });
  expect(result.reducedEnabled).toBe(false);
  expect(errors).toEqual([]);
});
