import test from 'node:test';
import assert from 'node:assert/strict';
import { Vec3 } from 'cannon-es';
import { createPageTurnSound } from '../src/lib/interaction-sounds.ts';
import { createTowerPhysics } from '../src/lib/people-tower-physics.ts';
import { towerSlots } from '../src/lib/people-tower-motion.ts';

test('continuous wheel/touch movement sounds once per leaf, including reverse travel', () => {
  const calls = [], update = createPageTurnSound(0, direction => calls.push(direction));
  for (let i = 0; i <= 500; i++) update(i / 200);
  assert.deepEqual(calls, [1, 1, 1]);
  for (let i = 499; i >= 0; i--) update(i / 200);
  assert.deepEqual(calls, [1, 1, 1, -1, -1, -1]);
  update(0); update(0);
  assert.equal(calls.length, 6, 'resting at a boundary stays silent');
});

test('tiny touch jitter, resize restoration, and clamped turns stay silent', () => {
  const calls = [], update = createPageTurnSound(3, direction => calls.push(direction));
  update(3); update(3.003); update(3.001); update(3.004); update(3);
  assert.equal(calls.length, 0);
  update(2.95); update(2.8);
  assert.deepEqual(calls, [-1]);
});

test('Jenga emits measured impacts and a placement only when the returning block lands', () => {
  const impacts = [], placements = [], slots = towerSlots(['a', 'b', 'c']);
  const physics = createTowerPhysics(slots, 2, { onImpact: speed => impacts.push(speed), onReturn: () => placements.push(true) });
  try {
    physics.grab(0, new Vec3(...slots[0].position));
    physics.release(new Vec3(3, 7, 2));
    for (let frame = 0; frame < 240; frame++) physics.step(1 / 60);
    assert.ok(impacts.length > 0);
    assert.ok(impacts.every(speed => Number.isFinite(speed) && speed > .6));
    // A story block is not a manually placed piece, so it returns to its slot.
    physics.remove(1); physics.bodies[1].interpolatedPosition.set(4, 2, 3); physics.returnBody(1);
    assert.equal(placements.length, 0);
    physics.step(1 / 60);
    assert.equal(placements.length, 0);
    for (let frame = 0; frame < 30; frame++) physics.step(1 / 60);
    assert.equal(placements.length, 1);
  } finally { physics.dispose(); }
});
