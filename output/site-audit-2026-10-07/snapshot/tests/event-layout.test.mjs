import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createCoasterTrack, sampleTrack, createTrackFrame, LOGO_DEPTH } from '../src/lib/event-coaster.ts';
import { createStationPlanner, logoClearance, BUILDING_BOUNDS, maxStopGap, fillWaypoints } from '../src/lib/event-layout.ts';
import { createEventStations } from '../src/lib/event-stations.ts';
import { createRideMap } from '../src/lib/event-minimap.ts';
import { createQualityController, qualityPixelRatio, rideQuality, shouldShowJoystick } from '../src/lib/event-quality.ts';
import { createVerticalLogo } from '../src/lib/event-scenery.ts';
import { disposeObject } from '../src/lib/event-batching.ts';
import { workshops } from './fixtures/workshops.mjs';

const track = createCoasterTrack(), length = track.getLength(), planner = createStationPlanner(track);
test('rail, cart, and rider envelopes clear the solid logo over the entire route', () => {
  const frame = createTrackFrame();
  for (let i = 0; i <= 12000; i++) {
    const f = sampleTrack(track, i / 12000 * length, length, frame);
    assert.ok(logoClearance(f.point) > 2.5, `track clips at ${i}`);
    assert.ok(logoClearance(f.point.clone().addScaledVector(f.up, 1.5)) > 2.5, `rider clips at ${i}`);
  }
  const logo = createVerticalLogo();
  assert.ok(logo.isMesh); assert.equal(logo.children.length, 1);
  assert.equal(logo.material.transparent, false); assert.equal(logo.material.wireframe, false);
  assert.equal(logo.material.depthWrite, true);
  assert.ok(logo.children[0].isLineSegments);
  assert.equal(logo.children[0].material.depthTest, true);
  disposeObject(logo);
});

test('solid logo and outline stay within the original depth and a bounded geometry budget', () => {
  const logo = createVerticalLogo(), geometry = logo.geometry;
  geometry.computeBoundingBox();
  assert.ok(Math.abs(geometry.boundingBox.min.z) < 1e-6);
  assert.ok(Math.abs(geometry.boundingBox.max.z - LOGO_DEPTH) < 1e-6);
  const positions = geometry.getAttribute('position');
  assert.equal(positions.count % 3, 0);
  assert.ok(positions.array.every(Number.isFinite));
  assert.ok(positions.count > 0 && positions.count / 3 < 12_000, 'logo stays inexpensive enough for phones');
  const outlineGeometry = logo.children[0].geometry, outlinePositions = outlineGeometry.getAttribute('position');
  outlineGeometry.computeBoundingBox();
  assert.ok(geometry.boundingBox.containsBox(outlineGeometry.boundingBox));
  assert.equal(outlinePositions.count % 2, 0);
  assert.ok(outlinePositions.array.every(Number.isFinite));
  assert.ok(outlinePositions.count > 0 && outlinePositions.count / 2 < 6_500, 'outline stays inexpensive enough for phones');
  // Check the actual solid surface, not just the original polygon clearance mask.
  logo.updateMatrixWorld(true);
  const ray = new THREE.Raycaster(), frame = createTrackFrame();
  for (let i = 0; i <= 2000; i++) {
    const f = sampleTrack(track, i / 2000 * length, length, frame);
    for (const point of [f.point, f.point.clone().addScaledVector(f.up, 1.68)]) {
      for (const direction of [f.side, f.up]) {
        ray.set(point.clone().addScaledVector(direction, -1.5), direction); ray.far = 3;
        assert.equal(ray.intersectObject(logo, false).length, 0, 'rounded edges must leave room for the rider and cart');
      }
    }
  }
  disposeObject(logo);
});

test('seven stations follow travel order without moving platforms or overlapping', () => {
  const stops = planner.defaults();
  assert.equal(stops.length, 7);
  assert.deepEqual(stops.map(stop => stop.distance), [211, 343, 595, 727, 1027, 1243, 1487]);
  const markers = createRideMap(track).layout(stops.map(stop => stop.point)).stations;
  for (const [i, marker] of markers.entries()) for (const other of markers.slice(i + 1)) {
    // The 194px drawing uses a 240-unit viewBox; each checkpoint is 30px wide.
    assert.ok(Math.hypot(marker.x - other.x, marker.y - other.y) * 194 / 240 > 33);
  }
  const original = stops.map(stop => stop.distance);
  while (stops.length < 50) { const next = planner.next(stops); if (!next) break; stops.push(next); }
  assert.ok(stops.length > 6); assert.ok(stops.length < 50); assert.equal(planner.next(stops), null);
  assert.deepEqual(stops.slice(0, 7).map(stop => stop.distance), original);
  for (const [index, stop] of stops.entries()) {
    assert.ok(stop.bounds.min.z > 4.5 || stop.bounds.max.z < -4.5);
    assert.ok(BUILDING_BOUNDS.every(building => !building.intersectsBox(stop.bounds)));
    assert.ok(stops.every((other, j) => j === index || !other.bounds.intersectsBox(stop.bounds)));
    assert.ok(stops.every((other, j) => j === index || Math.abs(other.distance - stop.distance) > 48));
    assert.ok(track.getPointAt(stop.distance / length).distanceTo(stop.point) < 1e-6);
  }
});

test('scenic stops fill the loop deterministically without moving events or overlapping', () => {
  const defaults = planner.defaults(), anchors = [defaults[0], defaults[3], defaults[5]], combined = planner.fillWaypoints(anchors);
  assert.ok(combined.length >= 10 && combined.length <= 12);
  assert.ok(maxStopGap(combined, length) <= 150);
  assert.deepEqual(combined, planner.fillWaypoints(anchors));
  assert.deepEqual(combined.slice(0, 3), anchors);
  for (const [i, stop] of combined.entries()) for (const other of combined.slice(i + 1)) {
    const d = Math.abs(stop.distance - other.distance);
    assert.ok(Math.min(d, length - d) > 40); assert.ok(!stop.bounds.intersectsBox(other.bounds));
  }
  assert.ok(combined.every(stop => BUILDING_BOUNDS.every(b => !b.intersectsBox(stop.bounds))));
  let previous = length;
  for (const reserve of [550, 300, 200, 150, 100]) {
    const gap = maxStopGap(planner.fillWaypoints(anchors, { reserve }), length);
    assert.ok(gap <= previous); previous = gap;
  }
  const updated = [...anchors, planner.next(anchors)], replanned = planner.fillWaypoints(updated);
  assert.deepEqual(replanned.slice(0, 4), updated);
  assert.ok(replanned.every((s, i) => replanned.every((o, j) => i === j || !s.bounds.intersectsBox(o.bounds))));
});

test('global waypoint search avoids a greedy dead end, including non-neighbour conflicts', () => {
  const placement = (distance, x = distance) => ({ distance, radius: 1, name: '', point: new THREE.Vector3(x, 0, 0), bounds: new THREE.Box3(new THREE.Vector3(x, 0, 0), new THREE.Vector3(x + 1, 1, 1)) });
  const anchors = [placement(0)], candidates = [placement(40), placement(60), placement(80)];
  // Greedy takes 60, then neither remaining candidate clears 25 units.
  const result = fillWaypoints(anchors, candidates, 120, { reserve: 40, minSeparation: 25, maxStops: 3 });
  assert.equal(maxStopGap(result, 120), 40);
  assert.equal(result.length, 3);
  assert.ok(result.every((s, i) => result.every((o, j) => i === j || !s.bounds.intersectsBox(o.bounds))));
  const crossed = fillWaypoints(anchors, [placement(40), placement(80), placement(120, 40), placement(130), placement(160)], 200, { reserve: 60, minSeparation: 20, maxStops: 5 });
  assert.ok(maxStopGap(crossed, 200) <= 60);
  assert.ok(crossed.every((s, i) => crossed.every((o, j) => i === j || !s.bounds.intersectsBox(o.bounds))));
});

test('local chapters retain their stations and published additions preserve every existing position', () => {
  const event = { id: 'one', title: 'Opening', published: true };
  const anchors = planner.defaults();
  for (let count = 0; count <= workshops.length; count++) {
    const input = Array.from({ length: count }, (_, i) => ({ ...event, id: `event-${i}` }));
    const stations = createEventStations([...input, { ...event, id: 'draft', published: false }]);
    assert.equal(stations.length, workshops.length);
    assert.equal(stations.filter(station => station.event !== null).length, count);
    assert.deepEqual(stations.map(station => station.number), workshops.map((_, index) => String(index + 1).padStart(2, '0')));
    assert.ok(stations.every(station => station.name));
    const placements = planner.forEvents(stations.map(station => station.event));
    assert.equal(placements.length, workshops.length);
    assert.ok(placements.every(Boolean), 'every chapter has a safe platform');
    assert.deepEqual(placements.slice(0, anchors.length), anchors);
  }
  const initial = createEventStations([event]), occupied = planner.forEvents(initial.map(s => s.event));
  const next = planner.next(occupied), newEvent = { ...event, id: 'new', trackPosition: next.distance / length };
  const updated = createEventStations([event, newEvent]);
  assert.equal(updated.length, initial.length + 1); assert.deepEqual(updated.slice(0, initial.length), initial);
  const saved = planner.forEvents(updated.map(s => s.event));
  assert.equal(saved[initial.length].distance, next.distance);
  assert.deepEqual(saved.slice(0, initial.length).map(s => s.distance), occupied.map(s => s.distance));
});

test('retuning default anchors preserves an existing saved station in their new preferred position', () => {
  const saved = { id: 'saved-before-retuning', trackPosition: planner.defaults()[0].distance / length };
  const placements = planner.forEvents([...Array(7).fill(null), saved]);
  assert.equal(placements[7].distance / length, saved.trackPosition);
  for (const [i, stop] of placements.entries()) for (const other of placements.slice(i + 1)) {
    assert.ok(!stop.bounds.intersectsBox(other.bounds));
    const d = Math.abs(stop.distance - other.distance); assert.ok(Math.min(d, length - d) > 48);
  }
});

test('removing a station retains shared resources until the owning world is disposed', () => {
  const scene = new THREE.Scene(), station = new THREE.Group(), geometry = new THREE.BoxGeometry(), material = new THREE.MeshBasicMaterial();
  const signGeometry = new THREE.PlaneGeometry(), signMaterial = new THREE.MeshBasicMaterial();
  let geometries = 0, materials = 0, signs = 0;
  geometry.addEventListener('dispose', () => geometries++); material.addEventListener('dispose', () => materials++);
  signMaterial.addEventListener('dispose', () => signs++);
  scene.add(new THREE.Mesh(geometry, material), station);
  station.add(new THREE.Mesh(geometry, material), new THREE.Mesh(signGeometry, signMaterial));
  disposeObject(station, { geometries: new Set([geometry]), materials: new Set([material]) });
  assert.equal(geometries, 0); assert.equal(materials, 0); assert.equal(signs, 1); assert.equal(station.parent, null);
  disposeObject(scene); assert.equal(geometries, 1); assert.equal(materials, 1);
});

test('touch and constrained hardware recover detail without enabling the expensive depth pass', () => {
  for (const device of [{ coarse: true }, { coarse: true, cores: 0, memory: 0 }, { coarse: true, cores: 8, memory: 8 }, { coarse: false, cores: 4 }, { coarse: false, cores: 8, memory: 4 }]) {
    const budget = rideQuality(device), controller = createQualityController(budget.initial, budget.maximum);
    assert.equal(controller.level, 0);
    for (let i = 0; i < 2400; i++) controller.sample(1 / 60);
    assert.equal(controller.level, 1);
  }
  for (const device of [{ coarse: false }, { coarse: false, cores: 0, memory: 0 }, { coarse: false, cores: 8, memory: 8 }]) {
    assert.deepEqual(rideQuality(device), { initial: 1, maximum: 2 });
  }
});

test('adaptive quality reacts before 30fps, ignores suspension, and recovers without oscillation', () => {
  const quality = createQualityController(2);
  for (let i = 0; i < 240; i++) quality.sample(1 / 40);
  assert.equal(quality.level, 0);
  for (let i = 0; i < 100; i++) quality.sample(2);
  assert.equal(quality.level, 0);
  for (let i = 0; i < 1200; i++) quality.sample(1 / 60);
  assert.ok(quality.level >= 1);
  const verySlow = createQualityController(2);
  for (let i = 0; i < 4; i++) verySlow.sample(.2);
  assert.equal(verySlow.level, 0);
  const overloaded = createQualityController(2);
  overloaded.sample(.6); overloaded.sample(.6);
  assert.equal(overloaded.level, 1, 'long visible frames are overload, not a suspended tab');
  const mobile = createQualityController(0, 1);
  for (let i = 0; i < 2400; i++) mobile.sample(1 / 60);
  assert.equal(mobile.level, 1, 'mobile recovery keeps its effects budget');
  assert.ok(qualityPixelRatio(2, 3840, 2160, 3, false) ** 2 * 3840 * 2160 <= 2_200_001);
  assert.ok(qualityPixelRatio(0, 390, 844, 3, true) >= 1.25, 'phones retain sharp edges when effects are reduced');
  assert.ok(qualityPixelRatio(0, 1024, 1366, 3, true) >= 1, 'tablets retain at least CSS resolution within the pixel budget');
  assert.ok(qualityPixelRatio(2, 1024, 1366, 3, true) ** 2 * 1024 * 1366 <= 2_200_001);
  assert.equal(qualityPixelRatio(2, 390, 844, 1, true), 1, 'low-density screens are not supersampled');
  assert.equal(shouldShowJoystick(false, false, 390), false);
  assert.equal(shouldShowJoystick(true, false, 1280), false);
  assert.equal(shouldShowJoystick(true, true, 390), true);
  assert.equal(shouldShowJoystick(true, true, 1366), true);
  assert.equal(shouldShowJoystick(true, true, 1920), false);
});
