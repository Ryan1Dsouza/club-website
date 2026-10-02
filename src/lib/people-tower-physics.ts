import { AABB, Body, Box, ContactMaterial, Cylinder, GSSolver, Material, Plane, PointToPointConstraint, SAPBroadphase, Vec3, World } from 'cannon-es';
import { BLOCK_SIZE, LAYER_HEIGHT, towerSlots } from './people-tower-motion.ts';

export const PHYSICS_STEP = 1 / 120;
type Point = { x: number; y: number; z: number };
type Rotation = Point & { w: number };
type Slots = ReturnType<typeof towerSlots>;

/** Fixed-step rigid bodies for play, with one collidable kinematic story block.
 * Scroll poses resolve contacts before rendering, including large/reverse seeks. */
export function createTowerPhysics(slots: Slots) {
  const floorY = -(Math.ceil(slots.length / 3) - 1) * LAYER_HEIGHT / 2 - BLOCK_SIZE[1] / 2;
  const world = new World({ gravity: new Vec3(0, -9.82, 0), allowSleep: true });
  world.broadphase = new SAPBroadphase(world);
  const solver = world.solver as GSSolver;
  solver.iterations = 24; solver.tolerance = 1e-6;
  const wood = new Material('tower-block'), stone = new Material('tower-foundation');
  const contact = { friction: .38, restitution: 0, contactEquationStiffness: 1e8, contactEquationRelaxation: 4 };
  world.addContactMaterial(new ContactMaterial(wood, wood, contact));
  world.addContactMaterial(new ContactMaterial(wood, stone, { ...contact, friction: .55 }));
  const floor = new Body({ mass: 0, material: stone, shape: new Plane(), position: new Vec3(0, floorY - .28, 0) });
  floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0); world.addBody(floor);
  const plinth = new Body({ mass: 0, material: stone, shape: new Cylinder(2.6, 2.75, .28, 24), position: new Vec3(0, floorY - .14, 0) });
  world.addBody(plinth);
  const shape = new Box(new Vec3(BLOCK_SIZE[0] / 2, BLOCK_SIZE[1] / 2, BLOCK_SIZE[2] / 2));
  const bodies = slots.map(slot => {
    const body = new Body({ mass: .36, material: wood, shape, position: new Vec3(...slot.position),
      linearDamping: .08, angularDamping: .18, sleepSpeedLimit: .07, sleepTimeLimit: .8 });
    body.quaternion.setFromEuler(0, slot.yaw, 0);
    body.previousQuaternion.copy(body.quaternion); body.interpolatedQuaternion.copy(body.quaternion); world.addBody(body);
    // The authored stack is already at rest. Wake it only when support changes
    // or a visitor interacts, avoiding hundreds of invisible startup steps.
    body.sleep(); return body;
  });
  const anchor = new Body({ type: Body.KINEMATIC, collisionFilterGroup: 0, collisionFilterMask: 0 });
  const storyShape = new Box(new Vec3(...BLOCK_SIZE).scale(.5));
  const contactBounds = bodies.map(() => new AABB());
  const target = new Vec3(), pivot = new Vec3(), velocity = new Vec3(), pullStart = new Vec3(), pullEnd = new Vec3();
  let joint: PointToPointConstraint | undefined, held = -1, story = -1, pullTime = -1, accumulator = 0, disposed = false;

  const wake = () => bodies.forEach(body => { if (body.world) body.wakeUp(); });
  // Story order removes the top first. Losing a top block does not require
  // simulating the entire resting stack; a removed foundation still wakes it.
  const wakeSupported = (support: Body) => bodies.forEach(body => {
    if (body.world && body.type === Body.DYNAMIC && body.position.y > support.position.y + .01) body.wakeUp();
  });
  function release() {
    // A plank held still in the air can sleep. Removing its constraint must
    // wake it again so gravity takes over immediately after pointer release.
    if (held >= 0) bodies[held].wakeUp();
    if (joint) world.removeConstraint(joint);
    if (anchor.world) world.removeBody(anchor);
    joint = undefined; held = -1; pullTime = -1; anchor.velocity.setZero();
  }
  function grab(index: number, point: Point) {
    release();
    const body = bodies[index];
    if (!body?.world) return false;
    held = index; anchor.position.set(point.x, point.y, point.z); target.copy(anchor.position);
    body.pointToLocalFrame(anchor.position, pivot);
    world.addBody(anchor);
    joint = new PointToPointConstraint(body, pivot, anchor, new Vec3(), 100);
    joint.collideConnected = false; world.addConstraint(joint); wake(); return true;
  }
  function move(point: Point) {
    if (!joint) return;
    target.set(Math.max(-10, Math.min(10, point.x)), Math.max(floorY + .1, Math.min(14, point.y)), Math.max(-10, Math.min(10, point.z)));
  }
  function pull(index: number) {
    const body = bodies[index];
    if (!body?.world || !grab(index, body.position)) return;
    pullStart.copy(body.position);
    body.quaternion.vmult(new Vec3(slots[index].direction * 4.5, 0, 0), pullEnd);
    pullEnd.vadd(pullStart, pullEnd); pullTime = 0;
  }
  function remove(index: number) {
    if (held === index) release();
    const wasStory = story === index;
    if (wasStory) story = -1;
    const body = bodies[index];
    if (body?.world) { if (!wasStory) wakeSupported(body); world.removeBody(body); }
  }
  function beginStory(index: number) {
    release();
    const body = bodies[index];
    if (!body?.world) return;
    story = index; wakeSupported(body);
    storyShape.halfExtents.set(BLOCK_SIZE[0] / 2, BLOCK_SIZE[1] / 2, BLOCK_SIZE[2] / 2);
    storyShape.updateConvexPolyhedronRepresentation(); storyShape.updateBoundingSphereRadius();
    body.type = Body.KINEMATIC; body.mass = 0;
    body.removeShape(shape); body.addShape(storyShape); body.sleep();
  }
  function placeStory(position: Point, quaternion: Rotation, size: Point, isFlying = true) {
    const body = bodies[story];
    if (!body?.world) return;
    const half = storyShape.halfExtents;
    const x = Math.max(.00001, size.x / 2), y = Math.max(.00001, size.y / 2), z = Math.max(.00001, size.z / 2);
    if (half.x !== x || half.y !== y || half.z !== z) {
      half.set(x, y, z);
      // Box shapes only need their bounding sphere updated, NOT the expensive
      // convex polyhedron rebuild which was causing lag spikes every frame
      // during the scale-up transition.
      storyShape.updateBoundingSphereRadius(); body.updateBoundingRadius();
    }
    body.collisionFilterMask = size.x > 0 ? -1 : 0;
    body.position.set(position.x, position.y, position.z);
    body.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w); body.updateAABB();
    const bounds = body.aabb, margin = .001;
    // Only run the collision sweep during the actual flight phase (isFlying).
    // Once the block is settling into the UI panel position it's far from the
    // tower and doesn't need expensive per-body AABB checks.
    if (isFlying) {
      const overlapsXZ = (other: Body['aabb']) => bounds.lowerBound.x < other.upperBound.x - margin
        && bounds.upperBound.x > other.lowerBound.x + margin && bounds.lowerBound.z < other.upperBound.z - margin
        && bounds.upperBound.z > other.lowerBound.z + margin;
      if (plinth.aabbNeedsUpdate) plinth.updateAABB();
      bodies.forEach((other, index) => {
        if (other === body || !other.world) return;
        if (other.aabbNeedsUpdate) other.updateAABB();
        const contact = contactBounds[index];
        contact.copy(other.aabb);
        if (other.sleepState !== Body.SLEEPING) {
          other.shapes[0].calculateWorldAABB(other.interpolatedPosition, other.interpolatedQuaternion, contact.lowerBound, contact.upperBound);
          contact.extend(other.aabb);
        }
      });
      let lift = Math.max(0, (overlapsXZ(plinth.aabb) ? floorY : floorY - .28) + margin - bounds.lowerBound.y);
      for (let pass = 0; pass < bodies.length; pass++) {
        const before = lift;
        for (let index = 0; index < bodies.length; index++) {
          const other = bodies[index], contact = contactBounds[index];
          if (other === body || !other.world || !other.collisionFilterMask) continue;
          if (overlapsXZ(contact) && bounds.lowerBound.y + lift < contact.upperBound.y - margin
            && bounds.upperBound.y + lift > contact.lowerBound.y + margin) {
            lift = contact.upperBound.y + margin - bounds.lowerBound.y;
          }
        }
        if (before === lift) break;
      }
      body.position.y += lift;
    }
    body.previousPosition.copy(body.position); body.interpolatedPosition.copy(body.position);
    body.previousQuaternion.copy(body.quaternion); body.interpolatedQuaternion.copy(body.quaternion);
    body.aabbNeedsUpdate = true; world.broadphase.dirty = true;
  }
  function reset(completed = 0) {
    release(); story = -1; accumulator = 0;
    bodies.forEach((body, index) => {
      const slot = slots[index];
      const oldPos = body.interpolatedPosition.clone();
      const oldQuat = body.interpolatedQuaternion.clone();
      // Only transition if it was actively offset from the target grid slot
      const dist = oldPos.distanceTo(new Vec3(...slot.position));
      const needsTransition = body.world && dist > 0.01;

      body.type = Body.DYNAMIC; body.mass = .36; body.collisionFilterMask = -1;
      if (body.shapes[0] !== shape) { body.removeShape(storyShape); body.addShape(shape); }
      body.position.set(...slot.position); body.quaternion.setFromEuler(0, slot.yaw, 0);
      body.updateMassProperties();
      body.previousPosition.copy(body.position); body.interpolatedPosition.copy(body.position);
      body.previousQuaternion.copy(body.quaternion); body.interpolatedQuaternion.copy(body.quaternion);
      body.velocity.setZero(); body.angularVelocity.setZero(); body.force.setZero(); body.torque.setZero();
      body.aabbNeedsUpdate = true;
      if (index < completed) { if (body.world) world.removeBody(body); }
      else { if (!body.world) world.addBody(body); body.sleep(); }

      if (needsTransition) {
        (body as any).transition = { time: 0, fromPos: oldPos, fromQuat: oldQuat };
      } else {
        (body as any).transition = null;
      }
    });
    world.broadphase.dirty = true;
  }
  /** Return a single body to its tower slot with a smooth transition. */
  function returnBody(index: number) {
    const body = bodies[index];
    if (!body) return;
    const slot = slots[index];
    const oldPos = body.interpolatedPosition.clone();
    const oldQuat = body.interpolatedQuaternion.clone();

    if (story === index) story = -1;
    body.type = Body.DYNAMIC; body.mass = .36; body.collisionFilterMask = -1;
    if (body.shapes[0] !== shape) { body.removeShape(storyShape); body.addShape(shape); }
    body.position.set(...slot.position); body.quaternion.setFromEuler(0, slot.yaw, 0);
    body.updateMassProperties();
    body.previousPosition.copy(body.position); body.interpolatedPosition.copy(body.position);
    body.previousQuaternion.copy(body.quaternion); body.interpolatedQuaternion.copy(body.quaternion);
    body.velocity.setZero(); body.angularVelocity.setZero(); body.force.setZero(); body.torque.setZero();
    body.aabbNeedsUpdate = true;
    if (!body.world) world.addBody(body);
    body.sleep();

    const dist = oldPos.distanceTo(new Vec3(...slot.position));
    if (dist > 0.01) {
      (body as any).transition = { time: 0, fromPos: oldPos, fromQuat: oldQuat };
    } else {
      (body as any).transition = null;
    }
    world.broadphase.dirty = true;
  }
  const moving = () => held >= 0 || bodies.some(body => (body.world && body.type === Body.DYNAMIC && body.sleepState !== Body.SLEEPING) || (body as any).transition);
  function step(delta: number) {
    if (disposed || !moving()) return false;
    accumulator += Math.min(.05, Math.max(0, delta));
    let changed = false;
    while (accumulator >= PHYSICS_STEP) {
      if (joint) {
        if (pullTime >= 0) {
          pullTime += PHYSICS_STEP;
          pullStart.lerp(pullEnd, Math.min(1, pullTime / .7), target);
        }
        target.vsub(anchor.position, velocity); velocity.scale(18, velocity);
        const speed = velocity.length(); if (speed > 7) velocity.scale(7 / speed, velocity);
        anchor.velocity.copy(velocity);
      }
      world.step(PHYSICS_STEP); accumulator -= PHYSICS_STEP; changed = true;
      if (pullTime >= 1) release();
    }
    // Interpolate fixed steps for 60/90/120/144 Hz displays. Sleeping and story
    // bodies use their exact pose so the scene can stop requesting frames.
    const alpha = accumulator / PHYSICS_STEP;
    bodies.forEach(body => {
      if (body.type === Body.DYNAMIC && body.sleepState !== Body.SLEEPING) {
        body.previousPosition.lerp(body.position, alpha, body.interpolatedPosition);
        body.previousQuaternion.slerp(body.quaternion, alpha, body.interpolatedQuaternion);
        (body as any).transition = null;
      } else {
        body.interpolatedPosition.copy(body.position); body.interpolatedQuaternion.copy(body.quaternion);
        if ((body as any).transition) {
          const t = (body as any).transition;
          t.time += delta;
          const progress = Math.min(1, t.time / 0.25); // 250ms smooth transition
          const ease = progress * (2 - progress); // simple ease-out
          t.fromPos.lerp(body.position, ease, body.interpolatedPosition);
          t.fromQuat.slerp(body.quaternion, ease, body.interpolatedQuaternion);
          if (progress >= 1) (body as any).transition = null;
          changed = true;
        }
      }
    });
    return changed || moving();
  }
  function dispose() {
    if (disposed) return;
    release(); disposed = true;
    [...world.bodies].forEach(body => world.removeBody(body));
    world.contacts.length = 0; world.frictionEquations.length = 0;
  }
  return { world, bodies, floorY, step, moving, grab, move, release, pull, remove, beginStory, placeStory, reset, returnBody, dispose };
}
