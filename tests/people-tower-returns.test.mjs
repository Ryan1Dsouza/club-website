import test from 'node:test';
import assert from 'node:assert/strict';
import { Body, Vec3 } from 'cannon-es';
import { towerSlots } from '../src/lib/people-tower-motion.ts';
import { createTowerPhysics } from '../src/lib/people-tower-physics.ts';

const fixtureSlots = () => towerSlots(Array.from({ length: 15 }, (_, index) => String(index)));

test('reversing into a banner keeps the untouched supporting tower asleep', () => {
  const slots = fixtureSlots(), physics = createTowerPhysics(slots);
  try {
    for (let index = 0; index < 7; index++) physics.remove(index);
    physics.beginStory(7);
    physics.placeStory(new Vec3(8, -4, 6), physics.bodies[7].quaternion, new Vec3(8, 5, .16), false);
    physics.remove(7);
    physics.returnBody(7);
    physics.beginStory(7);
    assert.equal(physics.step(1 / 30), false, 'a former banner pose must not wake its lower supports');
    for (let index = 8; index < slots.length; index++) {
      assert.equal(physics.bodies[index].sleepState, Body.SLEEPING);
      assert.deepEqual(physics.bodies[index].position.toArray(), [...slots[index].position]);
    }
  } finally { physics.dispose(); }
});

test('resuming forward during a middle-layer return lets the other planks finish landing', () => {
  const slots = fixtureSlots(), physics = createTowerPhysics(slots);
  try {
    for (let index = 0; index < 7; index++) physics.remove(index);
    physics.bodies[6].interpolatedPosition.set(6, 3, 5);
    physics.bodies[8].interpolatedPosition.set(-4, 1, 3);
    physics.beginStory(7);
    physics.placeStory(new Vec3(5, 2, 4), physics.bodies[7].quaternion, new Vec3(8, 5, .16), false);
    physics.returnLayersThrough(slots[7].layer);
    assert.equal(physics.isStory(7), false, 'reverse hands the profile plank back to the tower');
    physics.step(.1);
    const returning = physics.bodies[8], visible = returning.interpolatedPosition.clone();
    physics.cancelLayerReturns();
    assert.equal(physics.isFlying(8), true, 'a direction change does not abandon a return in midair');
    assert.ok(returning.interpolatedPosition.distanceTo(visible) < 1e-9, 'cancellation does not jump the visible pose');
    physics.remove(6);
    physics.beginStory(7);
    assert.ok(physics.bodies[7].position.distanceTo(new Vec3(...slots[7].position)) < 1e-9);

    for (let frame = 0; frame < 24; frame++) physics.step(1 / 60);
    assert.ok(returning.position.distanceTo(new Vec3(...slots[8].position)) < 1e-9);
    assert.equal(returning.type, Body.DYNAMIC);
    assert.equal(physics.isStory(7), true);
    assert.equal(physics.bodies[6].world, null);
  } finally { physics.dispose(); }
});

test('reverse rebuilds complete layers from the foundation up, including partial top layers', () => {
  for (const count of [1, 2, 4, 5, 15, 16]) {
    for (const detail of [0, 1, 2]) {
      const slots = towerSlots(Array.from({ length: count }, (_, index) => String(index)));
      const physics = createTowerPhysics(slots, detail);
      try {
        slots.forEach((_, index) => {
          physics.remove(index);
          physics.bodies[index].interpolatedPosition.set(6, 3, 5);
        });
        const layerCount = Math.ceil(count / 3);
        physics.returnLayersThrough(layerCount - 1);
        for (let layer = 0; layer < layerCount; layer++) {
          const indices = slots.flatMap((slot, index) => slot.layer === layer ? [index] : []);
          assert.equal(indices.length, Math.min(3, count - layer * 3));
          indices.forEach(index => {
            assert.equal(physics.bodies[index].world, physics.world, 'the whole layer becomes visible together');
            assert.equal(physics.isFlying(index), true);
            assert.equal(physics.bodies[index].collisionFilterMask, 0);
          });
          slots.forEach((slot, index) => {
            if (slot.layer > layer) assert.equal(physics.bodies[index].world, null, 'upper layers wait until their support has landed');
            if (slot.layer < layer) assert.ok(physics.bodies[index].position.distanceTo(new Vec3(...slot.position)) < 1e-9);
          });
          for (let frame = 0; frame < 21; frame++) physics.step(1 / 60);
          indices.forEach(index => assert.ok(physics.bodies[index].position.distanceTo(new Vec3(...slots[index].position)) < 1e-9));
        }
        assert.equal(physics.moving(), false);
        assert.equal(physics.world.time, 0, 'an idle rebuild needs no collision solver');
      } finally { physics.dispose(); }
    }
  }
});

test('a reverse pause keeps all three supports in place and forward play can take over', () => {
  const slots = fixtureSlots(), physics = createTowerPhysics(slots);
  try {
    slots.forEach((_, index) => { physics.remove(index); physics.bodies[index].interpolatedPosition.set(6, 3, 5); });
    physics.returnLayersThrough(0);
    for (let frame = 0; frame < 60; frame++) physics.step(1 / 60);
    assert.equal(physics.moving(), false);
    assert.equal(physics.bodies.filter(body => body.world).length, 3);
    physics.returnLayersThrough(0);
    assert.equal(physics.moving(), false, 'browsing another profile in the same layer does not extract a support');
    physics.returnLayersThrough(1);
    physics.step(.1);
    const index = slots.findIndex(slot => slot.layer === 1), body = physics.bodies[index];
    const visible = body.interpolatedPosition.clone();
    assert.equal(physics.grab(index, visible), true);
    assert.ok(body.position.distanceTo(visible) < 1e-9);
    assert.equal(body.type, Body.DYNAMIC);
    physics.release(); physics.reset();
    for (let frame = 0; frame < 24; frame++) physics.step(1 / 60);
    assert.equal(physics.moving(), false);
  } finally { physics.dispose(); }
});

test('every layer returns immediately from its visible pose without disappearing or colliding', () => {
  for (const detail of [0, 1, 2]) {
    for (const initiallyRemoved of [false, true]) {
      const slots = fixtureSlots(), physics = createTowerPhysics(slots, detail);
      try {
        if (initiallyRemoved) slots.forEach((_, index) => physics.remove(index));
        const origins = physics.bodies.map((body, index) => {
          // The last rendered pose can lag behind the solver's current pose.
          const target = new Vec3(...slots[index].position);
          body.position.set(target.x + 7, target.y + 3, target.z + 2);
          body.interpolatedPosition.set(target.x + 6, target.y + 2, target.z + 1);
          body.interpolatedQuaternion.setFromEuler(.3, slots[index].yaw + .4, .2);
          return { position: body.interpolatedPosition.clone(), quaternion: body.interpolatedQuaternion.clone() };
        });
        let removals = 0;
        physics.world.addEventListener('removeBody', () => { removals++; });
        for (let index = slots.length - 1; index >= 0; index--) physics.returnBody(index);

        physics.bodies.forEach((body, index) => {
          assert.equal(body.world, physics.world);
          assert.equal(physics.isPending(index), false);
          assert.equal(physics.isFlying(index), true);
          assert.equal(body.type, Body.KINEMATIC);
          assert.equal(body.collisionFilterMask, 0);
          assert.deepEqual(body.position.toArray(), origins[index].position.toArray());
          assert.deepEqual(body.interpolatedPosition.toArray(), origins[index].position.toArray());
          assert.deepEqual(body.quaternion.toArray(), origins[index].quaternion.toArray());
        });

        physics.step(1 / 60);
        physics.bodies.forEach((body, index) => {
          const target = new Vec3(...slots[index].position), start = origins[index].position;
          assert.ok(body.interpolatedPosition.distanceTo(start) > 0, 'all layers move on the first frame');
          assert.ok(body.interpolatedPosition.distanceTo(target) < start.distanceTo(target));
          assert.equal(body.world, physics.world);
          assert.equal(body.type, Body.KINEMATIC);
          assert.equal(body.collisionFilterMask, 0);
        });

        for (let frame = 0; frame < 24; frame++) physics.step(1 / 60);
        physics.bodies.forEach((body, index) => {
          assert.ok(body.interpolatedPosition.distanceTo(new Vec3(...slots[index].position)) < 1e-10);
          assert.equal(body.world, physics.world);
          assert.equal(body.type, Body.DYNAMIC);
          assert.equal(body.collisionFilterMask, -1);
          assert.equal(physics.isFlying(index), false);
        });
        assert.equal(removals, 0, 'returning never removes a visible block from the world');
        assert.equal(physics.world.time, 0, 'returns do not wake an idle solver');
        assert.equal(physics.moving(), false);
      } finally { physics.dispose(); }
    }
  }
});

test('overlapping dynamic blocks have bounded velocity after every physics substep', () => {
  let peakSolverSpeed = 0;
  for (const detail of [0, 1, 2]) {
    const physics = createTowerPhysics(fixtureSlots(), detail);
    try {
      // Reproduce multiple blocks occupying the same space when collisions resume.
      physics.bodies.forEach(body => {
        body.position.set(0, 1, 0);
        body.aabbNeedsUpdate = true;
        body.wakeUp();
      });
      physics.world.broadphase.dirty = true;
      const worldStep = physics.world.step.bind(physics.world);
      let steps = 0, solverVelocities;
      physics.world.step = (...args) => {
        physics.bodies.forEach(body => assert.ok(body.velocity.length() <= 30 + 1e-9, 'the next substep starts with bounded velocity'));
        worldStep(...args);
        solverVelocities = physics.bodies.map(body => body.velocity.clone());
        peakSolverSpeed = Math.max(peakSolverSpeed, ...solverVelocities.map(velocity => velocity.length()));
        steps++;
      };
      physics.step(1 / 30);
      assert.ok(steps >= 2, 'exercise multiple substeps within one rendered frame');
      physics.bodies.forEach((body, index) => {
        const solverVelocity = solverVelocities[index], speed = solverVelocity.length();
        assert.ok(Math.abs(body.velocity.length() - Math.min(speed, 30)) < 1e-9);
        if (speed > 0) assert.ok(body.velocity.unit().distanceTo(solverVelocity.unit()) < 1e-9, 'capping preserves direction');
        assert.ok(body.interpolatedPosition.toArray().every(Number.isFinite));
      });
    } finally { physics.dispose(); }
  }
  assert.ok(peakSolverSpeed > 30, 'real collision impulses exercise the velocity cap');
});
