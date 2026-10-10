import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { LogoWorldProps } from '../components/shared/LogoWorld';
import { cameraBank, createCoasterTrack, createTrackFrame, sampleTrack, stepCoasterJourney, initialCoasterJourney, departCoasterStation, trackSeparation, approachScale, nextCoasterStop, LOGO_CENTER_Y, COASTER_SPEED, type CoasterStop } from './event-coaster';
import { createScenery } from './event-scenery';
import { createStationPlanner } from './event-layout';
import { createQualityController, qualityPixelRatio, rideQuality } from './event-quality';
import { disposeObject } from './event-batching';
import { cinematicCamera, stationArrivalFrame, stationPanAngle, STATION_PAN_SECONDS, GLIMPSE_EXIT } from './event-cinematics';
import { createRideMap } from './event-minimap';
import { createRidePostprocessing } from './event-postprocessing';

export function createEventWorld(host: HTMLDivElement, get: () => LogoWorldProps) {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  // Keep edges antialiased on phones too; adaptive resolution still bounds GPU cost.
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  // Start within a modest budget, then earn higher quality through sustained fast frames.
  const budget = rideQuality({ coarse, cores: navigator.hardwareConcurrency, memory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory });
  const quality = createQualityController(budget.initial, budget.maximum);
  renderer.setClearColor('#010604');
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .98;
  renderer.info.autoReset = false;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#010604', .0042);
  const camera = new THREE.PerspectiveCamera(70, 1, .15, 1800);
  const postprocessing = createRidePostprocessing(renderer);
  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enabled = false; orbit.enablePan = true; orbit.screenSpacePanning = true; orbit.enableDamping = true; orbit.dampingFactor = .09;
  orbit.minPolarAngle = .15; orbit.maxPolarAngle = Math.PI * .8;
  orbit.rotateSpeed = .5; orbit.zoomSpeed = .6; orbit.autoRotateSpeed = .45;
  const mapCenter = new THREE.Vector3(0, LOGO_CENTER_Y - 5, 35);
  orbit.target.copy(mapCenter);
  scene.add(new THREE.HemisphereLight('#d3ffe2', '#082019', 1.25));
  const light = new THREE.DirectionalLight('#e1f5da', 2.1); light.position.set(-45, 105, 90); light.target.position.set(0, LOGO_CENTER_Y, 0); scene.add(light, light.target);
  const rim = new THREE.DirectionalLight('#78d5a1', 1); rim.position.set(50, 90, -70); rim.target.position.set(0, LOGO_CENTER_Y, 0); scene.add(rim, rim.target);
  const track = createCoasterTrack(), length = track.getLength();
  const minimap = createRideMap(track);
  const mapSamples = track.getPoints(500);
  const mapBounds = new THREE.Box3().setFromPoints(mapSamples).expandByVector(new THREE.Vector3(6, 7, 6));
  mapBounds.min.y = -3;
  const planner = createStationPlanner(track);
  let stopDefinitions: CoasterStop[] = [], stops: number[] = [];
  let travelTarget: number | null = null, travelDirection = 1, travelStops: CoasterStop[] = [];
  const scenery = createScenery(scene, track, coarse);
  let markers: HTMLButtonElement[] = [], stopPoints: (THREE.Vector3 | null)[] = [];
  let cards: { element: HTMLElement; index: number; opacity: number }[] = [];
  let stationProps: LogoWorldProps['stations'] | null = null;
  let worldStations: LogoWorldProps['stations'] = [];
  const stationSignatures = new Map<string, string>();
  const controlsRoot = host.parentElement ?? host;
  const keys = new Set<string>();
  const heldKeys = new Set<string>();
  const controlled = new Set(['KeyW', 'KeyD', 'KeyS', 'KeyA', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight']);
  const driveOptions = { loop: true, boost: false };
  let boosting = false, boostFocus = 0;
  let boostStyle = '';
  let journey = initialCoasterJourney(), motion = journey.motion;
  let mode = get().mode, command = -1, paused = false;
  let disposed = false, failed = false, visible = true, frame = 0, last = 0, elapsed = 0;
  let contextUnavailable = false, recoveryTimer = 0;
  let dragging: { id: number; x: number; y: number } | null = null;
  let gazeX = 0, gazeY = 0, bank = 0, mapBlend = mode === 'overview' ? 1 : 0;
  let transition = 1, initialized = false, notified: number | null = null;
  let dilation = 1, stationFocus = 0, focusStation: number | null = null;
  let panStation: number | null = null, panProgress = 0, panStarted = false, bookRevealed = false;
  const panFrom = new THREE.Quaternion(), panTarget = new THREE.Quaternion();
  let mapInteracted = false, cameraLift = 0, cameraPitch = 0, cameraPullback = 0, lastDiagnostics = 0;
  let reduced = get().reduced;
  let rendered = false, width = 1, height = 1, lastMarkerUpdate = 0;
  let renderDirty = true, drewLastFrame = false, renderedFov = 0;
  const renderedPosition = new THREE.Vector3(), renderedRotation = new THREE.Quaternion();
  const rideFrame = createTrackFrame(), slopeFrame = createTrackFrame();
  const fromPosition = new THREE.Vector3(), fromRotation = new THREE.Quaternion();
  const mapPosition = new THREE.Vector3(), mapRotation = new THREE.Quaternion();
  const desiredPosition = new THREE.Vector3(), desiredRotation = new THREE.Quaternion();
  const target = new THREE.Vector3(), projected = new THREE.Vector3();
  const panOffset = new THREE.Vector3();
  const basis = new THREE.Matrix4(), look = new THREE.Quaternion(), euler = new THREE.Euler(0, 0, 0, 'YXZ');
  const up = new THREE.Vector3(0, 1, 0);
  let fromFov = 70;

  function syncStations(props: LogoWorldProps) {
    renderDirty = true;
    const previousId = journey.station === null ? null : worldStations[journey.station]?.id;
    const dismissedId = journey.dismissed === null ? null : worldStations[journey.dismissed]?.id;
    const travelingId = travelTarget === null ? null : worldStations[travelTarget]?.id;
    const focusedId = focusStation === null ? null : worldStations[focusStation]?.id;
    const panId = panStation === null ? null : worldStations[panStation]?.id;
    stationProps = props.stations;
    const placements = planner.forEvents(props.stations.map(station => station.event));
    worldStations = props.stations;
    stopDefinitions = placements.map(stop => stop ?? { distance: Infinity, radius: 22, name: '' });
    stops = stopDefinitions.map(stop => stop.distance);
    stopPoints = placements.map(stop => stop ? stop.point.clone().add(new THREE.Vector3(0, 5.1, 0)) : null);
    for (const id of stationSignatures.keys()) if (!worldStations.some(station => station.id === id)) { scenery.removeStation(id); stationSignatures.delete(id); }
    worldStations.forEach((station, index) => {
      const placement = placements[index];
      const signature = `${station.name}|${placement?.distance}|${index}`;
      if (stationSignatures.get(station.id) === signature) return;
      scenery.removeStation(station.id);
      if (placement) scenery.addStation(station.id, placement, index, station.name, station.kind ?? 'event');
      stationSignatures.set(station.id, signature);
    });
    markers = Array.from(host.querySelectorAll<HTMLButtonElement>('[data-world-station]'));
    const indexOf = (id: string | null | undefined) => { const index = worldStations.findIndex(s => s.id === id); return index < 0 ? null : index; };
    journey.station = indexOf(previousId); journey.dismissed = indexOf(dismissedId);
    if (journey.station === null && journey.phase !== 'riding') { journey = departCoasterStation(journey); motion = journey.motion; }
    notified = journey.station;
    if (travelTarget !== null) setTravel(indexOf(travelingId));
    focusStation = indexOf(focusedId);
    panStation = indexOf(panId);
    if (focusStation === null) stationFocus = 0;
    syncCards();
    props.onLayout?.(placements.map(Boolean), minimap.layout(placements.map(stop => stop?.point ?? null)));
  }

  function syncCards() {
    cards = Array.from(host.querySelectorAll<HTMLElement>('[data-world-card]')).map(element => ({
      element, index: worldStations.findIndex(station => station.id === element.dataset.worldCard), opacity: 0,
    }));
  }

  function arrivalFrame(journeyStops: CoasterStop[]) {
    // Once braking begins, keep the same station even while reversing or crossing the loop seam.
    const next = nextCoasterStop(motion.distance, journeyStops, length, Math.sign(motion.speed), journey.dismissed);
    const docking = journey.phase === 'braking' || journey.phase === 'stopped';
    const index = docking ? journey.station : next.index;
    const remaining = docking && index !== null ? trackSeparation(motion.distance, stops[index], length) : next.remaining;
    return { index, ...stationArrivalFrame(remaining, index === null ? 0 : stopDefinitions[index].radius, get().reduced) };
  }

  function setTravel(index: number | null) {
    travelTarget = index;
    travelStops = stopDefinitions.map((stop, i) => i === index ? stop : { ...stop, distance: Infinity });
    get().onTravelChange(index);
  }
  function setBoost(active: boolean) { if (boosting !== active) { boosting = active; get().onBoostChange(active); } }
  function resetInput() { keys.clear(); dragging = null; get().input.current = { x: 0, y: 0 }; get().boostInput.current = false; get().audio.current?.quiet(); setBoost(false); }
  function focus() { host.focus({ preventScroll: true }); }
  function mapCamera() {
    // Fit the longer loop, including the foreground garden, on narrow displays.
    const direction = new THREE.Vector3(.3, .45, 1).normalize();
    const right = new THREE.Vector3().crossVectors(up, direction).normalize(), vertical = new THREE.Vector3().crossVectors(direction, right);
    const tangent = Math.tan(THREE.MathUtils.degToRad(44 / 2));
    let distance = 0;
    const sideGuide = width > 900 || height < 500;
    const usableWidth = Math.max(width * .45, width - (sideGuide ? width > 900 ? 360 : 288 : 48));
    const usableHeight = Math.max(height * .48, height - (sideGuide ? 120 : 300));
    for (const point of mapSamples) {
      const corner = point.clone().sub(orbit.target);
      distance = Math.max(distance, corner.dot(direction) + 1.12 * Math.max((Math.abs(corner.dot(right)) + 7) / (tangent * camera.aspect * usableWidth / width), (Math.abs(corner.dot(vertical)) + 7) / (tangent * usableHeight / height)));
    }
    mapPosition.copy(direction).multiplyScalar(distance).add(orbit.target);
    basis.lookAt(mapPosition, orbit.target, up); mapRotation.setFromRotationMatrix(basis);
    orbit.minDistance = Math.max(160, distance * .65); orbit.maxDistance = distance * 1.4;
  }
  function frameMapView() {
    // Keep the map centred in the usable space beside/before the event guide.
    const blend = mode === 'overview' ? transition : 1 - transition;
    // Small phones need room above the checkpoints for the menu and ride toolbar.
    const offsetY = width <= 760 ? (height < 500 ? -20 : 0) : (width > 900 || height < 500 ? 0 : 70);
    if (blend > 0) camera.setViewOffset(width, height, (width > 900 ? -150 : height < 500 ? -120 : 0) * blend, offsetY * blend, width, height);
    else camera.clearViewOffset();
  }
  function size(resetCamera = true) {
    renderDirty = true;
    if (contextUnavailable) return;
    width = Math.max(host.clientWidth, 1); height = Math.max(host.clientHeight, 1);
    renderer.setPixelRatio(qualityPixelRatio(quality.level, width, height, window.devicePixelRatio, coarse));
    renderer.setSize(width, height, false); scenery.setQuality(quality.level);
    postprocessing.resize(renderer.domElement.width, renderer.domElement.height, quality.level, get().reduced);
    camera.aspect = width / height; camera.updateProjectionMatrix(); mapCamera();
    if (resetCamera && mode === 'overview' && transition >= 1) { camera.position.copy(mapPosition); camera.quaternion.copy(mapRotation); orbit.update(); }
  }
  function beginTransition() {
    fromPosition.copy(camera.position); fromRotation.copy(camera.quaternion); fromFov = camera.fov;
    transition = get().reduced ? 1 : 0;
    orbit.enabled = false; orbit.autoRotate = false;
    resetInput(); gazeX = gazeY = 0;
    if (mode === 'overview') {
      panStation = null; panProgress = 0; bookRevealed = false;
      orbit.target.copy(mapCenter); mapInteracted = false; mapCamera();
      if (get().reduced) { camera.position.copy(mapPosition); camera.quaternion.copy(mapRotation); }
    }
  }
  function nearest() {
    let index = -1, distance = Infinity;
    stops.forEach((stop, i) => { const d = trackSeparation(stop, motion.distance, length); if (d < distance) { index = i; distance = d; } });
    return { index, distance };
  }
  function openStation(index: number) {
    get().audio.current?.arrive();
    notified = index; journey = { ...journey, phase: 'stopped', station: index, motion: { ...motion, speed: 0, acceleration: 0 } }; motion = journey.motion;
    resetInput(); panStation = index; panProgress = 0; panStarted = false; bookRevealed = false;
    const cover = worldStations[index].event?.photos?.[0];
    if (cover) { const image = new Image(); image.src = cover.url; }
  }
  const keydown = (event: KeyboardEvent) => {
    if (controlled.has(event.code) && !event.altKey && !event.ctrlKey && !event.metaKey) heldKeys.add(event.code);
    if (event.altKey || event.ctrlKey || event.metaKey || get().paused || panStation !== null || get().mode !== 'explore') return;
    if (controlled.has(event.code)) { event.preventDefault(); keys.add(event.code); }
    if (event.code === 'KeyE' && !event.repeat) { const near = nearest(); if (near.index >= 0 && near.distance < 3.8 && Math.abs(motion.speed) < .12) { event.preventDefault(); openStation(near.index); } }
  };
  const keyup = (event: KeyboardEvent) => { keys.delete(event.code); heldKeys.delete(event.code); };
  const pointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || get().mode !== 'explore' || get().paused || panStation !== null) return;
    focus(); dragging = { id: event.pointerId, x: event.clientX, y: event.clientY }; renderer.domElement.setPointerCapture(event.pointerId);
  };
  const pointerMove = (event: PointerEvent) => {
    if (!dragging || event.pointerId !== dragging.id || get().paused) return;
    gazeX = THREE.MathUtils.clamp(gazeX - (event.clientX - dragging.x) * .003, -1.05, 1.05);
    gazeY = THREE.MathUtils.clamp(gazeY - (event.clientY - dragging.y) * .0025, -.6, .6);
    dragging.x = event.clientX; dragging.y = event.clientY;
  };
  const pointerUp = () => { dragging = null; };
  const contextLost = (event: Event) => {
    event.preventDefault();
    // Mobile browsers may release a background tab's context. Three restores
    // its resources on the same canvas; retain the parked cart and open book.
    contextUnavailable = true;
    get().onRecovering?.(true);
    visibility();
  };
  const contextRestored = () => {
    if (disposed || failed) return;
    contextUnavailable = false; rendered = false;
    size(false); visibility();
  };
  function visibility() {
    heldKeys.clear(); resetInput(); last = 0; quality.reset(); cancelAnimationFrame(frame); frame = 0;
    window.clearTimeout(recoveryTimer);
    if (document.hidden || !visible || disposed || failed) return;
    if (contextUnavailable) {
      // A permanently unavailable GPU still leaves the event books accessible.
      recoveryTimer = window.setTimeout(() => { failed = true; get().onError(); }, 10_000);
      return;
    }
    renderDirty = true;
    frame = requestAnimationFrame(animate);
  }
  function animate(now: number) {
    frame = 0;
    if (disposed || failed || contextUnavailable || document.hidden || !visible) return;
    const rawDelta = last ? (now - last) / 1000 : 0;
    const dt = Math.min(rawDelta, .05); last = now;
    const props = get();
    if (reduced !== props.reduced) { reduced = props.reduced; size(false); syncCards(); }
    let resumeInput = false, board: number | null = null;
    if (stationProps !== props.stations) syncStations(props);
    if (!props.paused) elapsed += dt;
    if (command !== props.command.serial) {
      command = props.command.serial;
      const destination = props.command.station;
      panStation = null; panProgress = 0; panStarted = false; bookRevealed = false;
      setTravel(null);
      if (props.command.travel && destination !== null && Number.isFinite(stops[destination])) {
        const forward = THREE.MathUtils.euclideanModulo(stops[destination] - motion.distance, length);
        travelDirection = forward <= length / 2 ? 1 : -1;
        journey = departCoasterStation(journey);
        // Keep the cart where it is; drive along the rails to the chosen checkpoint.
        journey.motion = { ...motion, speed: 0, acceleration: 0 };
        journey.dismissed = null;
        setTravel(destination);
      }
      else if (props.command.resume) journey = departCoasterStation(journey);
      else { journey = initialCoasterJourney(destination === null || !Number.isFinite(stops[destination]) ? 0 : stops[destination]); journey.dismissed = destination; }
      motion = journey.motion; notified = null; bank = 0; dilation = 1; cameraLift = cameraPitch = cameraPullback = 0; resetInput();
      if (!props.command.resume) { stationFocus = 0; focusStation = null; cards.forEach(card => { card.opacity = 0; }); }
      resumeInput = Boolean(props.command.resume || props.command.driveKey);
      if (props.command.board && destination !== null && Number.isFinite(stops[destination])) board = destination;
      if (mode === 'explore') focus();
    }
    if (mode !== props.mode) { mode = props.mode; beginTransition(); if (mode === 'explore') focus(); }
    if (paused !== props.paused) { paused = props.paused; resetInput(); if (!paused && mode === 'explore') { if (journey.phase === 'stopped') journey = departCoasterStation(journey); notified = null; focus(); } }
    if (board !== null) openStation(board);
    // Docking clears motor input, but a key can remain physically held while
    // the reader clicks Continue. Restore it only after the pause has ended.
    if (resumeInput && !paused) for (const key of heldKeys) keys.add(key);
    const active = mode === 'explore' && !paused && panStation === null && transition >= 1 && controlsRoot.contains(document.activeElement);
    const keyboard = Number(keys.has('KeyW') || keys.has('KeyD') || keys.has('ArrowUp') || keys.has('ArrowRight')) - Number(keys.has('KeyS') || keys.has('KeyA') || keys.has('ArrowDown') || keys.has('ArrowLeft'));
    const stick = props.input.current;
    const drivingKey = keys.size > Number(keys.has('ShiftLeft')) + Number(keys.has('ShiftRight'));
    let throttle = drivingKey ? keyboard : Math.abs(stick.y) >= Math.abs(stick.x) ? stick.y : stick.x;
    if (travelTarget !== null && throttle) { setTravel(null); journey = departCoasterStation(journey); }
    if (travelTarget !== null) throttle = travelDirection;
    const journeyStops = travelTarget === null ? stopDefinitions : travelStops;
    driveOptions.boost = active && (journey.phase === 'riding' || journey.phase === 'approaching') && (keys.has('ShiftLeft') || keys.has('ShiftRight') || props.boostInput.current);
    if (driveOptions.boost && !throttle && !drivingKey) throttle = Math.sign(motion.speed) || 1;
    if (active) {
      const current = sampleTrack(track, motion.distance, length, slopeFrame);
      const scale = Math.min(approachScale(motion.distance, journeyStops, length, Math.sign(motion.speed) || Math.sign(throttle), journey.dismissed), arrivalFrame(journeyStops).timeScale);
      dilation = props.reduced ? 1 : THREE.MathUtils.damp(dilation, scale, 4, dt);
      // Dilate the simulation clock, preserving the braking solver's exact stopping point.
      journey = stepCoasterJourney(journey, throttle, current.tangent.y, dt * dilation, length, journeyStops, props.reduced, driveOptions);
      motion = journey.motion;
      if (journey.phase === 'stopped' && journey.station !== null && notified !== journey.station) { setTravel(null); openStation(journey.station); }
    }
    setBoost(driveOptions.boost && (journey.phase === 'riding' || journey.phase === 'approaching'));
    if (props.reduced) dilation = 1;
    const arrival = arrivalFrame(journeyStops);
    const revealStation = mode === 'explore' && !bookRevealed && transition >= 1 && !paused ? (panStation ?? arrival.index) : null;
    if (revealStation !== null && arrival.focus > 0) focusStation = revealStation;
    stationFocus = props.reduced ? 0 : THREE.MathUtils.damp(stationFocus, revealStation === null ? 0 : arrival.focus, 6, dt);
    const visualSpeed = motion.speed * dilation;
    boostFocus = props.reduced ? 0 : THREE.MathUtils.damp(boostFocus, boosting ? 1 : 0, boosting ? 3.8 : 4.5, dt);
    const nextBoostStyle = boostFocus.toFixed(3);
    if (boostStyle !== nextBoostStyle) { boostStyle = nextBoostStyle; controlsRoot.style.setProperty('--nx-boost-focus', boostStyle); }
    const nextEvent = nextCoasterStop(motion.distance, journeyStops, length, Math.sign(motion.speed), journey.dismissed);
    const showGlimpse = active && !props.reduced && Math.abs(motion.speed) > .1 && journey.phase !== 'stopped' && nextEvent.remaining > Math.max(GLIMPSE_EXIT, nextEvent.index === null ? 0 : stopDefinitions[nextEvent.index].radius);
    props.glimpses.current?.update(showGlimpse && nextEvent.index !== null ? worldStations[nextEvent.index] : null, nextEvent.remaining, dt);
    const f = sampleTrack(track, motion.distance, length, rideFrame);
    props.audio.current?.update(visualSpeed / COASTER_SPEED, active && document.hasFocus(), {
      boost: boosting, braking: journey.phase === 'braking' || throttle * motion.speed < -.1, slope: f.tangent.y,
    });
    props.minimap.current?.update(minimap.project(f.point));
    const compactCamera = coarse || width <= 768 || height <= 500;
    const cinematic = cinematicCamera(visualSpeed, motion.acceleration * dilation, f.tangent.y, COASTER_SPEED, compactCamera, props.reduced, boostFocus);
    bank = props.reduced ? 0 : THREE.MathUtils.damp(bank, cameraBank(f.curvature, visualSpeed, false) * cinematic.bankScale, 9, dt);
    cameraLift = props.reduced ? 0 : THREE.MathUtils.damp(cameraLift, cinematic.lift, 9, dt);
    cameraPitch = props.reduced ? 0 : THREE.MathUtils.damp(cameraPitch, cinematic.pitch, 9, dt);
    cameraPullback = props.reduced ? 0 : THREE.MathUtils.damp(cameraPullback, cinematic.pullback, 6, dt);
    if (!dragging) { gazeX = THREE.MathUtils.damp(gazeX, 0, 3.4 + boostFocus * 5, dt); gazeY = THREE.MathUtils.damp(gazeY, 0, 3.4 + boostFocus * 5, dt); }
    target.copy(f.point).add(f.tangent);
    basis.lookAt(f.point, target, f.up); desiredRotation.setFromRotationMatrix(basis);
    look.setFromEuler(euler.set(0, 0, bank)); desiredRotation.multiply(look);
    scenery.cart.position.copy(f.point); scenery.cart.quaternion.copy(desiredRotation);
    scenery.player.position.copy(f.point).addScaledVector(f.up, 1);
    desiredPosition.copy(f.point).addScaledVector(f.up, (compactCamera ? 1.68 : 1.48) + cameraLift).addScaledVector(f.tangent, -cameraPullback);
    look.setFromEuler(euler.set(gazeY + cameraPitch, gazeX, 0)); desiredRotation.multiply(look);
    const rideFov = cinematic.fov - (props.reduced ? 0 : (1 - dilation) * 5);
    if (!initialized) {
      initialized = true; camera.position.copy(desiredPosition); camera.quaternion.copy(desiredRotation); camera.fov = rideFov;
      if (mode === 'overview') { camera.position.copy(mapPosition); camera.quaternion.copy(mapRotation); camera.fov = 44; }
    }
    if (transition < 1) {
      transition = Math.min(1, transition + dt);
      const t = THREE.MathUtils.smootherstep(transition, 0, 1);
      camera.position.lerpVectors(fromPosition, mode === 'overview' ? mapPosition : desiredPosition, t);
      camera.quaternion.slerpQuaternions(fromRotation, mode === 'overview' ? mapRotation : desiredRotation, t);
      camera.fov = THREE.MathUtils.lerp(fromFov, mode === 'overview' ? 44 : rideFov, t);
    } else if (mode === 'explore') {
      camera.position.copy(desiredPosition);
      // Exponential smoothing stays consistent at 30/60/120 Hz; rotation settles
      // 90% in 128 ms instead of 288 ms, without lagging behind the cart position.
      camera.quaternion.slerp(desiredRotation, props.reduced ? 1 : 1 - Math.exp(-35 * dt));
      camera.fov = props.reduced ? rideFov : THREE.MathUtils.damp(camera.fov, rideFov, 8, dt);
    } else {
      camera.fov = 44;
      orbit.enabled = !paused;
      orbit.autoRotate = !paused && !props.reduced && !mapInteracted;
      if (!paused) {
        orbit.update(dt);
        panOffset.copy(orbit.target); orbit.target.clamp(mapBounds.min, mapBounds.max);
        panOffset.sub(orbit.target); camera.position.sub(panOffset);
      }
    }
    // Dock first, then turn 90 degrees toward the right-hand terrace. The book
    // opens only after the final pan frame, and the cart stays parked throughout.
    if (panStation !== null && mode === 'explore' && transition >= 1) {
      if (!panStarted) {
        panFrom.copy(camera.quaternion); panStarted = true;
        if (import.meta.env.DEV) { host.dataset.panStartedAt = String(now); delete host.dataset.panCompletedAt; }
      }
      // Use real elapsed time so docking never adds a long camera wait.
      if (!paused) panProgress = props.reduced ? 1 : Math.min(1, panProgress + rawDelta / STATION_PAN_SECONDS);
      panTarget.copy(panFrom).multiply(look.setFromEuler(euler.set(0, stationPanAngle(panProgress), 0)));
      camera.quaternion.copy(panTarget);
    }
    frameMapView(); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    // A stable arrival caption stays in view as the cart approaches. Fade it with
    // the pan instead of projecting a card that drifts off to the right first.
    for (const card of cards) {
      const opacity = card.index === revealStation ? arrival.opacity * (panStation === null ? 1 : 1 - panProgress) : 0;
      if (opacity === 0 && card.opacity === 0 && card.element.style.visibility !== 'visible') continue;
      card.opacity = THREE.MathUtils.damp(card.opacity, opacity, 7, dt);
      if (opacity === 0 && card.opacity < .002) card.opacity = 0;
      const show = mode === 'explore' && !props.reduced && card.opacity > .002 && !bookRevealed;
      if (show) {
        card.element.style.transform = `translate(${width * .5}px,${height * (height <= 500 ? .55 : .66)}px) translate(-50%,-50%)`;
      }
      card.element.style.opacity = String(card.opacity);
      card.element.style.visibility = show ? 'visible' : 'hidden';
      card.element.setAttribute('aria-hidden', String(!show || paused || card.opacity < .1));
      card.element.style.setProperty('--nx-arrival-progress', String(card.index === revealStation ? arrival.proximity : 0));
    }
    mapBlend = props.reduced ? (mode === 'overview' ? 1 : 0) : THREE.MathUtils.damp(mapBlend, mode === 'overview' ? 1 : 0, 3, dt);
    scenery.update(elapsed, props.reduced, mapBlend, camera);
    (scene.fog as THREE.FogExp2).density = THREE.MathUtils.lerp(.0042, .0008, mapBlend);
    if (mode === 'overview' && now - lastMarkerUpdate > 50) { lastMarkerUpdate = now;
      markers = Array.from(host.querySelectorAll<HTMLButtonElement>('[data-world-station]'));
      const depths = stopPoints.map((point, i) => ({ i, distance: point?.distanceTo(camera.position) ?? Infinity })).sort((a, b) => b.distance - a.distance);
      const ranks = new Map(depths.map((item, rank) => [item.i, rank]));
      markers.forEach((marker, i) => {
      const show = mode === 'overview' && transition >= 1 && !paused && !!stopPoints[i];
      if (show) {
        projected.copy(stopPoints[i]!).project(camera);
        const scale = THREE.MathUtils.clamp(camera.position.distanceTo(orbit.target) / stopPoints[i]!.distanceTo(camera.position), .8, 1.2);
        marker.style.transform = `translate(${(projected.x * .5 + .5) * width}px,${(-projected.y * .5 + .5) * height}px) translate(-50%,-50%) scale(${scale})`;
        marker.style.zIndex = String(ranks.get(i) ?? 0);
      }
      marker.style.visibility = !show || projected.z > 1 || projected.z < -1 || Math.abs(projected.x) > .95 || Math.abs(projected.y) > .94 ? 'hidden' : 'visible';
    }); }
    if (!paused && drewLastFrame && quality.sample(rawDelta) !== null) size(false);
    // Static idle views and open dialogs need no GPU work. Camera/scene changes
    // wake rendering without restarting the motor, transition, or orbit.
    const cameraChanged = renderedPosition.distanceToSquared(camera.position) > .000001 || renderedRotation.angleTo(camera.quaternion) > .0001 || Math.abs(renderedFov - camera.fov) > .001;
    drewLastFrame = !rendered || renderDirty || cameraChanged || transition < 1;
    try { if (drewLastFrame) { renderer.info.reset(); postprocessing.render(scene, camera, mapBlend, compactCamera, visualSpeed, panStation !== null); renderDirty = false; renderedPosition.copy(camera.position); renderedRotation.copy(camera.quaternion); renderedFov = camera.fov; } }
    catch (error) { failed = true; props.audio.current?.quiet(); console.error('Unable to render the Nucleus ride:', error); props.onError(); return; }
    if (import.meta.env.DEV && panStation !== null && !bookRevealed) host.dataset.panDepthOfField = String(postprocessing.depthOfField);
    if (!rendered) { rendered = true; props.onRecovering?.(false); props.onReady(); }
    // Pan onComplete: reveal in this same frame, directly after the final sharp render.
    if (panStation !== null && panProgress === 1 && !bookRevealed && !paused) {
      if (import.meta.env.DEV) host.dataset.panCompletedAt = String(performance.now());
      bookRevealed = true; props.onArrive(panStation);
    }
    if (import.meta.env.DEV && now - lastDiagnostics > 200) {
      lastDiagnostics = now;
      host.dataset.quality = String(quality.level); host.dataset.pixelRatio = renderer.getPixelRatio().toFixed(2);
      host.dataset.drawCalls = String(renderer.info.render.calls); host.dataset.triangles = String(renderer.info.render.triangles);
      host.dataset.distance = motion.distance.toFixed(2);
      host.dataset.speed = motion.speed.toFixed(2); host.dataset.boost = String(boosting); host.dataset.trackLength = length.toFixed(2);
      host.dataset.phase = journey.phase; host.dataset.dilation = dilation.toFixed(3);
      host.dataset.stationFocus = stationFocus.toFixed(3);
      host.dataset.arrivalStage = panStation === null ? 'riding' : bookRevealed ? 'book' : 'panning';
      host.dataset.panProgress = panProgress.toFixed(3);
      host.dataset.panAngle = stationPanAngle(panProgress).toFixed(4);
      host.dataset.cardStation = revealStation === null ? '' : String(revealStation);
      host.dataset.travelTarget = travelTarget === null ? '' : String(travelTarget);
      host.dataset.driveReady = String(active);
      host.dataset.pan = orbit.target.toArray().map(n => n.toFixed(1)).join(',');
      host.dataset.orbit = String(orbit.autoRotate); host.dataset.fov = camera.fov.toFixed(2);
      host.dataset.cameraLag = camera.quaternion.angleTo(desiredRotation).toFixed(4);
      host.dataset.cameraPullback = cameraPullback.toFixed(3);
      host.dataset.postprocessing = String(postprocessing.enabled); host.dataset.depthOfField = String(postprocessing.depthOfField);
      host.dataset.audioRunning = String(props.audio.current?.running ?? false); host.dataset.audioGain = (props.audio.current?.gain ?? 0).toFixed(4);
      host.dataset.antialias = String(renderer.getContext().getContextAttributes()?.antialias);
    }
    frame = requestAnimationFrame(animate);
  }

  const takeOverMap = () => { mapInteracted = true; orbit.autoRotate = false; };
  orbit.addEventListener('start', takeOverMap);
  const resize = new ResizeObserver(() => size()); resize.observe(host);
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; visibility(); }); intersection.observe(host);
  controlsRoot.addEventListener('keydown', keydown); host.addEventListener('focusout', resetInput);
  window.addEventListener('keyup', keyup); window.addEventListener('blur', resetInput);
  document.addEventListener('visibilitychange', visibility);
  renderer.domElement.addEventListener('pointerdown', pointerDown); renderer.domElement.addEventListener('pointermove', pointerMove);
  renderer.domElement.addEventListener('pointerup', pointerUp); renderer.domElement.addEventListener('pointercancel', pointerUp);
  renderer.domElement.addEventListener('lostpointercapture', pointerUp); renderer.domElement.addEventListener('webglcontextlost', contextLost);
  renderer.domElement.addEventListener('webglcontextrestored', contextRestored);
  size(); frame = requestAnimationFrame(animate);
  return () => {
    disposed = true; window.clearTimeout(recoveryTimer); cancelAnimationFrame(frame); resetInput(); resize.disconnect(); intersection.disconnect(); orbit.removeEventListener('start', takeOverMap); orbit.dispose();
    controlsRoot.removeEventListener('keydown', keydown); host.removeEventListener('focusout', resetInput);
    window.removeEventListener('keyup', keyup); window.removeEventListener('blur', resetInput); document.removeEventListener('visibilitychange', visibility);
    renderer.domElement.removeEventListener('pointerdown', pointerDown); renderer.domElement.removeEventListener('pointermove', pointerMove);
    renderer.domElement.removeEventListener('pointerup', pointerUp); renderer.domElement.removeEventListener('pointercancel', pointerUp);
    renderer.domElement.removeEventListener('lostpointercapture', pointerUp); renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    renderer.domElement.removeEventListener('webglcontextrestored', contextRestored);
    postprocessing.dispose(); disposeObject(scene); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
  };
}
