import { AABB, Body, Box, ContactMaterial, Cylinder, GSSolver, Material, Plane, PointToPointConstraint, Quaternion as CannonQuat, SAPBroadphase, Vec3, World } from 'cannon-es';
import { BLOCK_SIZE, LAYER_HEIGHT, towerSlots } from './people-tower-motion.ts';
import type { TowerDetail } from './people-tower-quality.ts';

export const PHYSICS_STEP = 1 / 120;
export const PHYSICS_STEP_MOBILE = 1 / 45;
type Point = { x: number; y: number; z: number };
type Rotation = Point & { w: number };
type Slots = ReturnType<typeof towerSlots>;

/** Fixed-step rigid bodies for play, with one collidable kinematic story block.
 * Scroll poses resolve contacts before rendering, including large/reverse seeks. */
export function createTowerPhysics(slots: Slots, simplified: boolean | TowerDetail = false) {
  let detail: TowerDetail = typeof simplified === 'boolean' ? simplified ? 1 : 2 : simplified;
  let physicsStep = detail < 2 ? PHYSICS_STEP_MOBILE : PHYSICS_STEP;
  let maxSubSteps = detail === 0 ? 1 : detail === 1 ? 2 : 6;
  const floorY = -(Math.ceil(slots.length / 3) - 1) * LAYER_HEIGHT / 2 - BLOCK_SIZE[1] / 2;
  const world = new World({ gravity: new Vec3(0, -9.82, 0), allowSleep: true });
  world.broadphase = new SAPBroadphase(world);
  const solver = world.solver as GSSolver;
  solver.iterations = detail === 0 ? 6 : detail === 1 ? 10 : 24; solver.tolerance = 1e-6;
  const wood = new Material('tower-block'), stone = new Material('tower-foundation');
  const contact = { friction: .38, restitution: 0, contactEquationStiffness: 1e8, contactEquationRelaxation: 4 };
  world.addContactMaterial(new ContactMaterial(wood, wood, contact));
  world.addContactMaterial(new ContactMaterial(wood, stone, { ...contact, friction: .55 }));
  const floor = new Body({ mass: 0, material: stone, shape: new Plane(), position: new Vec3(0, floorY - .28, 0) });
  floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0); world.addBody(floor);
  const plinth = new Body({ mass: 0, material: stone, shape: new Cylinder(2.6, 2.75, .28, detail === 0 ? 8 : 24), position: new Vec3(0, floorY - .14, 0) });
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
  const storyOrigins = new Map<number, { position: Vec3; quaternion: CannonQuat }>();
  // Manual placements belong to the visitor until an explicit rebuild. The
  // story may borrow a piece for its profile, then returns it to that placement.
  const manual = new Set<number>();
  const layers = Array.from({ length: Math.ceil(slots.length / 3) }, (_, layer) =>
    slots.flatMap((slot, index) => slot.layer === layer ? [index] : []));
  let layerTarget = -1, nextLayer = 0, returningLayer = -1;

  function cancelLayerReturns() {
    if (layerTarget < 0) return;
    layerTarget = -1; nextLayer = 0; returningLayer = -1;
    bodies.forEach((body, index) => {
      if (manual.has(index)) return;
      (body as any).transition = null;
      makeDynamic(body);
      if (body.world) body.sleep();
    });
  }

  function advanceLayerReturn() {
    if (returningLayer >= 0) {
      if (layers[returningLayer].some(index => (bodies[index] as any).transition)) return;
      returningLayer = -1;
    }
    while (nextLayer <= layerTarget && nextLayer < layers.length) {
      const layer = nextLayer++, indices = layers[layer].filter(index => !manual.has(index));
      const settled = indices.every(index => {
        const body = bodies[index], slot = slots[index];
        const rotation = new CannonQuat(); rotation.setFromEuler(0, slot.yaw, 0);
        const dot = Math.abs(body.interpolatedQuaternion.x * rotation.x + body.interpolatedQuaternion.y * rotation.y
          + body.interpolatedQuaternion.z * rotation.z + body.interpolatedQuaternion.w * rotation.w);
        return body.world && body.interpolatedPosition.distanceTo(new Vec3(...slot.position)) < .001 && dot > .99999;
      });
      if (settled) {
        indices.forEach(index => { makeDynamic(bodies[index]); bodies[index].sleep(); });
        continue;
      }
      returningLayer = layer;
      indices.forEach(returnBody);
      return;
    }
  }

  /** Rebuild complete physical layers, finishing each before starting above it. */
  function returnLayersThrough(layer: number) {
    if (layerTarget < 0) {
      if (story >= 0) restoreManual(story);
      story = -1;
      bodies.forEach((body, index) => {
        if (manual.has(index)) return;
        (body as any).transition = null;
        if (body.shapes[0] !== shape) { body.removeShape(storyShape); body.addShape(shape); }
        body.position.copy(body.interpolatedPosition); body.quaternion.copy(body.interpolatedQuaternion);
        body.previousPosition.copy(body.position); body.previousQuaternion.copy(body.quaternion);
        body.type = Body.KINEMATIC; body.mass = 0; body.collisionFilterMask = 0;
        body.updateMassProperties(); body.velocity.setZero(); body.angularVelocity.setZero();
        body.force.setZero(); body.torque.setZero(); body.sleep(); body.aabbNeedsUpdate = true;
      });
      world.broadphase.dirty = true;
    }
    layerTarget = Math.max(layerTarget, Math.min(layers.length - 1, layer));
    advanceLayerReturn();
  }

  function makeDynamic(body: Body) {
    body.type = Body.DYNAMIC; body.mass = .36; body.collisionFilterMask = -1;
    if (body.shapes[0] !== shape) { body.removeShape(storyShape); body.addShape(shape); }
    body.updateMassProperties(); body.aabbNeedsUpdate = true; world.broadphase.dirty = true;
  }
  function restoreManual(index: number) {
    if (!manual.has(index)) return false;
    const body = bodies[index];
    if (story === index) {
      const origin = storyOrigins.get(index)!;
      body.position.copy(origin.position); body.quaternion.copy(origin.quaternion);
      body.previousPosition.copy(body.position); body.interpolatedPosition.copy(body.position);
      body.previousQuaternion.copy(body.quaternion); body.interpolatedQuaternion.copy(body.quaternion);
      makeDynamic(body); body.sleep(); story = -1;
    }
    // An actively held/thrown piece keeps its live pose, velocity and constraint.
    return true;
  }

  function setDetail(value: TowerDetail) {
    if (detail === value) return;
    detail = value;
    physicsStep = value < 2 ? PHYSICS_STEP_MOBILE : PHYSICS_STEP;
    maxSubSteps = value === 0 ? 2 : value === 1 ? 3 : 6;
    solver.iterations = value === 0 ? 6 : value === 1 ? 10 : 24;
    accumulator = 0;
    // Only the fixed foundation changes shape; preserve all block poses/joints.
    plinth.removeShape(plinth.shapes[0]);
    plinth.addShape(new Cylinder(2.6, 2.75, .28, value === 0 ? 8 : 24));
    plinth.aabbNeedsUpdate = true; world.broadphase.dirty = true;
  }

  const wake = () => bodies.forEach(body => { if (body.world) body.wakeUp(); });
  // Story order removes the top first. Losing a top block does not require
  // simulating the entire resting stack; a removed foundation still wakes it.
  const wakeSupported = (support: Body) => bodies.forEach(body => {
    if (body.world && body.type === Body.DYNAMIC && body.position.y > support.position.y + .01) body.wakeUp();
  });
  function release(throwVelocity?: Point) {
    // A plank held still in the air can sleep. Removing its constraint must
    // wake it again so gravity takes over immediately after pointer release.
    if (held >= 0) {
      const body = bodies[held];
      body.wakeUp();
      if (throwVelocity) {
        body.velocity.set(throwVelocity.x, throwVelocity.y, throwVelocity.z);
        const speed = body.velocity.length();
        if (speed > 14) body.velocity.scale(14 / speed, body.velocity);
      }
    }
    if (joint) world.removeConstraint(joint);
    if (anchor.world) world.removeBody(anchor);
    joint = undefined; held = -1; pullTime = -1; anchor.velocity.setZero();
  }
  function grab(index: number, point: Point) {
    release();
    cancelLayerReturns();
    const body = bodies[index];
    if (!body?.world) return false;
    (body as any).transition = null;
    body.position.copy(body.interpolatedPosition); body.quaternion.copy(body.interpolatedQuaternion);
    body.previousPosition.copy(body.position); body.previousQuaternion.copy(body.quaternion);
    if (story === index) story = -1;
    makeDynamic(body); manual.add(index); storyOrigins.delete(index);
    held = index; anchor.position.set(point.x, point.y, point.z); target.copy(anchor.position);
    body.pointToLocalFrame(anchor.position, pivot);
    // An unfolded banner becomes a plank again when grabbed. Keep the joint on
    // that plank even when the pointer originally landed near the banner edge.
    pivot.x = Math.max(-BLOCK_SIZE[0] / 2, Math.min(BLOCK_SIZE[0] / 2, pivot.x));
    pivot.y = Math.max(-BLOCK_SIZE[1] / 2, Math.min(BLOCK_SIZE[1] / 2, pivot.y));
    pivot.z = Math.max(-BLOCK_SIZE[2] / 2, Math.min(BLOCK_SIZE[2] / 2, pivot.z));
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
    if (restoreManual(index)) return;
    if (held === index) release();
    const wasStory = story === index;
    if (wasStory) story = -1;
    const body = bodies[index];
    if (body) (body as any).transition = null;
    if (body?.world) { world.removeBody(body); if (!wasStory) wakeSupported(body); }
  }
  function beginStory(index: number) {
    if (held === index) return;
    if (story >= 0 && story !== index) returnBody(story);
    const body = bodies[index];
    if (!body?.world) return;
    const returning = (body as any).transition?.returning;
    wakeSupported(body);
    if (returning) {
      // Re-enter the same flight when reversing across a member boundary.
      // An interrupted tower return must not replace a flung block's starting pose.
      const origin = storyOrigins.get(index);
      if (origin) { body.position.copy(origin.position); body.quaternion.copy(origin.quaternion); }
      else {
        const slot = slots[index];
        body.position.set(...slot.position); body.quaternion.setFromEuler(0, slot.yaw, 0);
      }
    } else {
      // Hand off exactly the pose the visitor last saw, including a flung block's
      // rotation or an unfinished rebuild. The solver can be one step ahead.
      body.position.copy(body.interpolatedPosition); body.quaternion.copy(body.interpolatedQuaternion);
      storyOrigins.set(index, { position: body.position.clone(), quaternion: body.quaternion.clone() });
    }
    (body as any).transition = null;
    body.previousPosition.copy(body.position); body.interpolatedPosition.copy(body.position);
    body.previousQuaternion.copy(body.quaternion); body.interpolatedQuaternion.copy(body.quaternion);
    body.velocity.setZero(); body.angularVelocity.setZero(); body.force.setZero(); body.torque.setZero();
    story = index;
    storyShape.halfExtents.set(BLOCK_SIZE[0] / 2, BLOCK_SIZE[1] / 2, BLOCK_SIZE[2] / 2);
    storyShape.updateConvexPolyhedronRepresentation(); storyShape.updateBoundingSphereRadius();
    body.type = Body.KINEMATIC; body.mass = 0; body.collisionFilterMask = 0;
    body.removeShape(shape); body.addShape(storyShape); body.updateMassProperties(); body.sleep();
    body.aabbNeedsUpdate = true; world.broadphase.dirty = true;
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
    
    // Disable Cannon's built-in collision response for the kinematic story block.
    // This prevents it from "rubbing" against resting blocks and waking them up,
    // which caused the tower to fall and ruined the reverse-scroll restore.
    body.collisionFilterMask = 0;
    
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
      position.y = body.position.y;
    }
    body.previousPosition.copy(body.position); body.interpolatedPosition.copy(body.position);
    body.previousQuaternion.copy(body.quaternion); body.interpolatedQuaternion.copy(body.quaternion);
    body.aabbNeedsUpdate = true; world.broadphase.dirty = true;
  }
  function reset(completed = 0) {
    cancelLayerReturns();
    release(); story = -1; accumulator = 0; storyOrigins.clear(); manual.clear();
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
  /** Restore a manual placement, or immediately animate an untouched piece
   * from its visible pose to its tower slot after a skipped or reversed reveal. */
  function returnBody(index: number) {
    const body = bodies[index];
    if (!body) return;
    if (restoreManual(index)) return;
    const slot = slots[index];

    if (story === index) story = -1;
    if (body.shapes[0] !== shape) { body.removeShape(storyShape); body.addShape(shape); }

    const targetPos = new Vec3(...slot.position);
    const targetQuat = new CannonQuat();
    targetQuat.setFromEuler(0, slot.yaw, 0);

    const fromPos = body.interpolatedPosition.clone();
    const fromQuat = body.interpolatedQuaternion.clone();

    // Keep the block visible and ghost through fallen pieces during its return.
    body.type = Body.KINEMATIC; body.mass = 0; body.collisionFilterMask = 0;
    body.updateMassProperties();
    body.position.copy(fromPos); body.quaternion.copy(fromQuat);
    body.previousPosition.copy(fromPos); body.interpolatedPosition.copy(fromPos);
    body.previousQuaternion.copy(fromQuat); body.interpolatedQuaternion.copy(fromQuat);
    body.velocity.setZero(); body.angularVelocity.setZero(); body.force.setZero(); body.torque.setZero();
    body.aabbNeedsUpdate = true;
    if (!body.world) world.addBody(body);
    body.sleep();
    (body as any).transition = { time: 0, returning: true, fromPos, fromQuat, toPos: targetPos, toQuat: targetQuat };
    world.broadphase.dirty = true;
  }
  const moving = () => held >= 0 || returningLayer >= 0 || bodies.some(body => (body.world && body.type === Body.DYNAMIC && body.sleepState !== Body.SLEEPING) || (body as any).transition);
  function step(delta: number) {
    if (disposed || !moving()) return false;
    // Returning blocks animate without contact solving while every dynamic
    // block is asleep.
    const simulating = held >= 0 || bodies.some(body => body.world && body.type === Body.DYNAMIC && body.sleepState !== Body.SLEEPING);
    if (simulating) accumulator = Math.min(physicsStep * maxSubSteps, accumulator + Math.max(0, delta));
    else accumulator = 0;
    let changed = false;
    while (accumulator >= physicsStep) {
      if (joint) {
        if (pullTime >= 0) {
          pullTime += physicsStep;
          pullStart.lerp(pullEnd, Math.min(1, pullTime / .7), target);
        }
        target.vsub(anchor.position, velocity); velocity.scale(18, velocity);
        const speed = velocity.length();
        const maxSpeed = pullTime >= 0 ? 7 : 14;
        if (speed > maxSpeed) velocity.scale(maxSpeed / speed, velocity);
        anchor.velocity.copy(velocity);
      }
      world.step(physicsStep);
      // Bound separation impulses when a returned block overlaps fallen pieces.
      for (const body of bodies) {
        const speedSquared = body.velocity.lengthSquared();
        if (speedSquared > 900) {
          body.velocity.scale(30 / Math.sqrt(speedSquared), body.velocity);
        }
      }
      accumulator -= physicsStep; changed = true;
      if (pullTime >= 1) release();
    }
    // Interpolate fixed steps for 60/90/120/144 Hz displays. Sleeping and story
    // bodies use their exact pose so the scene can stop requesting frames.
    const alpha = accumulator / physicsStep;
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
          const progress = Math.min(1, t.time / 0.35); // 350ms smooth return
          const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2; // ease-in-out
          if (t.returning) {
            t.fromPos.lerp(t.toPos, ease, body.position);
            t.fromQuat.slerp(t.toQuat, ease, body.quaternion);
            body.previousPosition.copy(body.position); body.interpolatedPosition.copy(body.position);
            body.previousQuaternion.copy(body.quaternion); body.interpolatedQuaternion.copy(body.quaternion);
            if (progress >= 1) {
              // Restore normal Jenga play once the block reaches its slot.
              body.type = Body.DYNAMIC; body.mass = .36; body.collisionFilterMask = -1;
              body.updateMassProperties();
              body.velocity.setZero(); body.angularVelocity.setZero(); body.force.setZero(); body.torque.setZero();
              body.aabbNeedsUpdate = true; world.broadphase.dirty = true;
              body.sleep(); (body as any).transition = null;
            }
          } else {
            t.fromPos.lerp(body.position, ease, body.interpolatedPosition);
            t.fromQuat.slerp(body.quaternion, ease, body.interpolatedQuaternion);
            if (progress >= 1) (body as any).transition = null;
          }
          changed = true;
        }
      }
    });
    advanceLayerReturn();
    return changed || moving();
  }
  function dispose() {
    if (disposed) return;
    release(); disposed = true; storyOrigins.clear(); manual.clear();
    [...world.bodies].forEach(body => world.removeBody(body));
    world.contacts.length = 0; world.frictionEquations.length = 0;
  }
  // Retain the renderer API; immediate returns never wait in a hidden state.
  const isPending = (_index: number) => false;
  const isFlying = (index: number) => !!(bodies[index] as any).transition;
  const isManual = (index: number) => manual.has(index);
  const isStory = (index: number) => story === index;
  return { world, bodies, floorY, step, moving, setDetail, isPending, isFlying, isManual, isStory, grab, move, release, pull, remove, beginStory, placeStory, reset, returnBody, returnLayersThrough, cancelLayerReturns, dispose };
}
