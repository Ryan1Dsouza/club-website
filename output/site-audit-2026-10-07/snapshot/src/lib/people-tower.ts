import * as THREE from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import type { Member } from '../types';
import { BLOCK_SIZE, LAYER_HEIGHT, advanceTowerScroll, clamp01, smooth, towerExit, towerFrame, towerSlots } from './people-tower-motion.ts';
import { createTowerQualityController, towerPixelRatio, towerQuality, type TowerDetail } from './people-tower-quality';
import { createTowerScenery } from './people-tower-scenery';
import { createTowerBlocks, TOWER_PALETTES } from './people-tower-blocks';
import { createTowerPhysics } from './people-tower-physics';
import type { TowerPortraits } from './people-tower-portraits';

type Callbacks = { onMember: (index: number) => void; onError: () => void };

function makeProfile() {
  const element = document.createElement('div');
  element.className = 'tower-profile';
  // Member values are always assigned with textContent.
  element.innerHTML = '<div class="tower-profile__meta"><span>NUCLEUS / SJEC</span><span data-profile-index></span></div><div class="tower-profile__monogram"></div><div class="tower-profile__photo-fade"></div><span class="tower-profile__cross">+</span><div class="tower-profile__copy"><p class="tower-profile__role"></p><div class="tower-profile__name"><span></span><span></span></div></div><div class="tower-profile__footer"><span>The people / Nucleus</span><span>Keep scrolling ↗</span></div>';
  return element;
}

/** A sleeping rigid-body tower, two instanced draws, and one crisp DOM profile. */
export async function createPeopleTower(host: HTMLElement, section: HTMLElement, members: Member[], callbacks: Callbacks, portraits: TowerPortraits) {
  const cleanups: (() => void)[] = [];
  let disposed = false, compiled = false;
  function dispose() {
    if (disposed) return;
    disposed = true;
    while (cleanups.length) cleanups.pop()!();
  }
  // Register resources as they are created, including partial initialization.
  try {
    const coarsePointer = matchMedia('(pointer: coarse)');
    const pinnedViewport = matchMedia('(max-width: 760px), (pointer: coarse)');
    const device = {
      coarsePointer: coarsePointer.matches, cores: navigator.hardwareConcurrency,
      memory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory
    };
    let quality = towerQuality(host.clientWidth, host.clientHeight, window.devicePixelRatio, device);
    const adaptive = createTowerQualityController(quality.detail);
    let detail = quality.detail;
    const renderer = new THREE.WebGLRenderer({
      alpha: false, antialias: !quality.lowEnd,
      powerPreference: quality.simplified ? 'low-power' : 'high-performance'
    });
    cleanups.push(() => { renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .95;
    renderer.shadowMap.enabled = !quality.simplified; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    const css = new CSS3DRenderer(); css.domElement.className = 'people-tower__labels';
    cleanups.push(() => css.domElement.remove());
    const scene = new THREE.Scene(), labels = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, .1, 150);
    const slots = towerSlots(members.map(member => member.id)), layers = Math.ceil(members.length / 3);
    const physics = createTowerPhysics(slots, detail);
    cleanups.push(physics.dispose);
    const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const batch = createTowerBlocks(scene, members, Math.min(quality.maxTextureSize, renderer.capabilities.maxTextureSize), detail, anisotropy);
    cleanups.push(batch.dispose);
    const scenery = createTowerScenery(scene, physics.floorY, layers * LAYER_HEIGHT, detail);
    cleanups.push(scenery.dispose);
    // Only one member can be visible. Reuse one composited surface instead of
    // retaining a viewport-sized CSS3D panel for every block in the tower.
    const profile = makeProfile(), profileObject = new CSS3DObject(profile);
    // CSS3DObject sets pointer-events:auto inline. This decorative surface must
    // let gestures through to the canvas, including while it is transparent.
    profile.style.pointerEvents = 'none';
    profile.style.opacity = '0'; labels.add(profileObject);
    cleanups.push(() => profileObject.removeFromParent());
    function updateProfile(index: number) {
      const member = members[index];
      const parts = member.name.split(' ');
      const palette = TOWER_PALETTES[index % TOWER_PALETTES.length];
      profile.style.setProperty('--tower-paper', palette.paper); profile.style.setProperty('--tower-ink', palette.ink);
      const profileName = profile.querySelector('.tower-profile__name')!;
      profileName.children[0].textContent = parts[0];
      profileName.children[1].textContent = parts.slice(1).join(' ');
      profile.querySelector('.tower-profile__role')!.textContent = member.role;
      profile.querySelector('.tower-profile__monogram')!.textContent = member.initials;
      profile.querySelector('[data-profile-index]')!.textContent = `${String(index + 1).padStart(2, '0')} / ${String(members.length).padStart(2, '0')}`;
      sizeProfileName(index);
      portraits.show(index, profile);
    }
    function sizeProfileName(index: number) {
      const parts = members[index].name.split(' ');
      const longest = Math.max(parts[0].length, parts.slice(1).join(' ').length);
      const portraitLayout = width <= 760 && height > 500;
      const fontSize = Math.min(profileHeight * (portraitLayout && height < 700 ? .14 : .19), profileWidth * (portraitLayout ? .86 : .45) / (Math.max(5, longest) * .49));
      profile.style.setProperty('--profile-name', `${fontSize}px`);
    }

    const stage = host.parentElement!;
    let width = 1, height = 1, profileWidth = 1, profileHeight = 1, profileTop = 0;
    let bufferWidth = 0, bufferHeight = 0, viewportResizeTimer = 0;
    let start = 0, range = 1, target = 0, progress = 0, frame = 0, previousTime = 0;
    let active = -2, storyRemoved = 0, visible = true, idleAngle = 0, lastInteraction = -Infinity;
    let matricesDirty = true, renderedProgress = -1, lastRenderTime = 0;
    let layoutDirty = true, scrollDirty = true, initialized = false;
    let previousUpdate = 0;
    const scrollMotion = { value: 0, velocity: 0 };
    const right = new THREE.Vector3(), up = new THREE.Vector3(), forward = new THREE.Vector3();
    const source = new THREE.Vector3(), pulled = new THREE.Vector3(), activeSource = new THREE.Vector3();
    const control1 = new THREE.Vector3(), control2 = new THREE.Vector3(), destination = new THREE.Vector3();
    const direction = new THREE.Vector3(), faceOffset = new THREE.Vector3(), targetScale = new THREE.Vector3();
    const activeQuaternion = new THREE.Quaternion(), tumbleQuaternion = new THREE.Quaternion(), exitQuaternion = new THREE.Quaternion();
    const euler = new THREE.Euler(), curve = new THREE.CubicBezierCurve3();
    const plankScale = new THREE.Vector3(...BLOCK_SIZE);
    const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(), dragPlane = new THREE.Plane(), dragPoint = new THREE.Vector3();
    const lastDragPoint = new THREE.Vector3(), throwVelocity = new THREE.Vector3(), pointerVelocity = new THREE.Vector3();
    let lastDragTime = 0;
    let pointerId = -1, draggedIndex = -1, downX = 0, downY = 0, travelled = 0;
    let gestureId = -1, gestureX = 0, gestureY = 0, lastGestureY = 0;
    let gestureAxis: 'x' | 'y' | null = null;
    cleanups.push(() => {
      window.clearTimeout(viewportResizeTimer);
      cancelAnimationFrame(frame); releasePointer();
      section.style.removeProperty('--tower-intro'); section.style.removeProperty('--tower-progress'); section.style.removeProperty('--tower-outro');
      delete host.dataset.activeMember; delete host.dataset.dragging;
      delete host.dataset.quality;
    });

    function releasePointer(velocity?: THREE.Vector3) {
      const id = pointerId; pointerId = -1; draggedIndex = -1; physics.release(velocity);
      if (id >= 0 && renderer.domElement.hasPointerCapture(id)) renderer.domElement.releasePointerCapture(id);
      delete host.dataset.dragging;
    }

    function syncStory(state: ReturnType<typeof towerFrame>) {
      const desiredRemoved = state.completed;
      if (active === state.index && storyRemoved === desiredRemoved) return;
      releasePointer();
      // When scrolling all the way back to the start, do a full reset so the
      // tower looks exactly as it did originally (all blocks in perfect position).
      // For partial reverse, return only the needed pieces individually.
      if (state.completed < storyRemoved || (state.index < 0 && state.completed === 0 && active >= 0)) {
        if (state.index < 0 && state.completed === 0) {
          // Full rewind — restore every block to its pristine grid position
          physics.reset(0);
        } else {
          // Partial rewind — return pieces that need to come back.
          // Each block's stagger delay is based on slot.layer so the tower
          // always builds bottom-up (foundation first) regardless of scroll speed.
          for (let i = storyRemoved - 1; i >= state.completed; i--) {
            physics.returnBody(i);
          }
        }
        storyRemoved = state.completed;
      }
      for (let i = storyRemoved; i < state.completed; i++) physics.remove(i);
      storyRemoved = state.completed;
      active = state.index;
      if (active >= 0) {
        updateProfile(active);
        physics.beginStory(active);
        const body = physics.bodies[active];
        activeSource.copy(body.position); activeQuaternion.copy(body.quaternion);
      }
      callbacks.onMember(active); matricesDirty = true;
    }

    function render(state: ReturnType<typeof towerFrame>, transformsChanged: boolean, cameraMoved: boolean) {
      const changedProgress = renderedProgress !== progress;
      if (changedProgress) {
        section.style.setProperty('--tower-intro', String(1 - state.intro));
        section.style.setProperty('--tower-progress', String(progress)); section.style.setProperty('--tower-outro', String(state.outro));
        host.dataset.activeMember = String(state.index);
      }
      // During the readable hold, scrolling changes the timeline but no pixels.
      // Keep the native scroll responsive without redrawing the same WebGL and
      // CSS3D surfaces until the block starts its exit (or physics/camera move).
      const previous = towerFrame(renderedProgress, members.length);
      if (!transformsChanged && !matricesDirty && !cameraMoved && state.index >= 0
        && previous.index === state.index && previous.local >= .43 && previous.local <= .76
        && state.local >= .43 && state.local <= .76) {
        renderedProgress = progress;
        return;
      }
      const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const radius = Math.max(10, 2.6 / (halfFov * camera.aspect), (layers * LAYER_HEIGHT / 2 + 1.1) / halfFov);
      // This orbit is driven only by elapsed idle time, independently of scrolling.
      const angle = .68 + idleAngle;
      camera.position.set(Math.sin(angle) * radius, radius * .32, Math.cos(angle) * radius);
      camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
      right.set(1, 0, 0).applyQuaternion(camera.quaternion); up.set(0, 1, 0).applyQuaternion(camera.quaternion);
      camera.getWorldDirection(forward);
      const distance = 4.8;
      const viewHeight = 2 * halfFov * distance;
      targetScale.set(viewHeight * camera.aspect * profileWidth / width, viewHeight * profileHeight / height, .16);
      destination.copy(camera.position).addScaledVector(forward, distance + .08)
        .addScaledVector(up, (height / 2 - profileTop - profileHeight / 2) / height * viewHeight);
      const exitState = towerExit(state.local);
      const labelsChanged = matricesDirty || changedProgress || cameraMoved;
      profile.style.opacity = state.index >= 0 ? String(exitState.opacity) : '0';
      if (transformsChanged || matricesDirty || changedProgress || (cameraMoved && state.index >= 0)) {
        const block = batch.pose;
        physics.bodies.forEach((body, index) => {
          // Sleeping pieces keep their instance matrices and hidden profiles.
          // Scrolling normally changes only the currently extracted piece.
          if (!transformsChanged && !matricesDirty && index !== state.index) return;
          const slot = slots[index];
          if ((index < state.completed || state.outro > 0 || physics.isPending(index)) && index !== state.index) {
            batch.update(index, false);
            return;
          }

          block.position.copy(body.interpolatedPosition); block.quaternion.copy(body.interpolatedQuaternion); block.scale.copy(plankScale);

          if (index === state.index) {
            source.copy(activeSource); block.position.copy(source); block.quaternion.copy(activeQuaternion);
            const t = state.local, pull = smooth(t / .10), flight = smooth((t - .10) / .24), unfold = smooth((t - .2) / .23);
            direction.set(slot.direction, 0, 0).applyQuaternion(activeQuaternion);
            // Clear the whole plank before tumbling toward the profile.
            pulled.copy(source).addScaledVector(direction, BLOCK_SIZE[0] + .35); block.position.lerp(pulled, pull);
            if (t > .10) {
              control1.copy(pulled).addScaledVector(direction, 2);
              // Flatten high-layer flight arcs toward the final profile height.
              control1.y = THREE.MathUtils.lerp(control1.y, destination.y, 0.85);
              control2.copy(destination).addScaledVector(right, slot.direction * targetScale.x * .45).addScaledVector(up, -0.4);
              curve.v0.copy(pulled); curve.v1.copy(control1); curve.v2.copy(control2); curve.v3.copy(destination);
              curve.getPoint(flight, block.position);

              tumbleQuaternion.setFromEuler(euler.set(.85 * slot.spin, slot.yaw + .6 * slot.direction, 1.3 * slot.direction));
              // Delay the tumble slightly so the block's tail clears the tower before rotating
              block.quaternion.slerp(tumbleQuaternion, smooth(Math.max(0, t - .14) / .1));
              block.quaternion.slerp(camera.quaternion, smooth((t - .23) / .2));
            }
            block.scale.lerp(targetScale, unfold);

            // A fallen plank can rest below the plinth. Lift its clearance as it
            // unfolds, without popping it upward on the first scroll frame.
            const floorClearance = THREE.MathUtils.lerp(Math.min(source.y, physics.floorY + .3), physics.floorY + .3, unfold);
            block.position.y = Math.max(block.position.y, floorClearance);

            const exit = exitState.progress;
            if (exit > 0) {
              block.position.addScaledVector(right, slot.direction * targetScale.x * 1.55 * exit)
                .addScaledVector(up, ((index % 3) - 1) * targetScale.y * .7 * exit).addScaledVector(forward, 2.7 * exit);
              exitQuaternion.setFromEuler(euler.set(-.18 * exit, .4 * slot.direction * exit, -.45 * slot.direction * exit));
              block.quaternion.multiply(exitQuaternion);
            }
            block.scale.multiplyScalar(exitState.scale);
            physics.placeStory(block.position, block.quaternion, block.scale, t > 0.10 && t < 0.35);

            // Keep this transform updated even while transparent to avoid a
            // stale position flashing when a different member takes over.
            faceOffset.set(0, 0, block.scale.z / 2 + .008).applyQuaternion(block.quaternion);
            profileObject.position.copy(block.position).add(faceOffset);
            profileObject.quaternion.copy(block.quaternion);
            profileObject.scale.set(block.scale.x / profileWidth, block.scale.y / profileHeight, 1);
          }
          batch.update(index);
        });
        batch.commit(); renderer.shadowMap.needsUpdate = renderer.shadowMap.enabled; matricesDirty = false;
      }
      renderer.render(scene, camera);
      if (labelsChanged) css.render(labels, camera);
      renderedProgress = progress;
    }

    function draw(time: number) {
      frame = 0;
      if (disposed || !visible || document.hidden) return;
      const elapsed = (time - previousTime) / 1000; previousTime = time;
      // Sample RAF delivery before the intentional 30fps cap. Capped/skipped
      // paints must not be mistaken for a struggling device.
      if (adaptive.sample(elapsed)) layoutDirty = true;
      if (detail === 0 && !layoutDirty && time - previousUpdate < 1000 / 30 - 1) {
        frame = requestAnimationFrame(draw); return;
      }
      const updateElapsed = (time - previousUpdate) / 1000; previousUpdate = time;
      const dt = Math.max(0, Math.min(.05, updateElapsed));
      try {
        if (layoutDirty) measure();
        sampleScroll();
        if (!initialized) { scrollMotion.value = target; initialized = true; }

        // Keep the block and profile on the scroll timeline. Advancing to a
        // speculative landing here gets undone by sampleScroll on the next
        // frame, briefly flashing the open profile during extraction.
        // Smooth native wheel/touch samples with a short, frame-independent response.
        progress = advanceTowerScroll(scrollMotion, target, updateElapsed, 32);
        const state = towerFrame(progress, members.length);
        // The desktop intro orbits; readable profiles and settled mobile scenes rest.
        const idleOrbit = detail === 2 && state.index < 0 && state.completed === 0 && state.outro === 0;
        const orbiting = idleOrbit && pointerId < 0 && time - lastInteraction > 1000;
        if (orbiting) idleAngle = (idleAngle + dt * .16) % (Math.PI * 2);
        syncStory(state);
        const transformsChanged = physics.step(dt);
        // The decorative idle orbit needs only 30 paints/sec; scrolling and direct
        // interaction still render on every changed frame, including 120 Hz screens.
        if (transformsChanged || matricesDirty || progress !== renderedProgress || (orbiting && time - lastRenderTime >= 1000 / 30)) {
          render(state, transformsChanged, orbiting); lastRenderTime = time;
        }
        // Keep the loop alive for 200ms after the last scroll input so the spring
        // interpolates smoothly across the gaps between discrete wheel ticks.
        const scrollSettling = time - lastInteraction < 200;
        if (idleOrbit || physics.moving() || progress !== target || layoutDirty || scrollDirty || scrollSettling) frame = requestAnimationFrame(draw);
        else adaptive.reset();
      } catch { dispose(); callbacks.onError(); }
    }
    function wake() {
      if (compiled && !frame && !disposed && visible && !document.hidden) {
        previousTime = previousUpdate = performance.now(); adaptive.reset(); frame = requestAnimationFrame(draw);
      }
    }
    function scroll() {
      scrollDirty = true; lastInteraction = performance.now(); wake();
    }
    function getScrollPosition() {
      return window.scrollY;
    }
    function sampleScroll() {
      scrollDirty = false;
      // On touch devices the document stays fixed. Gestures move this timeline
      // directly, so browser scrolling cannot escape below the scene.
      if (pinnedViewport.matches) return;
      const next = clamp01((getScrollPosition() - start) / range);
      if (next !== target) { lastInteraction = performance.now(); releasePointer(); }
      target = next;
    }
    function resize() {
      layoutDirty = true; scrollDirty = true; wake();
    }
    function measure() {
      layoutDirty = false;
      // Read all layout before any renderer or profile writes. Observer/event
      // bursts only mark dirty, so this work happens at most once per frame.
      const nextWidth = Math.max(1, host.clientWidth), nextHeight = Math.max(1, host.clientHeight);
      const header = parseFloat(getComputedStyle(stage).top) || 0;
      start = pinnedViewport.matches ? 0 : section.getBoundingClientRect().top + getScrollPosition() - header;
      range = pinnedViewport.matches ? nextHeight * (members.length * .55 + .2) : Math.max(1, section.offsetHeight - stage.offsetHeight);
      device.coarsePointer = coarsePointer.matches;
      quality = towerQuality(nextWidth, nextHeight, window.devicePixelRatio, device);
      detail = Math.min(detail, quality.detail, adaptive.detail) as TowerDetail;
      const baseRatio = detail === 0 ? Math.min(quality.pixelRatio, 1, Math.sqrt(450_000 / (nextWidth * nextHeight))) : quality.pixelRatio;
      const ratio = towerPixelRatio(baseRatio, adaptive.scale, detail === 0 ? .5 : quality.minPixelRatio);
      const sizeChanged = width !== nextWidth || height !== nextHeight;
      if (device.coarsePointer && width === nextWidth && height !== nextHeight) {
        // Address-bar motion can resize the viewport several times per swipe.
        // Keep rendering into the existing buffer until it settles; CSS fills
        // the viewport immediately and the camera/profile layout stays in sync.
        window.clearTimeout(viewportResizeTimer);
        viewportResizeTimer = window.setTimeout(() => {
          viewportResizeTimer = 0; layoutDirty = true; wake();
        }, 150);
      } else if (width !== nextWidth) {
        window.clearTimeout(viewportResizeTimer); viewportResizeTimer = 0;
      }
      if (!viewportResizeTimer && (bufferWidth !== nextWidth || bufferHeight !== nextHeight || renderer.getPixelRatio() !== ratio)) {
        renderer.setDrawingBufferSize(nextWidth, nextHeight, ratio);
        bufferWidth = nextWidth; bufferHeight = nextHeight; matricesDirty = true;
      }
      if (sizeChanged) {
        matricesDirty = true;
        width = nextWidth; height = nextHeight;
        css.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix();
        const portraitLayout = width <= 760 && height > 500;
        profileTop = height <= 500 ? 82 : portraitLayout ? 148 : 100;
        const bottomSpace = height <= 500 ? 88 : portraitLayout ? 154 : 104;
        profileWidth = width * .9; profileHeight = Math.max(160, height - profileTop - bottomSpace);
        const monogramSize = Math.min(profileHeight * .57, profileWidth * .6);
        profile.style.width = `${profileWidth}px`;
        profile.style.height = `${profileHeight}px`;
        profile.style.setProperty('--profile-monogram', `${monogramSize}px`);
        if (active >= 0) sizeProfileName(active);
      }
      if (renderer.shadowMap.enabled !== (detail === 2) || host.dataset.quality !== String(detail)) matricesDirty = true;
      renderer.shadowMap.enabled = detail === 2;
      batch.setDetail(detail); scenery.setDetail(detail); physics.setDetail(detail);
      host.dataset.quality = String(detail);
      scrollDirty = true;
    }
    function cast(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
    }
    function pointerDown(event: PointerEvent) {
      if (pinnedViewport.matches && event.pointerType !== 'mouse' && event.isPrimary && host.dataset.interaction !== 'play') {
        gestureId = event.pointerId; gestureX = event.clientX; gestureY = lastGestureY = event.clientY; gestureAxis = null;
        renderer.domElement.setPointerCapture(event.pointerId);
      }
      if (event.button !== 0 || !event.isPrimary || pointerId >= 0 || active >= 0 || towerFrame(progress, members.length).outro > 0) return;
      cast(event);
      const hit = raycaster.intersectObject(batch.blocks)[0], index = hit?.instanceId;
      if (index === undefined || !physics.grab(index, hit.point)) return;
      pointerId = event.pointerId; draggedIndex = index; downX = event.clientX; downY = event.clientY; travelled = 0;
      lastDragPoint.copy(hit.point); throwVelocity.set(0, 0, 0); lastDragTime = performance.now();
      camera.getWorldDirection(forward); dragPlane.setFromNormalAndCoplanarPoint(forward, hit.point);
      renderer.domElement.setPointerCapture(pointerId); host.dataset.dragging = 'true';
      lastInteraction = performance.now(); wake();
    }
    function pointerMove(event: PointerEvent) {
      if (event.pointerId === gestureId) {
        const dx = event.clientX - gestureX, dy = event.clientY - gestureY;
        if (!gestureAxis && Math.hypot(dx, dy) >= 6) gestureAxis = Math.abs(dy) >= Math.abs(dx) ? 'y' : 'x';
        if (gestureAxis === 'y') {
          releasePointer();
          seek(target + (lastGestureY - event.clientY) / range);
          lastGestureY = event.clientY;
          return;
        }
      }
      if (event.pointerId !== pointerId) return;
      travelled = Math.max(travelled, Math.hypot(event.clientX - downX, event.clientY - downY));
      cast(event);
      if (raycaster.ray.intersectPlane(dragPlane, dragPoint)) {
        const now = performance.now(), elapsed = Math.max(.008, (now - lastDragTime) / 1000);
        pointerVelocity.copy(dragPoint).sub(lastDragPoint).divideScalar(elapsed).clampLength(0, 14);
        throwVelocity.lerp(pointerVelocity, .65);
        lastDragPoint.copy(dragPoint); lastDragTime = now;
        physics.move(dragPoint);
      }
      lastInteraction = performance.now(); wake();
    }
    function pointerUp(event: PointerEvent) {
      // Releasing a grabbed block during a swipe also emits lostpointercapture.
      // Keep the vertical gesture alive until the finger actually lifts.
      if (event.pointerId === gestureId && event.type !== 'lostpointercapture') {
        gestureId = -1; gestureAxis = null;
        if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
      }
      if (event.pointerId !== pointerId) return;
      const index = draggedIndex, click = travelled < 6 && event.type === 'pointerup';
      const throwing = !click && event.type === 'pointerup' && performance.now() - lastDragTime < 120;
      releasePointer(throwing ? throwVelocity : undefined); if (click) physics.pull(index);
      lastInteraction = performance.now(); wake();
    }
    function seek(next: number) {
      if (disposed) return;
      releasePointer();
      if (pinnedViewport.matches) target = clamp01(next);
      else window.scrollTo({ top: start + clamp01(next) * range, behavior: 'instant' });
      lastInteraction = performance.now(); wake();
    }
    function wheel(event: WheelEvent) {
      if (!pinnedViewport.matches || event.ctrlKey || (event.target as HTMLElement).closest('select')) return;
      event.preventDefault();
      if (host.dataset.interaction === 'play') return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1;
      seek(target + event.deltaY * unit / range);
    }
    function keydown(event: KeyboardEvent) {
      if (!pinnedViewport.matches || host.dataset.interaction === 'play' || section.closest('[inert]')
        || event.altKey || event.ctrlKey || event.metaKey) return;
      const control = event.target as HTMLElement;
      if (control.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]')
        || (event.key === ' ' && control.closest('button, a'))) return;
      const delta = ({ ArrowDown: 80, ArrowUp: -80, PageDown: height * .65, PageUp: -height * .65, ' ': height * (event.shiftKey ? -.65 : .65) } as Record<string, number>)[event.key];
      if (delta === undefined && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault();
      seek(event.key === 'Home' ? 0 : event.key === 'End' ? 1 : target + delta / range);
    }
    function changeViewportMode() {
      const saved = target;
      measure(); seek(saved); resize();
    }
    function rebuild() {
      if (disposed) return;
      releasePointer(); physics.reset(); storyRemoved = 0; active = -2; progress = target = 0; idleAngle = 0;
      scrollMotion.value = 0; scrollMotion.velocity = 0;
      matricesDirty = true; renderedProgress = -1; lastInteraction = performance.now();
      seek(0);
    }

    const resizeObserver = new ResizeObserver(resize);
    cleanups.push(() => resizeObserver.disconnect());
    resizeObserver.observe(host); resizeObserver.observe(section);
    const intersection = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (!visible) { cancelAnimationFrame(frame); frame = 0; adaptive.reset(); releasePointer(); }
      else resize();
    });
    cleanups.push(() => intersection.disconnect());
    intersection.observe(host);
    const visibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; adaptive.reset(); releasePointer(); }
      else resize();
    };
    const contextLost = (event: Event) => { event.preventDefault(); dispose(); callbacks.onError(); };
    cleanups.push(() => {
      window.removeEventListener('scroll', scroll); window.removeEventListener('resize', resize);
      stage.removeEventListener('wheel', wheel); window.removeEventListener('keydown', keydown);
      pinnedViewport.removeEventListener('change', changeViewportMode);
      document.removeEventListener('visibilitychange', visibility);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      renderer.domElement.removeEventListener('pointerdown', pointerDown); renderer.domElement.removeEventListener('pointermove', pointerMove);
      renderer.domElement.removeEventListener('pointerup', pointerUp); renderer.domElement.removeEventListener('pointercancel', pointerUp);
      renderer.domElement.removeEventListener('lostpointercapture', pointerUp);
    });
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    renderer.domElement.addEventListener('pointerdown', pointerDown); renderer.domElement.addEventListener('pointermove', pointerMove);
    renderer.domElement.addEventListener('pointerup', pointerUp); renderer.domElement.addEventListener('pointercancel', pointerUp);
    renderer.domElement.addEventListener('lostpointercapture', pointerUp);
    window.addEventListener('scroll', scroll, { passive: true }); window.addEventListener('resize', resize, { passive: true });
    stage.addEventListener('wheel', wheel, { passive: false }); window.addEventListener('keydown', keydown);
    pinnedViewport.addEventListener('change', changeViewportMode);
    document.addEventListener('visibilitychange', visibility);
    host.append(renderer.domElement, css.domElement);
    await renderer.compileAsync(scene, camera);
    if (disposed) throw new Error('Tower initialization was interrupted');
    // Observers can fire during compilation. Drawing before it completes can
    // force synchronous shader work onto the first mobile scroll frame.
    compiled = true;
    resize();
    return { dispose, rebuild, seek };
  } catch (error) {
    dispose(); throw error;
  }
}

