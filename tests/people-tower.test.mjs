import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceTowerScroll, towerExit, towerSlots, towerFrame, memberProgress, sortTowerMembers, BLOCK_SIZE, TOWER_INTRO, TOWER_OUTRO } from '../src/lib/people-tower-motion.ts';
import { towerPixelRatio, towerQuality } from '../src/lib/people-tower-quality.ts';
import { createTowerPhysics } from '../src/lib/people-tower-physics.ts';
import { AABB, Body, Quaternion, Vec3 } from 'cannon-es';

test('scroll smoothing is frame-rate independent, settles exactly and handles noisy reversals without overshoot', () => {
  const samples = [10, 15, 30, 60, 90, 120, 144].map(fps => {
    const scroll = { value: 0, velocity: 0 };
    for (let i = 0; i < fps; i++) advanceTowerScroll(scroll, .8, 1 / fps);
    return scroll.value;
  });
  samples.forEach(value => assert.ok(Math.abs(value - samples[0]) < 1e-12));
  const scroll = { value: 0, velocity: 0 };
  for (const target of [.2, .21, .19, .5, .48, 1, 0, .6]) {
    for (const dt of [.008, .033, .012, .045]) {
      const before = scroll.value;
      advanceTowerScroll(scroll, target, dt);
      assert.ok(scroll.value >= Math.min(before, target) && scroll.value <= Math.max(before, target));
    }
  }
  for (let i = 0; i < 240; i++) advanceTowerScroll(scroll, .6, 1 / 60);
  assert.deepEqual(scroll, { value: .6, velocity: 0 });
  scroll.velocity = .1; advanceTowerScroll(scroll, .6, 1 / 60);
  assert.deepEqual(scroll, { value: .6, velocity: 0 }, 'a target at the current position stops residual velocity');
  const paused = { value: 0, velocity: 0 }, normal = { ...paused };
  advanceTowerScroll(paused, 1, 30); advanceTowerScroll(normal, 1, .25);
  assert.deepEqual(paused, normal, 'a background pause does not jump through the story');
});

test('exits shrink and fade continuously to zero before the shared profile changes members', () => {
  let previous = towerExit(.76);
  assert.equal(previous.scale, 1); assert.equal(previous.opacity, 1);
  for (const local of [.8, .85, .9, .95, .975, .98, .999, 1]) {
    const exit = towerExit(local);
    assert.ok(exit.scale >= 0 && exit.scale <= previous.scale);
    assert.equal(exit.opacity, exit.scale);
    previous = exit;
  }
  assert.equal(previous.scale, 0); assert.equal(towerExit(.98).opacity, 0);
  assert.ok(towerExit(.979).scale < .00001, 'visibility changes only after the projected size is negligible');
  assert.equal(towerExit(.25).opacity, 0);
  assert.equal(towerExit(.59).opacity, 1, 'the member picker still lands in a fully readable hold');
});

test('render budgets cover desktop, touch landscape, missing hardware hints and low-end PCs', () => {
  const desktop = towerQuality(1440, 1000, 3, { coarsePointer: false, cores: 12, memory: 8 });
  assert.equal(desktop.simplified, false);
  assert.ok(desktop.pixelRatio >= 1.5);
  assert.ok(1440 * 1000 * desktop.pixelRatio ** 2 <= 3_600_001);
  for (const [width, height] of [[390, 844], [844, 390]]) {
    const mobile = towerQuality(width, height, 3, { coarsePointer: true });
    assert.equal(mobile.simplified, true); assert.ok(mobile.pixelRatio >= 1.5 && mobile.pixelRatio <= 1.75);
    assert.ok(width * height * mobile.pixelRatio ** 2 <= 1_400_001);
  }
  assert.equal(towerQuality(390, 844, 3, { coarsePointer: false }).simplified, true);
  for (const device of [{ cores: 2 }, { memory: 2 }]) {
    const low = towerQuality(1920, 1080, 2, { coarsePointer: false, ...device });
    assert.equal(low.simplified, true); assert.ok(low.pixelRatio >= 1 && low.pixelRatio <= 1.25);
    assert.ok(1920 * 1080 * low.pixelRatio ** 2 <= 2_100_001);
  }
});

test('adaptive quality preserves native detail and respects large-screen pixel limits', () => {
  for (const base of [.6, 1, 1.25, 1.75, 2]) {
    for (const scale of [.6, .75, .9, 1]) {
      assert.ok(towerPixelRatio(base, scale) >= Math.min(1, base));
      assert.ok(towerPixelRatio(base, scale) <= base);
    }
  }
  const large = towerQuality(3840, 2160, 2, { coarsePointer: false, cores: 12, memory: 8 });
  assert.ok(3840 * 2160 * large.pixelRatio ** 2 <= 3_600_001);
});

test('every member occupies a unique block with repeatable, varied extraction paths', () => {
  const ids = Array.from({ length: 15 }, (_, i) => `member-${i}`);
  const slots = towerSlots(ids);
  assert.deepEqual(slots, towerSlots(ids));
  assert.equal(new Set(slots.map(slot => slot.position.join(','))).size, ids.length);
  assert.equal(new Set(slots.map(slot => slot.layer)).size, 5);
  assert.equal(new Set(slots.map(slot => slot.direction)).size, 2);
  assert.equal(new Set(slots.map(slot => slot.yaw)).size, 2);
  assert.ok(slots.some((slot, i) => slot.rank !== i));
});

test('new additions form full foundation layers below established leaders and partial top layers stay centered', () => {
  const members = [
    { id: 'member', role: 'Member' }, { id: 'president', role: 'President' },
    { id: 'new-officer', role: 'President', createdAt: '2026-09-30T10:00:00Z' },
    { id: 'older', role: 'Member', createdAt: '2026-09-29T10:00:00Z' },
    { id: 'newest', role: 'Member', createdAt: '2026-09-30T11:00:00Z' },
  ];
  const ordered = sortTowerMembers(members), slots = towerSlots(ordered.map(member => member.id));
  assert.deepEqual(ordered.map(member => member.id), ['president', 'member', 'older', 'new-officer', 'newest']);
  assert.equal(members[0].id, 'member', 'sorting does not mutate API data');
  assert.deepEqual(slots.map(slot => slot.layer), [1, 1, 0, 0, 0]);
  for (const count of [1, 2, 4, 5, 16, 40]) {
    const layout = towerSlots(Array.from({ length: count }, (_, i) => String(i)));
    const top = layout.filter(slot => slot.layer === Math.ceil(count / 3) - 1);
    assert.ok(Math.abs(top.reduce((sum, slot) => sum + slot.position[0] + slot.position[2], 0)) < 1e-9);
    assert.equal(layout.at(-1).layer, 0);
  }
});

function simulate(physics, seconds, dt = 1 / 60) {
  for (let i = 0; i < Math.round(seconds / dt); i++) physics.step(dt);
}
const fixtureSlots = () => towerSlots(Array.from({ length: 15 }, (_, i) => `member-${i}`));

test('mass, contact and sleep keep an untouched tower stable; removing its foundation drops every supported layer', () => {
  const slots = fixtureSlots(), physics = createTowerPhysics(slots);
  try {
    simulate(physics, 5);
    assert.equal(physics.moving(), false, 'settled tower sleeps');
    physics.bodies.forEach((body, index) => {
      assert.ok(body.mass > 0);
      assert.ok(Math.abs(body.position.y - slots[index].position[1]) < .03);
    });
    const before = physics.bodies.slice(0, 12).map(body => body.position.y);
    [12, 13, 14].forEach(index => physics.remove(index)); simulate(physics, 4);
    physics.bodies.slice(0, 12).forEach((body, index) => {
      assert.ok(before[index] - body.position.y > BLOCK_SIZE[1] * .9, 'unsupported block falls');
      assert.ok(body.position.y > physics.floorY, 'plinth catches blocks');
    });
  } finally { physics.dispose(); }
});

test('click pulls and pointer constraints move dynamic blocks, disturb neighbours, release, and rebuild cleanly', () => {
  const slots = fixtureSlots(), physics = createTowerPhysics(slots);
  try {
    simulate(physics, 3); physics.pull(14); simulate(physics, 4);
    const extracted = physics.bodies[14];
    assert.ok(Math.hypot(extracted.position.x, extracted.position.z) > 3.5);
    assert.ok(physics.bodies.slice(0, 12).some((body, index) => Math.abs(body.position.y - slots[index].position[1]) > .1));
    assert.equal(physics.world.constraints.length, 0);
    physics.reset(); simulate(physics, 3);
    const body = physics.bodies[12];
    assert.ok(physics.grab(12, body.position));
    physics.move({ x: 6, y: body.position.y, z: body.position.z }); simulate(physics, 1.5);
    assert.ok(body.position.x > 4); assert.ok(body.mass > 0);
    physics.release(); assert.equal(physics.world.constraints.length, 0);
    physics.grab(12, body.position);
    physics.move({ x: 6, y: 2, z: 0 }); simulate(physics, 4);
    const heldY = body.position.y; physics.release(); simulate(physics, 1);
    assert.ok(body.position.y < heldY - 1, 'releasing a stationary suspended block wakes gravity');
    physics.reset(4); assert.equal(physics.world.bodies.length, slots.length - 4 + 2);
    physics.reset();
    physics.bodies.forEach((item, index) => assert.deepEqual(item.position.toArray(), [...slots[index].position]));
    assert.equal(physics.world.bodies.length, slots.length + 2);
  } finally { physics.dispose(); physics.dispose(); }
  assert.equal(physics.world.bodies.length, 0); assert.equal(physics.world.constraints.length, 0);
});

test('scroll reveals take over the visible pose of flung blocks, including between physics steps', () => {
  for (const simplified of [false, true]) {
    const slots = fixtureSlots(), physics = createTowerPhysics(slots, simplified);
    try {
      physics.pull(0); simulate(physics, 2, 1 / 144);
      const body = physics.bodies[0];
      assert.ok(body.position.distanceTo(new Vec3(...slots[0].position)) > 2, 'the block has left its tower slot');
      const position = body.interpolatedPosition.clone(), rotation = body.interpolatedQuaternion.clone();
      physics.beginStory(0);
      assert.deepEqual(body.position.toArray(), position.toArray());
      assert.deepEqual(body.quaternion.toArray(), rotation.toArray());
      assert.equal(physics.world.constraints.length, 0);
      assert.equal(body.type, Body.KINEMATIC);
      assert.equal(body.velocity.length() + body.angularVelocity.length(), 0);
      physics.step(1 / 60);
      assert.deepEqual(body.interpolatedPosition.toArray(), position.toArray());
      assert.deepEqual(body.interpolatedQuaternion.toArray(), rotation.toArray());
    } finally { physics.dispose(); }
  }
});

test('revisiting a flung member after the next reveal preserves the original flight path', () => {
  const slots = fixtureSlots(), physics = createTowerPhysics(slots);
  try {
    physics.pull(0); simulate(physics, 2); physics.beginStory(0);
    const body = physics.bodies[0], position = body.position.clone(), rotation = body.quaternion.clone();
    assert.ok(position.distanceTo(new Vec3(...slots[0].position)) > 2);
    physics.placeStory(new Vec3(7, 4, 8), new Quaternion(), new Vec3(5, 3, .16), false);
    physics.remove(0); physics.beginStory(1);
    physics.returnBody(0); physics.beginStory(0);
    assert.deepEqual(body.position.toArray(), position.toArray());
    assert.deepEqual(body.quaternion.toArray(), rotation.toArray());
    simulate(physics, 2);
    assert.deepEqual(body.interpolatedPosition.toArray(), position.toArray(), 'a cancelled return cannot overwrite the reveal');
    physics.reset(); simulate(physics, .5);
    physics.remove(0); physics.returnBody(0); physics.beginStory(0);
    assert.deepEqual(body.position.toArray(), [...slots[0].position], 'rebuilding clears the old flung origin');
  } finally { physics.dispose(); }
});

test('a reveal can take over an unfinished rebuild without its old animation moving the source', () => {
  const physics = createTowerPhysics(fixtureSlots());
  try {
    physics.pull(0); simulate(physics, 2); physics.reset(); physics.step(.1);
    const body = physics.bodies[0], position = body.interpolatedPosition.clone(), rotation = body.interpolatedQuaternion.clone();
    assert.ok(body.position.distanceTo(position) > .1, 'the rebuild is visibly between poses');
    physics.beginStory(0); simulate(physics, .5);
    assert.deepEqual(body.interpolatedPosition.toArray(), position.toArray());
    assert.deepEqual(body.interpolatedQuaternion.toArray(), rotation.toArray());
  } finally { physics.dispose(); }
});

test('fixed steps preserve physics across frame rates and cap work after long pauses', () => {
  const slow = createTowerPhysics(fixtureSlots()), fast = createTowerPhysics(fixtureSlots());
  try {
    simulate(slow, 2, 1 / 30); simulate(fast, 2, 1 / 120);
    slow.bodies.forEach((body, index) => assert.ok(body.position.distanceTo(fast.bodies[index].position) < .001));
    slow.grab(0, slow.bodies[0].position);
    const time = slow.world.time; slow.step(30);
    assert.ok(slow.world.time - time <= .051, 'returning from background cannot cause an unbounded catch-up');
  } finally { slow.dispose(); fast.dispose(); }
});

test('scrolling retains a correctly sized collider through rotation, unfolding, floor contact and reverse seeks', () => {
  const physics = createTowerPhysics(fixtureSlots());
  const quaternion = new Quaternion(), size = new Vec3(...BLOCK_SIZE);
  try {
    physics.beginStory(0);
    const body = physics.bodies[0];
    assert.equal(body.world, physics.world); assert.equal(body.type, Body.KINEMATIC);
    const poses = [
      [0, physics.floorY - 5, 0, .7, 1.1, .9, 3.18, .71, 1.02],
      [8, physics.floorY - 5, 8, 1, .3, .4, 5, 3, .16],
      [0, 0, 0, .4, 1.2, .6, 5, 3, .16],
      [0, 0, 0, 0, 0, 0, 3.18, .71, 1.02],
    ];
    for (const pose of [...poses, ...poses.toReversed()]) {
      const position = new Vec3(...pose.slice(0, 3));
      quaternion.setFromEuler(...pose.slice(3, 6)); size.set(...pose.slice(6));
      physics.placeStory(position, quaternion, size); body.updateAABB();
      assert.ok(body.aabb.lowerBound.y >= physics.floorY - .28);
      assert.equal(position.y, body.position.y, 'rendered pose uses the resolved collision position');
      for (const other of physics.bodies.slice(1)) {
        other.updateAABB();
        const a = body.aabb, b = other.aabb;
        const depths = ['x', 'y', 'z'].map(axis => Math.min(a.upperBound[axis], b.upperBound[axis]) - Math.max(a.lowerBound[axis], b.lowerBound[axis]));
        assert.ok(Math.min(...depths) < .0011, 'animated collider never overlaps another block');
        assert.deepEqual(other.shapes[0].halfExtents.toArray(), BLOCK_SIZE.map(value => value / 2), 'resizing only affects the active collider');
      }
    }
    physics.placeStory(body.position.clone(), quaternion, new Vec3());
    assert.equal(body.collisionFilterMask, 0, 'a vanished card has no invisible contacts');
    physics.reset();
    physics.bodies.forEach(body => {
      assert.equal(body.type, Body.DYNAMIC); assert.ok(body.mass > 0);
      assert.deepEqual(body.shapes[0].halfExtents.toArray(), BLOCK_SIZE.map(value => value / 2));
    });
  } finally { physics.dispose(); }
});

test('scrolling through a resting tower leaves the solver asleep and rebuilds partial stacks without jitter', () => {
  const physics = createTowerPhysics(fixtureSlots());
  try {
    for (let index = 0; index < physics.bodies.length; index++) {
      physics.beginStory(index);
      const body = physics.bodies[index], position = body.position.clone();
      position.x += 5;
      physics.placeStory(position, body.quaternion, new Vec3(...BLOCK_SIZE));
      assert.equal(physics.step(1 / 30), false);
      physics.remove(index);
    }
    assert.equal(physics.world.time, 0, 'the scroll story needs no rigid-body solver steps');
    physics.reset(7); assert.equal(physics.moving(), false);
    physics.bodies.slice(7).forEach(body => {
      assert.deepEqual(body.interpolatedPosition.toArray(), body.position.toArray());
      assert.deepEqual(body.interpolatedQuaternion.toArray(), body.quaternion.toArray());
    });
  } finally { physics.dispose(); }
});

test('scroll collisions also protect the interpolated poses of a disturbed stack', () => {
  const physics = createTowerPhysics(fixtureSlots()), rendered = new AABB();
  try {
    [12, 13, 14].forEach(index => physics.remove(index));
    simulate(physics, .2); physics.beginStory(0);
    const active = physics.bodies[0];
    for (let frame = 0; frame < 90; frame++) {
      physics.step(1 / 144);
      physics.placeStory(new Vec3(0, physics.floorY, 0), new Quaternion(), new Vec3(...BLOCK_SIZE));
      active.updateAABB();
      for (const other of physics.bodies.slice(1, 12)) {
        other.shapes[0].calculateWorldAABB(other.interpolatedPosition, other.interpolatedQuaternion, rendered.lowerBound, rendered.upperBound);
        const a = active.aabb;
        const depths = ['x', 'y', 'z'].map(axis => Math.min(a.upperBound[axis], rendered.upperBound[axis]) - Math.max(a.lowerBound[axis], rendered.lowerBound[axis]));
        assert.ok(Math.min(...depths) < .0011);
      }
    }
  } finally { physics.dispose(); }
});

test('high-refresh frames interpolate moving bodies between bounded fixed steps', () => {
  const physics = createTowerPhysics(fixtureSlots());
  try {
    physics.grab(0, physics.bodies[0].position);
    physics.move({ x: 6, y: 4, z: 0 });
    for (let i = 0; i < 61; i++) physics.step(1 / 144);
    const body = physics.bodies[0];
    const before = body.interpolatedPosition.clone(), time = physics.world.time;
    physics.step(1 / 1000);
    assert.equal(physics.world.time, time);
    assert.ok(body.interpolatedPosition.distanceTo(before) > 0, 'motion continues on a frame with no physics step');
    assert.ok(body.interpolatedPosition.distanceTo(body.position) <= body.previousPosition.distanceTo(body.position) + 1e-9);
  } finally { physics.dispose(); }
});

test('forward and reverse seeking visits every member and handles empty and changing team sizes', () => {
  for (const count of [0, 1, 2, 15, 40]) {
    assert.equal(towerSlots(Array.from({ length: count }, (_, i) => String(i))).length, count);
    assert.equal(towerFrame(0, count).index, -1);
    assert.equal(towerFrame(1, count).index, -1);
    assert.equal(towerFrame(1, count).completed, count);
    assert.ok(Math.abs(towerFrame(1, count).outro - 1) < 1e-12);
    for (let index = count - 1; index >= 0; index--) {
      const at = towerFrame(memberProgress(index, count), count);
      assert.equal(at.index, index);
      assert.ok(at.local > .43 && at.local < .76, 'jump lands in the readable hold');
      const duration = TOWER_INTRO + count + TOWER_OUTRO;
      const start = (TOWER_INTRO + index) / duration;
      assert.equal(towerFrame(start + 1e-7, count).completed, index);
      assert.equal(towerFrame(start - 1e-7, count).completed, Math.max(0, index - 1));
    }
  }
});
