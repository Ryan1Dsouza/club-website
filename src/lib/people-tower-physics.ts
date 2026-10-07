import { AABB, Body, Box, ContactMaterial, Cylinder, GSSolver, Material, Plane, PointToPointConstraint, Quaternion as CannonQuat, SAPBroadphase, Vec3, World } from 'cannon-es';
import { BLOCK_SIZE, LAYER_HEIGHT, towerSlots } from './people-tower-motion.ts';
import type { TowerDetail } from './people-tower-quality.ts';

export const PHYSICS_STEP = 1 / 120;
export const PHYSICS_STEP_MOBILE = 1 / 60;
type Point = { x: number; y: number; z: number };
type Rotation = Point & { w: number };
type Slots = ReturnType<typeof towerSlots>;

/** Fixed-step rigid bodies for play, with one collidable kinematic story block.
 * Scroll poses resolve contacts before rendering, including large/reverse seeks. */
export function createTowerPhysics(slots: Slots, simplified: boolean | TowerDetail = false) {
  let detail: TowerDetail = typeof simplified === 'boolean' ? simplified ? 1 : 2 : simplified;
  let physicsStep = detail < 2 ? PHYSICS_STEP_MOBILE : PHYSICS_STEP;
  let maxSubSteps = detail === 0 ? 2 : detail === 1 ? 3 : 6;
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
  // Pending returns: blocks waiting for their layer-based delay before flying in.
  // Kept OUT of the world during the wait so they are never rendered.
  type PendingReturn = { delay: number; fromPos: Vec3; fromQuat: CannonQuat; toPos: Vec3; toQuat: CannonQuat };
  const pendingReturns = new Map<number, PendingReturn>();
  const storyOrigins = new Map<number, { position: Vec3; quaternion: CannonQuat }>();
  // Manual placements belong to the visitor until an explicit rebuild. The
  // story may borrow a piece for its profile, then returns it to that placement.
  const manual = new Set<number>();

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
    const body = bodies[index];
    if (!body?.world) return false;
    pendingReturns.delete(index); (body as any).transition = null;
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
    pendingReturns.delete(index);
    if (body) (body as any).transition = null;
    if (body?.world) { world.removeBody(body); if (!wasStory) wakeSupported(body); }
  }
  function beginStory(index: number) {
    if (held === index) return;
    if (story >= 0 && story !== index) returnBody(story);
    const body = bodies[index];
    if (!body) return;
    const returning = pendingReturns.has(index) || (body as any).transition?.returning;
    
    // If the block was pending a staggered return, cancel it and force it back into the world immediately.
    // This happens if we reverse scroll quickly and this block becomes the active UI block.
    if (pendingReturns.has(index)) {
      pendingReturns.delete(index);
      if (!body.world) world.addBody(body);
    }
    
    if (!body.world) return;
    if (returning) {
      // Re-enter the same flight when reversing across a member boundary.
      // A queued tower return must not replace a flung block's starting pose.
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
    release(); story = -1; accumulator = 0; pendingReturns.clear(); storyOrigins.clear(); manual.clear();
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
  /** Restore a manual placement, or return an untouched piece to its tower
   * slot along a deterministic arc, even after a skipped or reversed reveal. */
  function returnBody(index: number) {
    const body = bodies[index];
    if (!body) return;
    if (restoreManual(index)) return;
    const slot = slots[index];

    if (story === index) story = -1;
    if (body.shapes[0] !== shape) { body.removeShape(storyShape); body.addShape(shape); }
    // Remove from world so it is invisible during the delay period.
    if (body.world) world.removeBody(body);
    // Cancel any prior pending entry for this block.
    pendingReturns.delete(index);

    const targetPos = new Vec3(...slot.position);
    const targetQuat = new CannonQuat();
    targetQuat.setFromEuler(0, slot.yaw, 0);

    const dir = slot.direction;
    const turned = slot.yaw !== 0;
    const fromPos = new Vec3(...slot.position);
    if (turned) { fromPos.x += dir * 5.5; fromPos.y += 1.2; }
    else         { fromPos.z += dir * 5.5; fromPos.y += 1.2; }

    const fromQuat = new CannonQuat();
    fromQuat.setFromEuler(0.6 * dir, slot.yaw + 0.5 * dir, 0.8 * dir);

    // Layer 0 (foundation) starts immediately; each layer above waits 0.45 s.
    // The block is NOT in the world yet, so it is invisible during the wait.
    const delay = slot.layer * 0.45;
    if (delay <= 0) {
      // No delay — add to world and start arc right away.
      body.type = Body.KINEMATIC; body.mass = 0; body.collisionFilterMask = 0;
      body.position.copy(fromPos); body.quaternion.copy(fromQuat);
      body.previousPosition.copy(fromPos); body.interpolatedPosition.copy(fromPos);
      body.previousQuaternion.copy(fromQuat); body.interpolatedQuaternion.copy(fromQuat);
      body.velocity.setZero(); body.angularVelocity.setZero(); body.force.setZero(); body.torque.setZero();
      body.aabbNeedsUpdate = true;
      world.addBody(body); body.sleep();
      (body as any).transition = { time: 0, returning: true, fromPos, fromQuat, toPos: targetPos, toQuat: targetQuat };
    } else {
      // Delay — store in queue; body stays out of the world (invisible).
      pendingReturns.set(index, { delay, fromPos, fromQuat, toPos: targetPos, toQuat: targetQuat });
    }
    world.broadphase.dirty = true;
  }
  const moving = () => held >= 0 || pendingReturns.size > 0 || bodies.some(body => (body.world && body.type === Body.DYNAMIC && body.sleepState !== Body.SLEEPING) || (body as any).transition);
  function step(delta: number) {
    if (disposed || !moving()) return false;
    // Tick pending-return queue: count down delays, launch arcs when ready.
    if (pendingReturns.size > 0) {
      pendingReturns.forEach((p, index) => {
        p.delay -= delta;
        if (p.delay <= 0) {
          pendingReturns.delete(index);
          const body = bodies[index];
          if (!body) return;
          body.type = Body.KINEMATIC; body.mass = 0; body.collisionFilterMask = 0;
          body.position.copy(p.fromPos); body.quaternion.copy(p.fromQuat);
          body.previousPosition.copy(p.fromPos); body.interpolatedPosition.copy(p.fromPos);
          body.previousQuaternion.copy(p.fromQuat); body.interpolatedQuaternion.copy(p.fromQuat);
          body.velocity.setZero(); body.angularVelocity.setZero(); body.force.setZero(); body.torque.setZero();
          body.aabbNeedsUpdate = true;
          if (!body.world) world.addBody(body); body.sleep();
          (body as any).transition = { time: 0, returning: true, fromPos: p.fromPos, fromQuat: p.fromQuat, toPos: p.toPos, toQuat: p.toQuat };
          world.broadphase.dirty = true;
        }
      });
    }
    // Returning blocks follow authored arcs. They do not need contact solving
    // while every dynamic block is asleep, even during a staggered rebuild.
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
      world.step(physicsStep); accumulator -= physicsStep; changed = true;
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
            if (t.time < 0) {
              // Still in delay period — body stays at fromPos, arc hasn't started.
              body.interpolatedPosition.copy(t.fromPos); body.interpolatedQuaternion.copy(t.fromQuat);
            } else {
              // Active arc phase — fly from ejection point to slot.
              const arcProgress = Math.min(1, t.time / 0.35);
              const arcEase = arcProgress < 0.5 ? 2 * arcProgress * arcProgress : 1 - Math.pow(-2 * arcProgress + 2, 2) / 2;
              t.fromPos.lerp(t.toPos, arcEase, body.position);
              t.fromQuat.slerp(t.toQuat, arcEase, body.quaternion);
              body.previousPosition.copy(body.position); body.interpolatedPosition.copy(body.position);
              body.previousQuaternion.copy(body.quaternion); body.interpolatedQuaternion.copy(body.quaternion);
              if (arcProgress >= 1) {
                // Arrived — switch to DYNAMIC+sleep so Jenga play works normally.
                body.type = Body.DYNAMIC; body.mass = .36; body.collisionFilterMask = -1;
                body.updateMassProperties();
                body.velocity.setZero(); body.angularVelocity.setZero(); body.force.setZero(); body.torque.setZero();
                body.aabbNeedsUpdate = true; world.broadphase.dirty = true;
                body.sleep(); (body as any).transition = null;
              }
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
    return changed || moving();
  }
  function dispose() {
    if (disposed) return;
    release(); disposed = true; pendingReturns.clear(); storyOrigins.clear(); manual.clear();
    [...world.bodies].forEach(body => world.removeBody(body));
    world.contacts.length = 0; world.frictionEquations.length = 0;
  }
  const isPending = (index: number) => pendingReturns.has(index);
  const isFlying = (index: number) => isPending(index) || !!(bodies[index] as any).transition;
  const isManual = (index: number) => manual.has(index);
  const isStory = (index: number) => story === index;
  return { world, bodies, floorY, step, moving, setDetail, isPending, isFlying, isManual, isStory, grab, move, release, pull, remove, beginStory, placeStory, reset, returnBody, dispose };
}
