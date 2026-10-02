import * as THREE from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import type { Member } from '../types';
import { BLOCK_SIZE, LAYER_HEIGHT, advanceTowerScroll, clamp01, smooth, towerExit, towerFrame, towerSlots } from './people-tower-motion.ts';
import { towerPixelRatio, towerQuality } from './people-tower-quality';
import { createTowerScenery } from './people-tower-scenery';
import { createTowerBlocks, TOWER_PALETTES } from './people-tower-blocks';
import { createTowerPhysics } from './people-tower-physics';

type Callbacks = { onMember: (index: number) => void; onError: () => void };

function makeProfile() {
  const element = document.createElement('div');
  element.className = 'tower-profile';
  // Member values are always assigned with textContent.
  element.innerHTML = '<div class="tower-profile__meta"><span>NUCLEUS / SJEC</span><span data-profile-index></span></div><div class="tower-profile__monogram"></div><img class="tower-profile__photo" src="" alt="" /><span class="tower-profile__cross">+</span><div class="tower-profile__copy"><p class="tower-profile__role"></p><div class="tower-profile__name"><span></span><span></span></div></div><div class="tower-profile__footer"><span>The people / Nucleus</span><span>Keep scrolling ↗</span></div>';
  return element;
}

/** A sleeping rigid-body tower, two instanced draws, and one crisp DOM profile. */
export function createPeopleTower(host: HTMLElement, section: HTMLElement, members: Member[], callbacks: Callbacks) {
  const cleanups: (() => void)[] = [];
  let disposed = false;
  function dispose() {
    if (disposed) return;
    disposed = true;
    while (cleanups.length) cleanups.pop()!();
  }
  // Register resources as they are created, including partial initialization.
  try {
    const coarsePointer = matchMedia('(pointer: coarse)');
    const device = { coarsePointer: coarsePointer.matches, cores: navigator.hardwareConcurrency,
      memory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory };
    let quality = towerQuality(host.clientWidth, host.clientHeight, window.devicePixelRatio, device);
    const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true,
      powerPreference: quality.simplified ? 'low-power' : 'high-performance' });
    cleanups.push(() => { renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .95;
    renderer.shadowMap.enabled = !quality.simplified; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    const css = new CSS3DRenderer(); css.domElement.className = 'people-tower__labels';
    cleanups.push(() => css.domElement.remove());
    host.append(renderer.domElement, css.domElement);
    const scene = new THREE.Scene(), labels = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, .1, 150);
    const slots = towerSlots(members.map(member => member.id)), layers = Math.ceil(members.length / 3);
    const physics = createTowerPhysics(slots);
    cleanups.push(physics.dispose);
    const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const batch = createTowerBlocks(scene, members, Math.min(quality.maxTextureSize, renderer.capabilities.maxTextureSize), quality.simplified, anisotropy);
    cleanups.push(batch.dispose);
    const scenery = createTowerScenery(scene, physics.floorY, layers * LAYER_HEIGHT, quality.simplified);
    cleanups.push(scenery.dispose);
    const profile = makeProfile(), profileObject = new CSS3DObject(profile); labels.add(profileObject);
    cleanups.push(() => profileObject.removeFromParent());
    const profileName = profile.querySelector('.tower-profile__name')!;
    const firstName = profileName.children[0], lastName = profileName.children[1];
    const profileRole = profile.querySelector('.tower-profile__role')!;
    const monogram = profile.querySelector('.tower-profile__monogram')!;
    const photo = profile.querySelector('.tower-profile__photo') as HTMLImageElement;
    const profileIndex = profile.querySelector('[data-profile-index]')!;
    const stage = host.parentElement!;
    let width = 1, height = 1, profileWidth = 1, profileHeight = 1;
    let start = 0, range = 1, target = 0, progress = 0, frame = 0, previousTime = 0;
    let active = -2, storyRemoved = 0, visible = true, idleAngle = 0, lastInteraction = -Infinity;
    let matricesDirty = true, renderedProgress = -1, lastRenderTime = 0;
    let layoutDirty = true, scrollDirty = true, initialized = false;
    let resolutionScale = 1, averageFrameTime = 1 / 60, slowTime = 0, effectsReduced = false;
    const scrollMotion = { value: 0, velocity: 0 };
    const right = new THREE.Vector3(), up = new THREE.Vector3(), forward = new THREE.Vector3();
    const source = new THREE.Vector3(), pulled = new THREE.Vector3(), activeSource = new THREE.Vector3();
    const control1 = new THREE.Vector3(), control2 = new THREE.Vector3(), destination = new THREE.Vector3();
    const direction = new THREE.Vector3(), faceOffset = new THREE.Vector3(), targetScale = new THREE.Vector3();
    const activeQuaternion = new THREE.Quaternion(), tumbleQuaternion = new THREE.Quaternion(), exitQuaternion = new THREE.Quaternion();
    const euler = new THREE.Euler(), curve = new THREE.CubicBezierCurve3();
    const plankScale = new THREE.Vector3(...BLOCK_SIZE);
    const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(), dragPlane = new THREE.Plane(), dragPoint = new THREE.Vector3();
    let pointerId = -1, draggedIndex = -1, downX = 0, downY = 0, travelled = 0;
    cleanups.push(() => {
      cancelAnimationFrame(frame); releasePointer();
      section.style.removeProperty('--tower-intro'); section.style.removeProperty('--tower-progress'); section.style.removeProperty('--tower-outro');
      delete host.dataset.activeMember; delete host.dataset.dragging;
    });

    function setProfile(index: number) {
      const member = members[index], parts = member.name.split(' ');
      const palette = TOWER_PALETTES[index % TOWER_PALETTES.length];
      profile.style.setProperty('--tower-paper', palette.paper); profile.style.setProperty('--tower-ink', palette.ink);
      firstName.textContent = parts[0]; lastName.textContent = parts.slice(1).join(' ');
      profileRole.textContent = member.role; monogram.textContent = member.initials;
      if (member.image) { photo.src = member.image; photo.style.display = "block"; } else { photo.style.display = "none"; }
      profileIndex.textContent = `${String(index + 1).padStart(2, '0')} / ${String(members.length).padStart(2, '0')}`;
      const longest = Math.max(parts[0].length, parts.slice(1).join(' ').length);
      const fontSize = Math.min(profileHeight * .225, profileWidth * .83 / (Math.max(5, longest) * .49));
      profile.style.setProperty('--profile-name', `${fontSize}px`);
    }

    function releasePointer() {
      const id = pointerId; pointerId = -1; draggedIndex = -1; physics.release();
      if (id >= 0 && renderer.domElement.hasPointerCapture(id)) renderer.domElement.releasePointerCapture(id);
      delete host.dataset.dragging;
    }

    function syncStory(state: ReturnType<typeof towerFrame>) {
      const desiredRemoved = state.completed;
      if (active === state.index && storyRemoved === desiredRemoved) return;
      releasePointer();
      // Reverse seeking returns only the pieces that need to come back,
      // leaving the rest of the tower untouched in their current poses.
      if (state.completed < storyRemoved || (state.index < 0 && state.completed === 0 && active >= 0)) {
        // Return pieces one-by-one from the most recently removed back to the new completed count
        for (let i = storyRemoved - 1; i >= state.completed; i--) {
          physics.returnBody(i);
        }
        // Also return the active story piece if we're scrolling all the way back
        if (active >= 0 && state.index < 0) {
          physics.returnBody(active);
        }
        storyRemoved = state.completed;
      }
      for (let i = storyRemoved; i < state.completed; i++) physics.remove(i);
      storyRemoved = state.completed;
      active = state.index;
      if (active >= 0) {
        const body = physics.bodies[active];
        activeSource.copy(body.position); activeQuaternion.copy(body.quaternion);
        physics.beginStory(active); setProfile(active);
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
      const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const radius = Math.max(10, 2.6 / (halfFov * camera.aspect), (layers * LAYER_HEIGHT / 2 + 1.1) / halfFov);
      // This orbit is driven only by elapsed idle time, independently of scrolling.
      const angle = .68 + idleAngle;
      camera.position.set(Math.sin(angle) * radius, radius * .32, Math.cos(angle) * radius);
      camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
      right.set(1, 0, 0).applyQuaternion(camera.quaternion); up.set(0, 1, 0).applyQuaternion(camera.quaternion);
      camera.getWorldDirection(forward);
      const distance = 4.8;
      targetScale.set(2 * halfFov * distance * camera.aspect * .93, 2 * halfFov * distance * .79, .16);
      destination.copy(camera.position).addScaledVector(forward, distance + .08).addScaledVector(up, -0.1);
      const exitState = towerExit(state.local);
      const profileVisible = state.index >= 0 && exitState.opacity > 0 && exitState.scale > 0;
      const labelsChanged = profileObject.visible !== profileVisible || matricesDirty || changedProgress || cameraMoved;
      profileObject.visible = profileVisible;
      if (transformsChanged || matricesDirty || changedProgress || (cameraMoved && state.index >= 0)) {
        const block = batch.pose;
        physics.bodies.forEach((body, index) => {
          if (index < state.completed || state.outro > 0) { batch.update(index, false); return; }
          const slot = slots[index];
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
            
            // Ensure the visual mesh never dips below the floor level, preventing it from clipping 
            // through the table when pulling out blocks from the bottom row of the tower.
            block.position.y = Math.max(block.position.y, physics.floorY + 0.3);

            const exit = exitState.progress;
            if (exit > 0) {
              block.position.addScaledVector(right, slot.direction * targetScale.x * 1.55 * exit)
                .addScaledVector(up, ((index % 3) - 1) * targetScale.y * .7 * exit).addScaledVector(forward, 2.7 * exit);
              exitQuaternion.setFromEuler(euler.set(-.18 * exit, .4 * slot.direction * exit, -.45 * slot.direction * exit));
              block.quaternion.multiply(exitQuaternion);
            }
            block.scale.multiplyScalar(exitState.scale);
            physics.placeStory(block.position, block.quaternion, block.scale, t > 0.10);
            profile.style.opacity = String(exitState.opacity);
            faceOffset.set(0, 0, block.scale.z / 2 + .008).applyQuaternion(block.quaternion);
            profileObject.position.copy(block.position).add(faceOffset); profileObject.quaternion.copy(block.quaternion);
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
      const dt = Math.max(0, Math.min(.05, elapsed));
      // Hardware hints miss slow GPUs. Downshift only after sustained slow frames,
      // discounting isolated stalls; never oscillate resolution during a visit.
      if (elapsed > 0) {
        const sample = Math.min(.1, elapsed);
        averageFrameTime += (sample - averageFrameTime) * .05;
        slowTime = averageFrameTime > 1 / 40 ? slowTime + Math.min(.25, elapsed) : 0;
        if (slowTime > 2 && (!effectsReduced || resolutionScale > .6)) {
          // Shed shadows and continuous orbit before reducing supersampling.
          if (!effectsReduced) effectsReduced = true;
          else resolutionScale = Math.max(.6, resolutionScale - .1);
          slowTime = 0; layoutDirty = true;
        }
      }
      try {
        if (layoutDirty) measure();
        sampleScroll();
        if (!initialized) { scrollMotion.value = target; initialized = true; }
        // Lenis handles all scroll smoothing. Response 200 makes the tower
        // track its output near-instantly with zero perceptible lag.
        progress = advanceTowerScroll(scrollMotion, target, elapsed, 200);
        const state = towerFrame(progress, members.length);
        // The desktop intro orbits; readable profiles and settled mobile scenes rest.
        const idleOrbit = !quality.simplified && state.index < 0 && state.completed === 0 && state.outro === 0;
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
        else slowTime = 0;
      } catch { dispose(); callbacks.onError(); }
    }
    function wake() {
      if (!frame && !disposed && visible && !document.hidden) { previousTime = performance.now(); frame = requestAnimationFrame(draw); }
    }
    function scroll() {
      scrollDirty = true; lastInteraction = performance.now(); wake();
    }
    function sampleScroll() {
      scrollDirty = false;
      const next = clamp01((window.scrollY - start) / range);
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
      start = section.getBoundingClientRect().top + scrollY - header; range = Math.max(1, section.offsetHeight - stage.offsetHeight);
      device.coarsePointer = coarsePointer.matches;
      quality = towerQuality(nextWidth, nextHeight, window.devicePixelRatio, device);
      quality.simplified ||= effectsReduced;
      const ratio = towerPixelRatio(quality.pixelRatio, resolutionScale);
      const sizeChanged = width !== nextWidth || height !== nextHeight;
      if (sizeChanged || renderer.getPixelRatio() !== ratio) {
        renderer.setDrawingBufferSize(nextWidth, nextHeight, ratio); matricesDirty = true;
      }
      if (sizeChanged) {
        width = nextWidth; height = nextHeight;
        css.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix();
        profileWidth = width * .93; profileHeight = height * .79;
        profile.style.width = `${profileWidth}px`; profile.style.height = `${profileHeight}px`;
        profile.style.setProperty('--profile-monogram', `${Math.min(profileHeight * .57, profileWidth * .6)}px`);
        if (active >= 0) setProfile(active);
      }
      if (renderer.shadowMap.enabled === quality.simplified) matricesDirty = true;
      renderer.shadowMap.enabled = !quality.simplified;
      batch.setSimplified(quality.simplified); scenery.setSimplified(quality.simplified);
      scrollDirty = true;
    }
    function cast(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
    }
    function pointerDown(event: PointerEvent) {
      if (event.button !== 0 || !event.isPrimary || pointerId >= 0 || active >= 0 || towerFrame(progress, members.length).outro > 0) return;
      cast(event);
      const hit = raycaster.intersectObject(batch.blocks)[0], index = hit?.instanceId;
      if (index === undefined || !physics.grab(index, hit.point)) return;
      pointerId = event.pointerId; draggedIndex = index; downX = event.clientX; downY = event.clientY; travelled = 0;
      camera.getWorldDirection(forward); dragPlane.setFromNormalAndCoplanarPoint(forward, hit.point);
      renderer.domElement.setPointerCapture(pointerId); host.dataset.dragging = 'true';
      lastInteraction = performance.now(); wake();
    }
    function pointerMove(event: PointerEvent) {
      if (event.pointerId !== pointerId) return;
      travelled = Math.max(travelled, Math.hypot(event.clientX - downX, event.clientY - downY));
      cast(event); if (raycaster.ray.intersectPlane(dragPlane, dragPoint)) physics.move(dragPoint);
      lastInteraction = performance.now(); wake();
    }
    function pointerUp(event: PointerEvent) {
      if (event.pointerId !== pointerId) return;
      const index = draggedIndex, click = travelled < 6 && event.type === 'pointerup';
      releasePointer(); if (click) physics.pull(index);
      lastInteraction = performance.now(); wake();
    }
    function rebuild() {
      if (disposed) return;
      releasePointer(); physics.reset(); storyRemoved = 0; active = -2; progress = target = 0; idleAngle = 0;
      scrollMotion.value = 0; scrollMotion.velocity = 0;
      matricesDirty = true; renderedProgress = -1; lastInteraction = performance.now();
      window.scrollTo({ top: start, behavior: 'instant' }); wake();
    }

    const resizeObserver = new ResizeObserver(resize);
    cleanups.push(() => resizeObserver.disconnect());
    resizeObserver.observe(host); resizeObserver.observe(section);
    const intersection = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (!visible) { cancelAnimationFrame(frame); frame = 0; slowTime = 0; releasePointer(); }
      else resize();
    });
    cleanups.push(() => intersection.disconnect());
    intersection.observe(host);
    const visibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; slowTime = 0; releasePointer(); }
      else resize();
    };
    const contextLost = (event: Event) => { event.preventDefault(); dispose(); callbacks.onError(); };
    cleanups.push(() => {
      window.removeEventListener('scroll', scroll); window.removeEventListener('resize', resize);
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
    document.addEventListener('visibilitychange', visibility);
    resize();
    return { dispose, rebuild };
  } catch (error) {
    dispose(); throw error;
  }
}

