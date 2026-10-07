import { jsxs, jsx } from "react/jsx-runtime";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { mergeGeometries, toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { q as qualityPixelRatio, c as createQualityController, r as rideQuality } from "./event-quality-CCUjlSVB.js";
import { G as GLIMPSE_EXIT, c as cinematicCamera, S as STATION_PAN_SECONDS, s as stationPanAngle, a as stationArrivalFrame } from "./EventRollercoaster-E9HDiTH-.js";
import { FullScreenQuad } from "three/addons/postprocessing/Pass.js";
import "lucide-react";
import "../entry-server.js";
import "react-dom/server";
import "react-router-dom/server.mjs";
import "styled-components";
import "react-router-dom";
import "framer-motion";
import "react-dom";
import "clsx";
import "tailwind-merge";
import "@studio-freight/lenis";
import "gsap";
const LOGO_SCALE = 2.4;
const LOGO_CENTER_Y = 55;
const LOGO_DEPTH = 5;
const COASTER_SPEED = 23;
const BOOST_SPEED = 36;
const STATION_BRAKE = 5.5;
const UP = new THREE.Vector3(0, 1, 0);
function logoPoint(x, z, depth = 0) {
  return new THREE.Vector3(x * LOGO_SCALE, LOGO_CENTER_Y - z * LOGO_SCALE, depth);
}
const LOGO_PASSAGES = [
  [-11.348, 4.025],
  [-5.348, -15.894],
  [3.343, -10.713],
  [12.548, -2.237],
  [-0.362, -4.063],
  [-4.643, 9.956]
];
const PLATFORM_POINTS = [
  [-48, 61, -38],
  [3, 103, 40],
  [36, 77, -38],
  [18, 43, -43],
  [-19, 66, 51],
  [26, 16, 48]
];
function createCoasterTrack() {
  const point = (x, y, z) => new THREE.Vector3(x, y, z);
  const pass = (index, direction) => {
    const [x, z] = LOGO_PASSAGES[index];
    return [-18, 0, 18].map((depth) => logoPoint(x, z, depth * direction));
  };
  const points = [
    point(0, 8, 76),
    point(0, 8, 64),
    point(-10, 15, 48),
    point(-24, 30, 34),
    ...pass(0, -1),
    point(-39, 61, -38),
    point(...PLATFORM_POINTS[0]),
    point(-57, 61, -38),
    point(-62, 75, -30),
    point(-45, 88, -33),
    point(-28, 91, -29),
    ...pass(1, 1),
    point(-8, 103, 40),
    point(...PLATFORM_POINTS[1]),
    point(14, 103, 40),
    // Stay in front of the solid crown until the next deliberate opening.
    point(41, 101, 40),
    point(57, 93, 28),
    point(52, 83, 28),
    point(33, 80, 35),
    point(17, 83, 26),
    ...pass(2, -1),
    point(27, 77, -38),
    point(...PLATFORM_POINTS[2]),
    point(45, 77, -38),
    point(65, 65, -29),
    point(71, 51, -4),
    point(59, 46, 24),
    point(40, 52, 34),
    ...pass(3, -1),
    point(29, 43, -43),
    point(...PLATFORM_POINTS[3]),
    point(7, 43, -43),
    point(-20, 48, -49),
    point(-15, 60, -30),
    ...pass(4, 1),
    point(6, 72, 37),
    point(-8, 66, 51),
    point(...PLATFORM_POINTS[4]),
    point(-30, 66, 51),
    point(-54, 51, 44),
    point(-69, 32, 20),
    point(-62, 20, -17),
    point(-28, 27, -37),
    ...pass(5, 1),
    point(8, 21, 35),
    point(15, 16, 48),
    point(...PLATFORM_POINTS[5]),
    point(37, 16, 48),
    // A sweeping garden return, with a straight, level join into the launch.
    point(54, 12, 66),
    point(67, 12, 88),
    point(78, 16, 113),
    point(69, 23, 143),
    point(38, 25, 162),
    point(0, 20, 169),
    point(-35, 14, 151),
    point(-47, 10, 124),
    point(-32, 8, 104),
    point(-12, 8, 113),
    point(0, 8, 105),
    point(0, 8, 92),
    point(0, 8, 84)
  ];
  const curve = new THREE.CatmullRomCurve3(points, true, "centripetal");
  curve.arcLengthDivisions = 12e3;
  curve.updateArcLengths();
  return curve;
}
const wrapDistance = (distance, length) => THREE.MathUtils.euclideanModulo(distance, length);
function trackSeparation(a, b, length) {
  const distance = Math.abs(wrapDistance(a - b, length));
  return Math.min(distance, length - distance);
}
const aheadDistance = (from, to, direction, length, loop) => loop ? wrapDistance((to - from) * direction, length) : (to - from) * direction;
function createTrackFrame() {
  return {
    point: new THREE.Vector3(),
    tangent: new THREE.Vector3(),
    side: new THREE.Vector3(),
    up: new THREE.Vector3(),
    curvature: 0,
    before: new THREE.Vector3(),
    after: new THREE.Vector3()
  };
}
function sampleTrack(track, distance, length = track.getLength(), frame = createTrackFrame()) {
  const t = track.closed ? wrapDistance(distance, length) / length : THREE.MathUtils.clamp(distance / length, 0, 1);
  track.getPointAt(t, frame.point);
  track.getTangentAt(t, frame.tangent).normalize();
  frame.side.crossVectors(frame.tangent, UP).normalize();
  frame.up.crossVectors(frame.side, frame.tangent).normalize();
  const before = track.getTangentAt(track.closed ? wrapDistance(t - 4e-3, 1) : Math.max(0, t - 4e-3), frame.before);
  const after = track.getTangentAt(track.closed ? wrapDistance(t + 4e-3, 1) : Math.min(1, t + 4e-3), frame.after);
  const span = (track.closed ? 8e-3 : Math.min(1, t + 4e-3) - Math.max(0, t - 4e-3)) * length;
  frame.curvature = Math.atan2(before.z * after.x - before.x * after.z, before.x * after.x + before.z * after.z) / span;
  return frame;
}
function cameraBank(curvature, speed, reduced) {
  return THREE.MathUtils.clamp(Math.atan(curvature * speed * speed / 22), -0.3, 0.3);
}
function stepCoaster(previous, throttle, slope, seconds, length, reduced = false, options = {}) {
  if (!Number.isFinite(seconds) || seconds <= 0 || length <= 0) return previous;
  const dt = Math.min(seconds, 0.05);
  const input = THREE.MathUtils.clamp(throttle, -1, 1);
  const limit = reduced ? 8.25 : options.boost ? BOOST_SPEED : COASTER_SPEED;
  const reversing = input * previous.speed < 0;
  const drive = input * (reversing ? 16 : options.boost ? 17 : 11);
  const rolling = Math.abs(previous.speed) > 0.025 ? Math.sign(previous.speed) * (0.65 + Math.abs(previous.speed) * 0.065) : 0;
  const gravity = Math.abs(previous.speed) > 0.08 || input !== 0 ? -slope * 6 : 0;
  let acceleration = THREE.MathUtils.damp(previous.acceleration, drive + gravity - rolling, 7, dt);
  const speedLimit = Math.max(limit, Math.abs(previous.speed) - 5 * dt);
  let speed = THREE.MathUtils.clamp(previous.speed + acceleration * dt, -speedLimit, speedLimit);
  if (!input && (previous.speed * speed < 0 || Math.abs(speed) < 0.025)) {
    speed = 0;
    acceleration = 0;
  }
  if (!options.loop) {
    const remaining = speed >= 0 ? length - previous.distance : previous.distance;
    speed = Math.sign(speed) * Math.min(Math.abs(speed), Math.sqrt(Math.max(0, 2 * 9 * remaining)));
  }
  const traveled = previous.distance + (previous.speed + speed) * 0.5 * dt;
  const distance = options.loop ? wrapDistance(traveled, length) : THREE.MathUtils.clamp(traveled, 0, length);
  if (!options.loop && (distance === length && speed >= 0 && input >= 0 || distance === 0 && speed <= 0 && input <= 0)) {
    speed = 0;
    acceleration = 0;
  }
  return { distance, speed, acceleration };
}
const APPROACH_WINDOW = 38;
const APPROACH_FLOOR = 0.78;
function nextCoasterStop(distance, stops, length, direction, dismissed = null, loop = true) {
  let index = null, remaining = Infinity;
  if (length <= 0 || !direction) return { index, remaining };
  stops.forEach((stop, i) => {
    if (i === dismissed || !Number.isFinite(stop.distance)) return;
    const ahead = aheadDistance(distance, stop.distance, Math.sign(direction), length, loop);
    if (ahead >= 0 && ahead < remaining) {
      index = i;
      remaining = ahead;
    }
  });
  return { index, remaining };
}
function approachScale(distance, stops, length, direction, dismissed = null, loop = true) {
  const { remaining } = nextCoasterStop(distance, stops, length, direction, dismissed, loop);
  return THREE.MathUtils.lerp(APPROACH_FLOOR, 1, THREE.MathUtils.smoothstep(remaining, 0, APPROACH_WINDOW));
}
function initialCoasterJourney(distance = 0) {
  return { motion: { distance, speed: 0, acceleration: 0 }, phase: "riding", station: null, dismissed: null, dockingSpeed: 0, dockingDirection: 1 };
}
function departCoasterStation(state) {
  return { ...state, phase: "riding", dismissed: state.station ?? state.dismissed, station: null };
}
function stepCoasterJourney(previous, throttle, slope, seconds, length, stops, reduced = false, options = {}) {
  if (previous.phase === "stopped" || seconds <= 0 || !Number.isFinite(seconds)) return previous;
  const dt = Math.min(seconds, 0.05), state = { ...previous };
  const loop = !!options.loop;
  if (state.dismissed !== null) {
    const stop = stops[state.dismissed];
    const separation = stop && (loop ? trackSeparation(state.motion.distance, stop.distance, length) : Math.abs(state.motion.distance - stop.distance));
    if (!stop || !Number.isFinite(stop.distance) || separation > stop.radius * 1.15) state.dismissed = null;
  }
  if (state.phase === "braking" && state.station !== null) {
    const destination = stops[state.station].distance, direction2 = state.dockingDirection;
    const remaining = aheadDistance(state.motion.distance, destination, direction2, length, loop), velocity = Math.abs(state.motion.speed);
    const desired = Math.min(state.dockingSpeed, Math.sqrt(2 * STATION_BRAKE * Math.max(0, remaining)));
    const speed = Math.max(0, velocity + THREE.MathUtils.clamp(desired - velocity, -6 * dt, 4 * dt));
    const travel = (velocity + speed) * 0.5 * dt;
    if (remaining <= Math.max(0.015, travel)) {
      state.motion = { distance: destination, speed: 0, acceleration: 0 };
      state.phase = "stopped";
    } else {
      const distance = state.motion.distance + direction2 * travel;
      state.motion = { distance: loop ? wrapDistance(distance, length) : distance, speed: direction2 * speed, acceleration: direction2 * (speed - velocity) / dt };
    }
    return state;
  }
  const motion = stepCoaster(state.motion, throttle, slope, dt, length, reduced, options);
  const direction = Math.sign(motion.speed);
  const brakingDistance = Math.max(1.2, motion.speed * motion.speed / (2 * STATION_BRAKE) + Math.abs(motion.speed) * dt + 0.5);
  let closest = Infinity;
  stops.forEach((stop, index) => {
    if (!Number.isFinite(stop.distance)) return;
    const ahead = aheadDistance(state.motion.distance, stop.distance, direction, length, loop);
    if (index !== state.dismissed && direction && ahead >= 0 && ahead <= brakingDistance && ahead < closest) {
      closest = ahead;
      state.station = index;
      state.phase = "braking";
      state.dockingDirection = direction;
      state.dockingSpeed = Math.max(1.2, Math.abs(motion.speed));
    }
  });
  if (state.phase === "braking") return stepCoasterJourney(state, throttle, slope, dt, length, stops, reduced, options);
  state.motion = motion;
  state.phase = !reduced && nextCoasterStop(motion.distance, stops, length, direction, state.dismissed, loop).remaining < APPROACH_WINDOW ? "approaching" : "riding";
  return state;
}
const walls = /* @__PURE__ */ JSON.parse('[{"outline":[[-10.869,6.613],[-10.869,7.923],[-10.738,8.054],[-10.738,8.577],[-9.952,10.411],[-9.036,11.458],[-8.905,11.458],[-7.988,12.244],[-7.202,12.637],[-6.94,12.637],[-6.417,12.899],[-6.024,12.899],[-5.893,13.03],[-3.143,13.03],[-3.012,12.899],[-2.619,12.899],[-2.488,12.768],[-1.833,12.637],[-1.44,12.375],[-1.179,12.375],[-0.655,12.113],[-0.393,11.851],[0.524,11.458],[0.524,11.327],[-0.131,11.327],[-0.262,11.196],[-1.31,11.196],[-1.44,11.065],[-2.357,11.065],[-2.488,11.196],[-3.536,11.327],[-3.667,11.458],[-5.369,11.458],[-5.5,11.327],[-6.024,11.327],[-6.155,11.196],[-6.417,11.196],[-7.202,10.804],[-8.25,9.887],[-9.167,8.446],[-9.167,8.185],[-9.298,8.054],[-9.298,7.53],[-10.738,6.482]],"holes":[]},{"outline":[[-5.107,3.47],[-5.238,3.339],[-5.238,3.077],[-5.631,2.161],[-6.155,2.423],[-6.417,2.685],[-6.81,2.815],[-7.071,3.077],[-8.381,3.732],[-8.643,3.732],[-9.036,3.994],[-9.298,3.994],[-9.821,4.256],[-8.643,5.173],[-8.25,5.304],[-7.464,4.911],[-7.202,4.911],[-6.81,4.649],[-6.548,4.649],[-6.024,4.387],[-5.762,4.125],[-5.107,3.863]],"holes":[]},{"outline":[[-6.81,-0.327],[-7.726,-1.375],[-7.726,-1.506],[-7.988,-1.506],[-9.036,-0.72],[-10.345,-0.065],[-10.607,-0.065],[-10.738,0.065],[-11.262,0.065],[-11.393,0.196],[-13.226,0.196],[-13.226,0.327],[-12.964,0.589],[-12.179,1.899],[-11.786,1.899],[-11.655,1.768],[-10.869,1.768],[-10.738,1.637],[-10.345,1.637],[-9.56,1.244],[-9.298,1.244],[-8.512,0.851],[-8.25,0.589],[-7.857,0.458]],"holes":[]},{"outline":[[-18.071,-7.137],[-18.595,-6.744],[-18.726,-6.22],[-18.857,-6.089],[-18.857,-5.696],[-18.988,-5.565],[-18.988,-3.601],[-18.857,-3.47],[-18.857,-2.946],[-18.726,-2.815],[-18.726,-2.554],[-18.464,-2.161],[-18.464,-1.899],[-18.202,-1.375],[-17.81,-0.982],[-17.155,0.065],[-16.369,0.72],[-15.976,0.851],[-15.714,1.113],[-15.19,1.375],[-15.583,0.589],[-15.583,0.196],[-15.714,0.065],[-15.714,-0.327],[-15.845,-0.458],[-15.976,-1.244],[-16.369,-1.637],[-17.155,-3.208],[-17.155,-3.732],[-17.286,-3.863],[-17.286,-5.565],[-17.024,-6.089],[-17.024,-6.613],[-17.286,-6.875]],"holes":[]},{"outline":[[-16.762,-8.577],[-16.369,-7.923],[-14.929,-6.351],[-14.798,-6.351],[-14.798,-6.482],[-14.536,-6.744],[-14.012,-6.875],[-13.881,-7.006],[-13.75,-6.875],[-13.226,-6.875],[-10.476,-5.435],[-10.214,-5.435],[-12.44,-6.482],[-12.702,-6.744],[-13.226,-7.006],[-14.798,-8.446],[-14.798,-8.577],[-15.321,-9.232],[-15.583,-9.232]],"holes":[]},{"outline":[[-6.024,-13.685],[-6.286,-13.554],[-6.286,-13.423],[-7.071,-12.506],[-7.071,-12.244],[-6.81,-11.851],[-6.81,-11.458],[-6.679,-11.327],[-6.679,-10.542],[-6.81,-10.411],[-7.202,-10.804],[-7.202,-9.232],[-7.071,-9.101],[-6.94,-7.53],[-5.893,-8.185],[-5.893,-8.315],[-5.5,-8.708],[-5.107,-9.625],[-5.107,-11.196],[-5.238,-11.327],[-5.238,-11.851]],"holes":[]},{"outline":[[3.143,-20.232],[3.012,-20.101],[2.226,-19.97],[1.571,-19.577],[0.393,-18.399],[0.393,-18.268],[0.131,-18.006],[0.131,-17.744],[-0.393,-16.696],[-0.393,-16.173],[-0.524,-16.042],[-0.524,-13.03],[-0.393,-12.899],[-0.393,-11.982],[-0.262,-11.851],[-0.262,-11.327],[-0.131,-11.196],[-0.131,-10.673],[0,-10.542],[0,-9.756],[0.131,-9.625],[0.131,-8.185],[0,-8.054],[-0.131,-7.268],[-0.524,-6.744],[-0.131,-5.958],[0.131,-6.089],[0.131,-6.22],[0.655,-6.744],[0.655,-6.875],[1.31,-7.53],[1.44,-8.054],[1.571,-8.185],[1.702,-10.542],[1.44,-10.935],[1.44,-11.327],[1.31,-11.458],[1.179,-12.244],[1.048,-12.375],[1.048,-13.03],[0.917,-13.161],[0.917,-15.911],[1.048,-16.042],[1.179,-16.696],[1.571,-17.22],[1.702,-17.613],[2.488,-18.399],[3.012,-18.53],[3.143,-18.661],[4.321,-18.661],[4.452,-18.53],[4.714,-18.53],[5.762,-17.744],[6.679,-16.173],[6.417,-15.911],[5.369,-15.387],[4.06,-14.208],[3.536,-13.292],[3.667,-13.03],[3.929,-13.03],[4.976,-12.113],[4.976,-12.768],[5.238,-13.03],[5.238,-13.161],[6.024,-13.946],[6.155,-13.946],[6.81,-14.47],[6.94,-14.208],[6.81,-14.077],[6.81,-13.292],[6.679,-13.161],[6.679,-12.768],[6.417,-12.244],[6.024,-11.851],[5.5,-11.72],[5.631,-11.72],[6.679,-10.804],[6.94,-10.673],[7.464,-10.673],[7.595,-10.542],[9.429,-10.542],[9.56,-10.673],[11.393,-10.673],[11.524,-10.542],[12.048,-10.542],[12.179,-10.411],[12.571,-10.411],[12.964,-10.149],[13.226,-10.149],[13.488,-9.887],[13.75,-9.887],[15.19,-8.839],[15.19,-8.185],[15.06,-8.054],[14.405,-8.054],[14.143,-7.923],[14.274,-7.006],[14.143,-6.875],[14.012,-5.565],[13.881,-5.435],[13.75,-4.125],[13.619,-3.994],[13.619,-3.732],[14.405,-3.339],[14.667,-2.815],[14.667,-0.065],[14.798,0.065],[14.798,0.589],[14.667,0.72],[13.095,-0.851],[12.833,-0.851],[12.048,-0.458],[11.917,-0.589],[11.393,-0.72],[11.131,-0.982],[11,-1.506],[10.869,-1.637],[10.869,-2.03],[11,-2.161],[11,-2.685],[11.131,-2.815],[11.131,-3.47],[11.262,-3.601],[11.393,-4.78],[9.821,-3.601],[8.643,-4.518],[8.25,-4.649],[8.119,-4.78],[8.119,-6.22],[7.726,-6.875],[7.333,-7.268],[6.679,-7.661],[6.81,-7.923],[6.81,-8.315],[6.417,-8.315],[6.024,-8.577],[5.762,-8.577],[5.5,-8.839],[5.238,-7.923],[4.976,-7.661],[4.714,-7.661],[4.321,-7.399],[3.798,-7.53],[3.798,-7.268],[3.405,-6.482],[3.143,-6.22],[3.143,-6.089],[3.405,-5.827],[3.405,-4.911],[3.536,-4.78],[3.536,-4.518],[3.798,-3.994],[4.583,-3.208],[4.452,-2.946],[4.452,-2.292],[4.321,-2.161],[4.321,-1.506],[4.19,-1.244],[3.929,-0.982],[3.667,-0.982],[3.143,-0.589],[2.488,-0.589],[2.226,-0.851],[2.226,-2.423],[2.095,-2.554],[2.095,-3.077],[1.702,-3.994],[1.44,-4.125],[0.524,-3.077],[0.524,-2.685],[0.655,-2.554],[0.655,-2.161],[0.786,-2.03],[0.786,-0.851],[0.655,-0.72],[0.131,-0.72],[0,-0.589],[-1.44,-0.196],[-2.75,0.458],[-3.667,1.113],[-3.929,0.982],[-4.321,-0.065],[-4.583,-0.327],[-4.845,-0.982],[-5.238,-1.506],[-4.321,-2.423],[-3.667,-2.815],[-3.143,-3.339],[-1.702,-3.994],[-1.964,-4.649],[-2.226,-4.911],[-2.75,-6.089],[-3.012,-6.351],[-3.667,-7.661],[-3.798,-8.446],[-3.929,-8.577],[-3.929,-9.232],[-3.929,-8.315],[-3.798,-8.185],[-3.798,-7.661],[-3.667,-7.53],[-3.667,-7.268],[-2.619,-5.435],[-3.405,-5.042],[-3.667,-4.78],[-4.06,-4.649],[-5.107,-3.732],[-5.238,-3.732],[-6.155,-2.815],[-6.286,-2.815],[-7.988,-4.256],[-8.512,-3.994],[-9.429,-3.208],[-8.905,-2.946],[-8.381,-2.423],[-8.25,-2.423],[-6.679,-0.851],[-5.5,1.244],[-5.5,1.506],[-5.238,1.899],[-5.238,2.161],[-5.107,2.292],[-5.107,2.554],[-4.714,3.47],[-4.714,3.863],[-4.452,4.387],[-4.452,4.78],[-4.321,4.911],[-4.845,5.565],[-5.107,6.089],[-5.107,7.399],[-2.881,8.577],[-2.488,8.577],[-2.357,8.708],[-1.31,8.708],[-1.179,8.839],[-0.131,8.839],[0,8.97],[0.262,8.97],[-0.524,8.185],[-0.524,7.923],[-0.262,7.399],[-0.262,6.351],[-0.393,6.22],[-0.131,5.958],[1.833,4.78],[3.667,3.339],[4.19,3.47],[4.321,3.601],[5.5,3.601],[6.286,3.208],[7.071,2.423],[7.202,2.554],[7.464,2.554],[7.595,2.685],[7.857,2.685],[7.988,2.815],[8.25,2.815],[8.381,2.946],[8.643,2.946],[8.774,3.077],[9.036,3.077],[9.952,3.47],[10.476,3.47],[11,3.732],[13.75,3.863],[14.405,4.78],[14.536,4.78],[14.798,5.042],[15.583,5.173],[15.714,5.304],[16.369,5.304],[16.5,5.173],[16.893,5.173],[17.417,4.911],[18.071,4.256],[18.333,3.732],[18.333,3.47],[18.464,3.339],[18.464,2.292],[17.94,1.244],[17.286,0.72],[16.762,0.589],[16.5,0.327],[16.369,-2.292],[16.238,-2.423],[16.238,-3.732],[16.762,-4.125],[16.762,-4.256],[17.286,-4.911],[17.286,-5.173],[17.417,-5.304],[17.417,-6.22],[17.286,-6.351],[17.286,-6.613],[17.417,-6.744],[17.679,-6.482],[18.071,-5.565],[18.333,-5.304],[18.333,-5.042],[18.464,-4.911],[18.595,-5.042],[18.726,-4.911],[18.595,-4.649],[18.857,-4.256],[18.988,-3.601],[19.25,-3.208],[19.25,-2.946],[19.512,-2.554],[19.512,-2.292],[19.774,-1.768],[19.774,-1.375],[19.905,-1.244],[19.905,-0.851],[20.036,-0.72],[20.036,0.196],[20.167,0.327],[20.167,1.637],[20.036,1.768],[20.036,2.423],[19.905,2.554],[19.774,3.339],[19.512,3.732],[19.512,3.994],[19.25,4.256],[18.988,4.78],[18.071,5.696],[16.5,6.613],[14.667,6.613],[14.536,6.482],[14.143,6.482],[13.357,6.089],[13.095,6.089],[12.702,5.827],[12.44,5.827],[11.524,5.435],[11.131,5.435],[11,5.304],[10.345,5.304],[10.214,5.173],[7.726,5.173],[7.595,5.304],[7.071,5.304],[6.94,5.435],[6.155,5.565],[5.5,5.958],[5.238,5.958],[4.452,6.351],[4.19,6.613],[2.881,7.399],[0.917,8.97],[0.917,9.101],[1.31,9.101],[1.833,9.363],[2.75,9.494],[5.238,7.661],[5.5,7.661],[6.548,7.137],[6.81,7.137],[7.333,6.875],[7.726,6.875],[7.857,6.744],[10.476,6.744],[10.607,6.875],[11,6.744],[11.131,6.875],[11.786,7.006],[12.964,7.661],[13.226,7.661],[14.143,8.054],[14.667,8.054],[14.798,8.185],[16.5,8.185],[16.762,8.054],[17.155,8.315],[17.024,8.446],[16.893,9.363],[16.631,9.887],[16.238,10.149],[15.976,10.673],[14.798,11.851],[13.357,12.637],[12.571,12.768],[12.44,12.899],[10.083,12.899],[9.952,12.768],[9.821,12.899],[9.56,12.899],[9.167,12.637],[10.869,10.673],[11,10.149],[11.131,10.018],[11.131,9.625],[11.262,9.494],[11.131,8.708],[10.869,8.185],[10.214,7.53],[9.69,7.399],[9.56,7.268],[8.512,7.137],[8.381,7.268],[7.857,7.268],[7.726,7.399],[7.464,7.399],[6.679,7.792],[6.155,8.315],[5.631,9.232],[5.631,9.625],[5.5,9.756],[5.5,11.196],[5.762,11.458],[5.893,11.851],[6.155,12.113],[6.548,12.899],[6.679,12.899],[6.94,13.161],[6.94,13.292],[7.071,13.292],[7.071,12.899],[7.464,11.982],[7.464,11.72],[7.071,10.935],[7.071,9.887],[7.333,9.363],[7.726,8.97],[8.25,8.708],[8.905,8.708],[9.036,8.577],[9.167,8.708],[9.429,8.708],[9.821,9.101],[9.821,9.363],[9.429,9.756],[9.429,9.887],[8.119,11.196],[8.25,11.327],[7.857,11.982],[7.857,12.244],[7.595,12.768],[7.595,13.161],[7.333,13.554],[7.333,14.077],[8.119,14.994],[8.512,15.649],[9.036,16.173],[9.036,16.304],[9.56,16.827],[9.56,17.089],[9.821,17.613],[9.69,17.744],[9.56,18.268],[9.298,18.53],[8.774,18.661],[8.643,18.792],[8.512,18.661],[7.988,18.53],[7.333,17.875],[7.333,17.744],[6.81,17.22],[6.417,16.565],[4.452,14.47],[4.452,14.339],[2.619,11.982],[2.095,11.851],[1.964,11.72],[1.571,11.72],[1.44,11.589],[1.048,11.589],[0.786,11.851],[1.31,12.768],[2.226,13.815],[2.488,14.339],[3.012,14.863],[3.012,14.994],[3.536,15.518],[3.536,15.649],[4.06,16.173],[4.06,16.304],[5.762,18.137],[5.893,18.137],[6.81,19.054],[6.94,19.054],[7.726,19.708],[9.036,20.363],[9.821,20.363],[10.083,20.232],[10.607,19.577],[10.607,18.137],[9.167,15.256],[8.905,14.339],[9.036,14.208],[9.429,14.208],[9.56,14.339],[10.083,14.339],[10.214,14.47],[12.964,14.47],[13.095,14.339],[14.012,14.208],[15.583,13.423],[17.155,11.982],[17.155,11.851],[17.679,11.196],[18.333,9.625],[18.333,9.232],[18.464,9.101],[18.464,8.708],[18.595,8.577],[18.595,7.399],[18.857,7.137],[19.381,6.875],[20.429,5.827],[20.429,5.696],[20.952,5.042],[21.214,4.518],[21.214,4.256],[21.476,3.863],[21.476,3.601],[21.738,3.077],[21.738,2.292],[21.869,2.161],[21.869,-0.065],[21.738,-0.196],[21.738,-0.982],[21.607,-1.113],[21.607,-1.506],[21.476,-1.637],[21.476,-2.03],[21.345,-2.161],[21.214,-2.946],[20.952,-3.339],[20.69,-4.256],[20.167,-5.304],[19.905,-5.565],[19.643,-6.22],[19.381,-6.482],[18.857,-7.399],[18.333,-7.923],[18.333,-8.054],[16.762,-9.625],[16.762,-11.065],[16.631,-11.196],[16.631,-11.589],[16.5,-11.72],[16.238,-12.768],[15.845,-13.554],[15.19,-14.339],[15.19,-14.47],[13.881,-15.649],[12.833,-16.173],[12.571,-16.173],[11.655,-16.565],[11.131,-16.565],[11,-16.696],[8.643,-16.696],[8.512,-16.565],[8.119,-16.565],[7.726,-17.351],[7.726,-17.613],[7.333,-18.268],[6.94,-18.661],[6.94,-18.792],[6.155,-19.446],[4.845,-20.101],[4.321,-20.101],[4.19,-20.232]],"holes":[[[-3.274,6.089],[-3.012,5.958],[-2.488,5.958],[-1.964,6.351],[-1.833,6.613],[-1.833,7.137],[-2.095,7.53],[-2.357,7.661],[-3.012,7.661],[-3.536,7.137],[-3.667,6.875]],[[15.976,1.899],[16.369,2.03],[16.631,2.292],[16.631,3.208],[16.107,3.732],[15.714,3.732],[15.19,3.339],[15.19,2.423],[15.452,2.161]],[[2.488,0.982],[2.488,1.768],[2.619,2.03],[1.964,2.685],[1.833,2.685],[1.44,3.077],[0.917,3.339],[0.524,3.732],[0.393,3.732],[-0.655,4.518],[-1.179,4.78],[-1.44,4.78],[-2.226,4.387],[-2.75,4.387],[-3.012,4.125],[-3.274,2.685],[-2.75,2.423],[-2.488,2.161],[-1.571,1.768],[-1.31,1.506],[-1.048,1.506],[-0.393,1.113],[-0.131,1.113],[0.393,0.851],[1.048,0.851],[1.179,0.72],[1.571,0.72],[1.702,0.851],[2.357,0.851]],[[4.845,0.327],[5.369,0.589],[5.631,0.851],[5.631,1.113],[5.762,1.244],[5.631,1.637],[4.976,2.161],[4.452,2.03],[4.06,1.637],[4.06,1.375],[3.929,1.244],[4.06,1.113],[4.06,0.851],[4.452,0.458],[4.714,0.458]],[[7.333,0.851],[9.036,-0.72],[9.167,-0.72],[9.821,-1.375],[10.214,-1.244],[12.31,0.851],[12.44,0.851],[12.702,1.113],[12.702,1.244],[13.619,2.03],[13.619,2.161],[13.488,2.292],[12.31,2.292],[12.179,2.161],[11.393,2.161],[11.262,2.03],[9.821,1.768],[9.69,1.637],[9.429,1.637],[9.298,1.506],[9.036,1.506],[8.905,1.375],[8.643,1.375],[8.512,1.244],[8.25,1.244]],[[7.333,-3.47],[7.988,-2.946],[8.119,-2.946],[8.643,-2.423],[6.548,-0.589],[6.286,-0.589],[5.762,-0.982],[5.893,-1.244],[6.024,-2.685],[6.286,-3.077],[6.548,-3.077]],[[18.333,-5.042],[18.464,-5.173],[18.595,-5.042],[18.464,-4.911]],[[5.631,-6.22],[6.155,-6.089],[6.548,-5.696],[6.548,-5.435],[6.679,-5.304],[6.679,-5.173],[5.893,-4.518],[5.369,-4.649],[4.976,-5.042],[4.976,-5.696]],[[14.667,-6.482],[15.321,-6.482],[15.714,-6.089],[15.714,-5.173],[15.452,-4.911],[15.19,-4.911],[15.06,-4.78],[14.929,-4.911],[14.667,-4.911],[14.274,-5.304],[14.274,-5.696],[14.143,-5.827]],[[17.155,-6.744],[17.286,-6.875],[17.417,-6.744],[17.286,-6.613]],[[13.226,-13.946],[13.357,-14.077],[13.488,-13.946],[13.357,-13.815]],[[13.095,-14.077],[13.226,-14.208],[13.357,-14.077],[13.226,-13.946]],[[8.381,-14.994],[8.512,-15.125],[9.69,-15.125],[9.821,-15.256],[10.214,-15.256],[10.345,-15.125],[11.131,-15.125],[11.262,-14.994],[11.655,-14.994],[12.048,-14.732],[12.31,-14.732],[12.44,-14.601],[12.31,-14.47],[12.571,-14.601],[12.702,-14.47],[12.571,-14.339],[12.702,-14.47],[13.095,-14.339],[13.226,-14.208],[12.964,-14.077],[13.226,-13.946],[13.357,-13.685],[14.143,-12.899],[14.274,-12.506],[14.536,-12.244],[14.929,-11.458],[14.929,-11.065],[14.798,-10.935],[14.536,-11.196],[13.75,-11.589],[13.488,-11.589],[13.095,-11.851],[12.702,-11.851],[12.179,-12.113],[11.786,-12.113],[11.655,-12.244],[9.429,-12.244],[9.298,-12.113],[8.512,-11.982],[8.119,-11.72],[7.988,-11.851],[7.988,-12.244],[8.25,-12.768],[8.25,-13.554],[8.381,-13.685]]]},{"outline":[[-3.929,-20.232],[-4.714,-20.363],[-4.845,-20.494],[-6.679,-20.494],[-6.81,-20.363],[-7.595,-20.232],[-8.774,-19.577],[-10.083,-18.268],[-10.869,-16.827],[-11.655,-16.827],[-11.786,-16.696],[-12.702,-16.696],[-12.833,-16.565],[-13.226,-16.565],[-15.06,-15.649],[-16.107,-14.601],[-16.107,-14.47],[-16.631,-13.815],[-16.893,-12.899],[-17.155,-12.506],[-17.286,-10.804],[-16.631,-11.196],[-16.369,-11.196],[-16.238,-11.065],[-17.024,-10.673],[-17.286,-10.411],[-17.679,-10.28],[-18.464,-9.625],[-18.595,-9.625],[-20.036,-8.185],[-20.036,-8.054],[-20.429,-7.661],[-20.56,-7.268],[-20.821,-7.006],[-21.345,-5.958],[-21.345,-5.696],[-21.607,-5.304],[-21.738,-4.518],[-21.869,-4.387],[-21.869,-3.863],[-22,-3.732],[-22,-1.375],[-21.869,-1.244],[-21.738,-0.196],[-20.69,2.161],[-20.036,2.946],[-20.036,3.077],[-18.988,4.125],[-18.857,4.125],[-18.333,4.649],[-18.202,4.649],[-17.548,5.173],[-17.024,5.435],[-16.762,5.435],[-16.107,5.827],[-15.321,5.958],[-15.19,6.089],[-14.536,6.089],[-14.405,6.22],[-11.655,6.22],[-11.524,6.089],[-11.262,6.089],[-12.31,5.435],[-12.964,4.78],[-14.143,4.78],[-14.274,4.649],[-14.667,4.649],[-16.762,3.732],[-17.81,2.815],[-17.94,2.815],[-19.119,1.375],[-19.905,-0.196],[-19.905,-0.589],[-20.036,-0.72],[-20.036,-1.113],[-20.167,-1.244],[-20.167,-2.423],[-20.298,-2.554],[-20.298,-2.946],[-20.167,-3.077],[-20.167,-3.863],[-20.036,-3.994],[-20.036,-5.173],[-19.774,-5.565],[-19.774,-5.827],[-19.512,-6.351],[-18.595,-7.399],[-18.595,-7.53],[-17.81,-8.315],[-17.679,-8.315],[-16.893,-8.97],[-14.798,-10.018],[-14.536,-10.018],[-14.012,-10.28],[-13.619,-10.28],[-13.488,-10.411],[-12.833,-10.411],[-12.702,-10.542],[-11.524,-10.542],[-11.393,-10.411],[-11.393,-10.018],[-11.262,-9.887],[-11.131,-9.232],[-10.738,-8.577],[-10.083,-7.923],[-9.298,-7.53],[-9.429,-9.101],[-9.56,-9.232],[-9.56,-9.625],[-9.821,-10.018],[-9.821,-10.149],[-9.56,-10.28],[-9.56,-11.196],[-9.429,-11.327],[-9.429,-11.851],[-9.69,-11.851],[-10.083,-12.113],[-10.083,-13.815],[-9.952,-13.946],[-9.952,-14.732],[-9.69,-14.863],[-8.905,-14.47],[-8.643,-14.208],[-7.857,-15.125],[-7.726,-15.387],[-7.857,-15.649],[-8.774,-16.173],[-9.036,-16.173],[-9.298,-16.435],[-8.512,-17.744],[-8.119,-18.137],[-7.988,-18.137],[-7.333,-18.661],[-7.071,-18.661],[-6.679,-18.923],[-5.631,-18.923],[-5.5,-19.054],[-5.369,-18.923],[-4.845,-18.923],[-4.06,-18.53],[-3.143,-17.613],[-2.881,-17.089],[-2.881,-16.696],[-2.75,-16.565],[-2.75,-14.863],[-2.488,-14.47],[-2.488,-14.077],[-2.357,-13.946],[-2.357,-13.292],[-2.226,-13.161],[-2.095,-11.72],[-1.833,-12.244],[-1.833,-12.637],[-1.702,-12.768],[-1.702,-13.161],[-1.571,-13.292],[-1.571,-13.815],[-1.44,-13.946],[-1.44,-14.47],[-1.31,-14.601],[-1.31,-16.827],[-1.44,-16.958],[-1.571,-17.744],[-2.226,-18.923],[-3.012,-19.708]],"holes":[[[-16.369,-11.196],[-16.238,-11.327],[-15.976,-11.196],[-16.107,-11.065]],[[-11.262,-15.125],[-11.393,-14.994],[-11.393,-14.47],[-11.524,-14.339],[-11.524,-13.03],[-11.655,-12.899],[-11.655,-12.244],[-12.048,-11.982],[-13.357,-11.982],[-13.488,-11.851],[-14.012,-11.851],[-14.143,-11.72],[-14.536,-11.72],[-14.667,-11.589],[-15.321,-11.458],[-15.714,-11.196],[-15.976,-11.196],[-16.107,-11.327],[-15.845,-11.458],[-15.714,-11.72],[-15.714,-12.113],[-15.583,-12.244],[-15.321,-13.161],[-14.143,-14.47],[-13.095,-14.994],[-12.31,-15.125],[-12.179,-15.256],[-11.393,-15.256]]]}]');
const layout = {
  walls
};
const WORLD = layout;
function inside(x, y, polygon) {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i], b = polygon[j];
    if (a[1] > y !== b[1] > y && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) result = !result;
  }
  return result;
}
function edgeDistance(x, y, polygon) {
  let distance = Infinity;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i], b = polygon[(i + 1) % polygon.length], dx = b[0] - a[0], dy = b[1] - a[1];
    const t = THREE.MathUtils.clamp(((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1), 0, 1);
    distance = Math.min(distance, Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy));
  }
  return distance;
}
function logoClearance(point) {
  const x = point.x / LOGO_SCALE, y = (LOGO_CENTER_Y - point.y) / LOGO_SCALE;
  let planar = Infinity;
  for (const wall of WORLD.walls) {
    if (inside(x, y, wall.outline) && !wall.holes.some((hole) => inside(x, y, hole))) {
      planar = 0;
      break;
    }
    planar = Math.min(planar, edgeDistance(x, y, wall.outline), ...wall.holes.map((hole) => edgeDistance(x, y, hole)));
  }
  return Math.hypot(planar * LOGO_SCALE, Math.max(0, Math.abs(point.z) - LOGO_DEPTH / 2));
}
const CITY_BLOCKS = [[-115, -70], [114, -91], [111, 78], [-114, 88]].flatMap(([x, z], block) => [29, 57, 40, 22].map((height, i) => ({ x: x + (i % 2 ? 14 : -14), z: z + (i > 1 ? 18 : -18), height: height + (block * 7 + i * 3) % 17, width: 11 + (block * 3 + i * 5) % 8, depth: 12 + (block * 5 + i * 3) % 7 })));
const BUILDING_BOUNDS = CITY_BLOCKS.map((b) => new THREE.Box3(
  new THREE.Vector3(b.x - (b.width + 5) / 2, -3, b.z - (b.depth + 5) / 2),
  new THREE.Vector3(b.x + (b.width + 5) / 2, b.height + 5, b.z + (b.depth + 5) / 2)
));
const STATION_MIN = new THREE.Vector3(-5.6, -1.3, -7.8);
const STATION_MAX = new THREE.Vector3(5.6, 5.6, 7.2);
const DEFAULT_STOP_FRACTIONS = [0.138, 0.223, 0.386, 0.472, 0.667, 0.806, 0.966];
const WAYPOINT_MIN = new THREE.Vector3(-3.6, -1, -2.5);
const WAYPOINT_MAX = new THREE.Vector3(3.6, 3.6, 2.5);
function candidatesFor(track, { kind = "event" } = {}) {
  const scenic = kind === "waypoint";
  const length = track.getLength();
  const divisions = Math.ceil(length / 1.5);
  const samples = Array.from({ length: divisions + 1 }, (_, i) => track.getPointAt(i / divisions));
  const candidates = [];
  for (let distance = scenic ? 3 : 35; distance < length - (scenic ? 3 : 35); distance += 4) {
    const f = sampleTrack(track, distance, length);
    if (Math.abs(f.tangent.y) > (scenic ? 0.6 : 0.22) || Math.abs(f.curvature) > (scenic ? 0.08 : 0.026)) continue;
    const matrix = new THREE.Matrix4().makeBasis(f.side, f.up, f.tangent.clone().negate()).setPosition(f.point);
    const bounds = new THREE.Box3((scenic ? WAYPOINT_MIN : STATION_MIN).clone(), (scenic ? WAYPOINT_MAX : STATION_MAX).clone()).applyMatrix4(matrix);
    if (bounds.min.z < LOGO_DEPTH / 2 + 2 && bounds.max.z > -LOGO_DEPTH / 2 - 2) continue;
    if (BUILDING_BOUNDS.some((building) => building.intersectsBox(bounds))) continue;
    const inverse = matrix.clone().invert(), local = new THREE.Vector3();
    let valid = true;
    for (let i = 0; i < samples.length; i++) {
      const along = i / (samples.length - 1) * length;
      if (trackSeparation(along, distance, length) < 16) {
        local.copy(samples[i]).applyMatrix4(inverse);
        if (Math.abs(local.z) < (scenic ? 2.5 : 6.5) && (Math.abs(local.x) > 0.55 || Math.abs(local.y) > 0.6)) {
          valid = false;
          break;
        }
      } else if (bounds.distanceToPoint(samples[i]) < 2.2) {
        valid = false;
        break;
      }
    }
    if (valid) candidates.push({ distance, radius: scenic ? 12 : 22, name: "Trackside terrace", point: f.point.clone(), bounds, kind });
  }
  return candidates;
}
function maxStopGap(stops, length) {
  const distances = stops.map((stop) => stop.distance).sort((a, b) => a - b);
  return distances.length ? Math.max(...distances.map((distance, i) => (distances[i + 1] ?? distances[0] + length) - distance)) : length;
}
function fillWaypoints(anchors, candidates, length, { reserve = 150, minSeparation = 40, maxStops = Math.max(12, anchors.length) } = {}) {
  if (!anchors.length || anchors.length >= maxStops || maxStopGap(anchors, length) <= reserve) return [...anchors];
  const origin = anchors[0].distance;
  const valid = candidates.filter((c) => anchors.every((a) => trackSeparation(c.distance, a.distance, length) > minSeparation && !c.bounds.intersectsBox(a.bounds)));
  const nodes = [...anchors, ...valid].map((stop) => ({ stop, at: wrapDistance(stop.distance - origin, length), anchor: anchors.includes(stop) })).sort((a, b) => a.at - b.at);
  nodes.push({ ...nodes[0], at: length });
  const end = nodes.length - 1;
  const edges = nodes.map((node, i) => {
    const result = [];
    for (let j = i + 1; j <= end; j++) {
      if (nodes[j].at - node.at > minSeparation && (j === end || !node.stop.bounds.intersectsBox(nodes[j].stop.bounds))) result.push(j);
      if (nodes[j].anchor) break;
    }
    return result;
  });
  function solve(gap, limit) {
    const remaining = Array(nodes.length).fill(Infinity);
    remaining[end] = 0;
    for (let i = end - 1; i >= 0; i--) for (const j of edges[i]) if (nodes[j].at - nodes[i].at <= gap) remaining[i] = Math.min(remaining[i], 1 + remaining[j]);
    if (remaining[0] > limit) return null;
    const path = [0];
    function visit(i) {
      if (i === end) return true;
      const choices = edges[i].filter((j) => nodes[j].at - nodes[i].at <= gap && path.length + remaining[j] <= limit);
      choices.sort((a, b) => remaining[a] - remaining[b] || a - b);
      for (const j of choices) {
        if (j !== end && path.some((p) => nodes[p].stop.bounds.intersectsBox(nodes[j].stop.bounds))) continue;
        path.push(j);
        if (visit(j)) return true;
        path.pop();
      }
      return false;
    }
    return visit(0) ? path.slice(1, -1).filter((i) => !nodes[i].anchor).map((i) => nodes[i].stop) : null;
  }
  let additions = solve(reserve, maxStops);
  let target = reserve;
  if (!additions) {
    const gaps = [...new Set(edges.flatMap((targets, i) => targets.map((j) => nodes[j].at - nodes[i].at)))].sort((a, b) => a - b);
    let low = 0, high = gaps.length - 1;
    while (low < high) {
      const mid = low + high >>> 1;
      if (solve(gaps[mid], maxStops)) high = mid;
      else low = mid + 1;
    }
    target = gaps[low];
    additions = solve(target, maxStops);
  }
  for (let count = Math.max(anchors.length, Math.ceil(length / target)); count < maxStops; count++) {
    const fewer = solve(target, count);
    if (fewer) {
      additions = fewer;
      break;
    }
  }
  const names = ["Crown viewpoint", "Mint portal", "Garden junction", "Skyline viewpoint", "Connection portal", "Canopy junction"];
  return [...anchors, ...(additions ?? []).map((stop, i) => ({ ...stop, kind: "waypoint", name: names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : "") }))];
}
function createStationPlanner(track, { minSeparation = 48 } = {}) {
  const length = track.getLength(), candidates = candidatesFor(track);
  let scenicCandidates;
  function next(existing, preferred) {
    const valid = candidates.filter((candidate) => existing.every((stop) => trackSeparation(candidate.distance, stop.distance, length) > minSeparation && !candidate.bounds.intersectsBox(stop.bounds)));
    valid.sort((a, b) => preferred !== void 0 ? Math.abs(a.distance / length - preferred) - Math.abs(b.distance / length - preferred) : Math.min(...existing.map((s) => trackSeparation(b.distance, s.distance, length))) - Math.min(...existing.map((s) => trackSeparation(a.distance, s.distance, length))));
    return valid[0] ?? null;
  }
  function defaults(reserved = []) {
    const result = [];
    const names = ["West lookout", "Crown lookout", "East passage", "East observatory", "Lower lookout", "Arrival gardens", "Return gardens"];
    DEFAULT_STOP_FRACTIONS.forEach((fraction, i) => {
      const placement = next([...reserved, ...result], fraction);
      if (!placement) throw new Error("No clear default platform position.");
      result.push({ ...placement, name: names[i] });
    });
    return result;
  }
  function forEvents(events) {
    const reserved = [];
    const saved = events.map((event, index) => {
      const placement = index >= DEFAULT_STOP_FRACTIONS.length && event?.trackPosition !== void 0 ? candidates.find((candidate) => Math.abs(candidate.distance / length - event.trackPosition) < 1e-9) : void 0;
      if (!placement || reserved.some((other) => trackSeparation(other.distance, placement.distance, length) <= minSeparation || other.bounds.intersectsBox(placement.bounds))) return null;
      reserved.push(placement);
      return placement;
    });
    const anchors = defaults(reserved), occupied = [...anchors, ...reserved];
    return events.map((event, index) => {
      if (index < anchors.length) return anchors[index];
      if (saved[index]) return saved[index];
      const placement = next(occupied, event?.trackPosition);
      if (placement) occupied.push(placement);
      return placement;
    });
  }
  return { next, defaults, candidates, forEvents, fillWaypoints: (anchors, options) => fillWaypoints(anchors, scenicCandidates ??= candidatesFor(track, { kind: "waypoint" }), length, options) };
}
function batchInstances(parent, geometry, material, matrices, cellSize = 45) {
  const cells = /* @__PURE__ */ new Map();
  for (const matrix of matrices) {
    const e = matrix.elements, key = `${Math.floor(e[12] / cellSize)},${Math.floor(e[13] / cellSize)},${Math.floor(e[14] / cellSize)}`;
    const cell = cells.get(key) ?? [];
    cell.push(matrix);
    cells.set(key, cell);
  }
  const batches = [];
  for (const cell of cells.values()) {
    const mesh = new THREE.InstancedMesh(geometry, material, cell.length);
    cell.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
    mesh.computeBoundingBox();
    mesh.computeBoundingSphere();
    mesh.matrixAutoUpdate = false;
    parent.add(mesh);
    batches.push(mesh);
  }
  return batches;
}
function disposeObject(root, retained) {
  const geometries = /* @__PURE__ */ new Set(), materials = /* @__PURE__ */ new Set(), textures = /* @__PURE__ */ new Set();
  root.traverse((object) => {
    const mesh = object;
    if (mesh instanceof THREE.InstancedMesh) mesh.dispose();
    if (mesh.geometry) geometries.add(mesh.geometry);
    if (mesh.material) (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((material) => materials.add(material));
  });
  materials.forEach((material) => {
    if (retained?.materials.has(material)) return;
    Object.values(material).forEach((value) => {
      if (value instanceof THREE.Texture) textures.add(value);
    });
    material.dispose();
  });
  textures.forEach((texture) => texture.dispose());
  geometries.forEach((geometry) => {
    if (!retained?.geometries.has(geometry)) geometry.dispose();
  });
  root.removeFromParent();
}
function segmentInBox(a, b, min, max) {
  let enter = 0, leave = 1;
  for (const axis of ["x", "y", "z"]) {
    const delta = b[axis] - a[axis];
    if (Math.abs(delta) < 1e-9) {
      if (a[axis] < min[axis] || a[axis] > max[axis]) return false;
    } else {
      const first = (min[axis] - a[axis]) / delta, last = (max[axis] - a[axis]) / delta;
      enter = Math.max(enter, Math.min(first, last));
      leave = Math.min(leave, Math.max(first, last));
      if (enter > leave) return false;
    }
  }
  return true;
}
function createRideEnvelope(track, spacing = 0.9) {
  const length = track.getLength(), count = Math.ceil(length / spacing), step = length / count;
  const samples = Array.from({ length: count }, (_, i) => ({ distance: i * step, ...sampleTrack(track, i * step, length) }));
  const localA = new THREE.Vector3(), localB = new THREE.Vector3(), delta = new THREE.Vector3();
  const min = new THREE.Vector3(), max = new THREE.Vector3(), bounds = new THREE.Box3();
  function intersects(start, end, radius, attachment) {
    bounds.setFromPoints([start, end]).expandByScalar(radius + 4);
    min.set(-1.4 - radius, -0.5 - radius, -step - radius);
    max.set(1.4 + radius, 2.85 + radius, step + radius);
    for (const f of samples) {
      if (!bounds.containsPoint(f.point)) continue;
      if (attachment !== void 0 && trackSeparation(f.distance, attachment, length) < 4) continue;
      delta.copy(start).sub(f.point);
      localA.set(delta.dot(f.side), delta.dot(f.up), delta.dot(f.tangent));
      delta.copy(end).sub(f.point);
      localB.set(delta.dot(f.side), delta.dot(f.up), delta.dot(f.tangent));
      if (segmentInBox(localA, localB, min, max)) return true;
    }
    return false;
  }
  return { intersects };
}
function createTrackSupports(track) {
  const length = track.getLength(), envelope = createRideEnvelope(track), supports = [];
  const probe = new THREE.Vector3(), bounds = new THREE.Box3();
  function clear(part) {
    if (envelope.intersects(part.start, part.end, part.radius + 0.06, part.attachment)) return false;
    bounds.setFromPoints([part.start, part.end]).expandByScalar(part.radius + 0.1);
    if (BUILDING_BOUNDS.some((building) => building.intersectsBox(bounds))) return false;
    if (bounds.min.z > LOGO_DEPTH / 2 || bounds.max.z < -LOGO_DEPTH / 2) return true;
    const samples = Math.ceil(part.start.distanceTo(part.end) / 1.5);
    for (let i = 0; i <= samples; i++) {
      probe.lerpVectors(part.start, part.end, i / Math.max(1, samples));
      if (logoClearance(probe) < part.radius + 0.85) return false;
    }
    return true;
  }
  for (let distance = 12; distance < length; distance += 32) {
    const f = sampleTrack(track, distance, length), underside = f.point.clone().addScaledVector(f.up, -1.05);
    const saddle = { start: underside, end: f.point.clone().addScaledVector(f.up, -0.54), radius: 0.1, attachment: distance, kind: "saddle" };
    if (!clear(saddle)) continue;
    for (const offset of [3.2, 4.4, 5.6]) {
      const assembly = [];
      for (const side of [-1, 1]) {
        const top = underside.clone().addScaledVector(f.side, side * offset), foot = new THREE.Vector3(top.x, -2.8, top.z);
        const column = { start: foot, end: top, radius: 0.19, kind: "column" };
        const beam = { start: top, end: underside, radius: 0.13, kind: "beam" };
        if (clear(column) && clear(beam)) assembly.push(column, beam);
      }
      if (assembly.length) {
        supports.push(...assembly, saddle);
        break;
      }
    }
  }
  return supports;
}
const MINT = "#c3e5c8";
function simplifyContour(points) {
  const ring = [...points, points[0]], keep = /* @__PURE__ */ new Set([0, points.length]);
  const pending = [[0, points.length]];
  const toleranceSquared = 0.1 ** 2;
  while (pending.length) {
    const [first, last] = pending.pop();
    const a = ring[first], b = ring[last], dx = b[0] - a[0], dy = b[1] - a[1];
    const lengthSquared = dx * dx + dy * dy;
    let farthest = -1, maximum = toleranceSquared;
    for (let i = first + 1; i < last; i++) {
      const point = ring[i];
      const t = lengthSquared ? THREE.MathUtils.clamp(((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / lengthSquared, 0, 1) : 0;
      const distance = (point[0] - a[0] - t * dx) ** 2 + (point[1] - a[1] - t * dy) ** 2;
      if (distance > maximum) {
        maximum = distance;
        farthest = i;
      }
    }
    if (farthest !== -1) {
      keep.add(farthest);
      pending.push([first, farthest], [farthest, last]);
    }
  }
  const simplified = [...keep].sort((a, b) => a - b).slice(0, -1).map((index) => ring[index]);
  return simplified.length >= 3 ? simplified : points;
}
function roundedContour(path, outline) {
  const points = simplifyContour(outline).map(([x, z]) => new THREE.Vector2(x, -z));
  points.forEach((point, index) => {
    const previous = points[(index + points.length - 1) % points.length], next = points[(index + 1) % points.length];
    const before = point.distanceTo(previous), after = point.distanceTo(next);
    const radius = Math.min(0.12, before * 0.2, after * 0.2);
    const entry = point.clone().lerp(previous, before ? radius / before : 0);
    const exit = point.clone().lerp(next, after ? radius / after : 0);
    if (index === 0) path.moveTo(entry.x, entry.y);
    else path.lineTo(entry.x, entry.y);
    path.quadraticCurveTo(point.x, point.y, exit.x, exit.y);
  });
  path.closePath();
  return path;
}
function shape(outline, holes = []) {
  const result = roundedContour(new THREE.Shape(), outline);
  result.holes = holes.map((hole) => roundedContour(new THREE.Path(), hole));
  return result;
}
function createVerticalLogo() {
  const bevel = 0.16;
  const pieces = WORLD.walls.map((wall) => new THREE.ExtrudeGeometry(shape(wall.outline, wall.holes), {
    // Dense traced curves need only one corner sample and one bevel ring.
    depth: LOGO_DEPTH - bevel * 2,
    steps: 1,
    curveSegments: 1,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelThickness: bevel,
    bevelSize: 0.055,
    bevelOffset: -0.055
  }).translate(0, 0, bevel));
  const geometry = mergeGeometries(pieces);
  pieces.forEach((piece) => piece.dispose());
  geometry.scale(LOGO_SCALE, LOGO_SCALE, 1);
  toCreasedNormals(geometry, Math.PI / 2 + 1e-3);
  const positions = geometry.getAttribute("position"), normals = geometry.getAttribute("normal");
  for (let i = 0; i < positions.count; i++) {
    const z = positions.getZ(i);
    if (Math.abs(z) < 1e-6) normals.setXYZ(i, 0, 0, -1);
    else if (Math.abs(z - LOGO_DEPTH) < 1e-6) normals.setXYZ(i, 0, 0, 1);
  }
  geometry.normalizeNormals();
  geometry.computeBoundingSphere();
  const material = new THREE.MeshStandardMaterial({
    color: "#061c11",
    emissive: "#0a2918",
    emissiveIntensity: 0.25,
    metalness: 0.2,
    roughness: 0.65,
    // Keep the outline visible on the surface without moving the geometry.
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1
  });
  const logo = new THREE.Mesh(geometry, material);
  const edges = new THREE.EdgesGeometry(geometry, 20);
  const neon = new THREE.LineBasicMaterial({
    color: new THREE.Color("#79ffa0").multiplyScalar(2.5),
    depthWrite: false
  });
  const outline = new THREE.LineSegments(edges, neon);
  outline.name = "Nucleus neon outline";
  outline.renderOrder = 1;
  logo.add(outline);
  logo.name = "Neon-edged Nucleus sculpture";
  logo.userData.logoObstacle = true;
  logo.position.set(0, LOGO_CENTER_Y, -LOGO_DEPTH / 2);
  return logo;
}
function railGeometry(frames, offset, height, radius) {
  const sides = 5, vertices = [], indices = [];
  frames.forEach((f, i) => {
    for (let j = 0; j < sides; j++) {
      const angle = j / sides * Math.PI * 2;
      const p = f.point.clone().addScaledVector(f.side, offset + Math.cos(angle) * radius).addScaledVector(f.up, height + Math.sin(angle) * radius);
      vertices.push(p.x, p.y, p.z);
      if (i) {
        const a = (i - 1) * sides + j, b = (i - 1) * sides + (j + 1) % sides, c = i * sides + j, d = i * sides + (j + 1) % sides;
        indices.push(a, c, b, b, c, d);
      }
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
function createCoasterCart() {
  const cart = new THREE.Group();
  cart.name = "Mint runner cart";
  const shell = new THREE.MeshPhysicalMaterial({ color: "#173426", metalness: 0.45, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.16 });
  const upholstery = new THREE.MeshStandardMaterial({ color: "#091e16", metalness: 0.1, roughness: 0.78 });
  const neon = new THREE.MeshStandardMaterial({ color: MINT, emissive: MINT, emissiveIntensity: 0.8, metalness: 0.9, roughness: 0.3 });
  const addParts = (name, parts, material) => {
    const geometries = parts.map((part) => {
      if (!part.index) return part;
      const geometry2 = part.toNonIndexed();
      part.dispose();
      return geometry2;
    });
    const geometry = mergeGeometries(geometries);
    geometries.forEach((part) => part.dispose());
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    cart.add(mesh);
  };
  const outline = new THREE.Shape().moveTo(0, 1.23).bezierCurveTo(0.32, 1.23, 0.58, 1, 0.63, 0.6).lineTo(0.63, -0.16).quadraticCurveTo(0.63, -0.43, 0.36, -0.43).lineTo(-0.36, -0.43).quadraticCurveTo(-0.63, -0.43, -0.63, -0.16).lineTo(-0.63, 0.6).bezierCurveTo(-0.58, 1, -0.32, 1.23, 0, 1.23).closePath();
  const hull = new THREE.ExtrudeGeometry(outline, {
    depth: 0.18,
    steps: 1,
    curveSegments: 8,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.07,
    bevelSegments: 3
  }).rotateX(-Math.PI / 2).translate(0, 0.21, 0);
  toCreasedNormals(hull, Math.PI / 3);
  addParts("Glossy hull and side pods", [hull, ...[-1, 1].map((side) => new THREE.CapsuleGeometry(0.14, 1.05, 4, 10).rotateX(Math.PI / 2).translate(side * 0.53, 0.5, -0.3))], shell);
  addParts("Recessed cockpit seat", [
    new THREE.CapsuleGeometry(0.24, 0.5, 4, 10).rotateZ(Math.PI / 2).scale(1, 0.24, 1.1).translate(0, 0.48, 0),
    new THREE.CapsuleGeometry(0.22, 0.48, 4, 10).rotateZ(Math.PI / 2).scale(1, 0.95, 0.26).rotateX(-0.12).translate(0, 0.73, 0.3)
  ], upholstery);
  const tube = (points, radius, segments) => new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z))),
    segments,
    radius,
    6,
    false
  );
  addParts("Mint safety hoop and running lights", [
    tube([[-0.53, 0.53, -0.62], [-0.52, 0.77, -0.86], [-0.42, 0.87, -0.98], [0, 0.88, -1], [0.42, 0.87, -0.98], [0.52, 0.77, -0.86], [0.53, 0.53, -0.62]], 0.033, 24),
    ...[-1, 1].map((side) => tube([[side * 0.635, 0.595, 0.2], [side * 0.655, 0.595, -0.3], [side * 0.635, 0.595, -0.8]], 0.014, 16)),
    tube([[-0.28, 0.5, -1.12], [0, 0.5, -1.18], [0.28, 0.5, -1.12]], 0.022, 12)
  ], neon);
  return cart;
}
function createScenery(scene, track, coarse) {
  const length = track.getLength();
  const dark = new THREE.MeshStandardMaterial({ color: "#173426", metalness: 0.3, roughness: 0.6 });
  const railMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(MINT).multiplyScalar(0.9) });
  const distantRailMaterial = new THREE.LineBasicMaterial({ color: new THREE.Color("#9acba7").multiplyScalar(0.9) });
  const box = new THREE.BoxGeometry(1, 1, 1), dummy = new THREE.Object3D(), basis = new THREE.Matrix4();
  const matrix = (x, y, z, w, h, d) => {
    dummy.position.set(x, y, z);
    dummy.quaternion.identity();
    dummy.scale.set(w, h, d);
    dummy.updateMatrix();
    return dummy.matrix.clone();
  };
  scene.add(createVerticalLogo());
  const ground = new THREE.GridHelper(800, 100, "#264b35", "#10271b");
  ground.position.y = -3;
  scene.add(ground);
  const groundColors = ground.geometry.getAttribute("color"), groundPositions = ground.geometry.getAttribute("position");
  for (let i = 0; i < groundColors.count; i++) {
    const fade = Math.max(0, 1 - Math.hypot(groundPositions.getX(i), groundPositions.getZ(i)) / 400);
    groundColors.setXYZ(i, groundColors.getX(i) * fade, groundColors.getY(i) * fade, groundColors.getZ(i) * fade);
  }
  const terrainGeometry = new THREE.CircleGeometry(480, 64), terrainColors = new Float32Array(terrainGeometry.attributes.position.count * 3);
  const terrainTint = new THREE.Color("#0b2016");
  terrainColors.set(terrainTint.toArray(), 0);
  terrainGeometry.setAttribute("color", new THREE.BufferAttribute(terrainColors, 3));
  const terrain = new THREE.Mesh(terrainGeometry, new THREE.MeshBasicMaterial({ vertexColors: true }));
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -3.1;
  scene.add(terrain);
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = 256;
  glowCanvas.height = 256;
  const ctx = glowCanvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, "rgba(112, 155, 126, 0.45)");
    gradient.addColorStop(1, "rgba(112, 155, 126, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const glowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(240, 240),
      new THREE.MeshBasicMaterial({
        map: glowTexture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    glowPlane.name = "Nucleus floor glow";
    glowPlane.rotation.x = -Math.PI / 2;
    glowPlane.position.set(0, -2.9, -LOGO_DEPTH / 2);
    scene.add(glowPlane);
  }
  const dais = new THREE.Mesh(new THREE.TorusGeometry(44, 0.07, 4, 100), railMaterial);
  dais.rotation.x = Math.PI / 2;
  dais.position.y = -2.6;
  scene.add(dais);
  const divisions = Math.ceil(length / 1.1);
  const frames = Array.from({ length: divisions + 1 }, (_, i) => sampleTrack(track, length * i / divisions, length));
  const railLevels = [], mapRailParts = [];
  for (let start = 0; start < divisions; start += 64) {
    const section = frames.slice(start, Math.min(divisions + 1, start + 65));
    const near = new THREE.Group(), lod = new THREE.LOD();
    const center = section[Math.floor(section.length / 2)].point;
    const rails = [-0.68, 0.68].map((offset) => railGeometry(section, offset, 0, 0.1));
    const paired = mergeGeometries(rails);
    rails.forEach((geometry) => geometry.dispose());
    paired.translate(-center.x, -center.y, -center.z);
    near.add(new THREE.Mesh(paired, railMaterial));
    const spine = railGeometry(section, 0, -0.32, 0.16).translate(-center.x, -center.y, -center.z);
    near.add(new THREE.Mesh(spine, dark));
    const segments = [];
    for (const offset of [-0.68, 0.68]) for (let i = 1; i < section.length; i++) {
      for (const f of [section[i - 1], section[i]]) segments.push(f.point.clone().addScaledVector(f.side, offset).sub(center));
    }
    const far = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(segments), distantRailMaterial);
    mapRailParts.push(far.geometry.clone().translate(center.x, center.y, center.z));
    lod.position.copy(center);
    lod.addLevel(near, 0);
    lod.addLevel(far, coarse ? 65 : 100, 0.12);
    scene.add(lod);
    railLevels.push(lod);
  }
  const mapRails = new THREE.LineSegments(mergeGeometries(mapRailParts), distantRailMaterial);
  mapRailParts.forEach((geometry) => geometry.dispose());
  mapRails.name = "Overview rails";
  mapRails.visible = false;
  scene.add(mapRails);
  const sleepers = [], supports = [], supportFeet = [];
  for (let distance = 0; distance <= length; distance += 1.15) {
    const f = sampleTrack(track, distance, length);
    dummy.position.copy(f.point).addScaledVector(f.up, -0.09);
    basis.makeBasis(f.side, f.up, f.tangent.clone().negate());
    dummy.quaternion.setFromRotationMatrix(basis);
    dummy.scale.set(2.05, 0.12, 0.19);
    dummy.updateMatrix();
    sleepers.push(dummy.matrix.clone());
  }
  const vertical = new THREE.Vector3(0, 1, 0), direction = new THREE.Vector3();
  for (const part of createTrackSupports(track)) {
    direction.subVectors(part.end, part.start);
    dummy.position.copy(part.start).add(part.end).multiplyScalar(0.5);
    dummy.quaternion.setFromUnitVectors(vertical, direction.clone().normalize());
    dummy.scale.set(part.radius, direction.length(), part.radius);
    dummy.updateMatrix();
    supports.push(dummy.matrix.clone());
    if (part.kind === "column") supportFeet.push(matrix(part.start.x, -2.85, part.start.z, 0.8, 0.3, 0.8));
  }
  const rideSupports = new THREE.Group(), mapSupports = new THREE.Group();
  const supportGeometry = new THREE.CylinderGeometry(1, 1, 1, 6);
  const supportBases = [matrix(0, -1.5, 0, 78, 3, 13), ...supportFeet];
  for (const [group, cellSize] of [[rideSupports, 45], [mapSupports, 120]]) {
    batchInstances(group, supportGeometry, dark, supports, cellSize);
    batchInstances(group, box, dark, supportBases, cellSize);
  }
  mapSupports.visible = false;
  scene.add(rideSupports, mapSupports);
  const sleeperBatches = batchInstances(scene, box, dark, sleepers, 32);
  const gates = new THREE.Group();
  scene.add(gates);
  const gateRecords = [];
  const gateGeometry = new THREE.TorusGeometry(3.65, 0.055, 4, 40, Math.PI * 1.72);
  for (let distance = 22; distance < length; distance += 70) {
    const f = sampleTrack(track, distance, length);
    if (logoClearance(f.point) < 9) continue;
    const mesh = new THREE.Mesh(gateGeometry, railMaterial);
    mesh.position.copy(f.point).addScaledVector(f.up, 1.8);
    basis.makeBasis(f.side, f.up, f.tangent.clone().negate());
    mesh.quaternion.setFromRotationMatrix(basis);
    gates.add(mesh);
    gateRecords.push({ mesh, distance });
  }
  const cart = createCoasterCart(), player = new THREE.Group();
  scene.add(cart, player);
  player.add(new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 6), railMaterial));
  const beacons = /* @__PURE__ */ new Map();
  const beaconDistances = /* @__PURE__ */ new Map();
  const stationBox = box;
  const retained = { geometries: /* @__PURE__ */ new Set([stationBox]), materials: /* @__PURE__ */ new Set([dark, railMaterial]) };
  function syncGates() {
    gateRecords.forEach((gate) => {
      gate.mesh.visible = ![...beaconDistances.values()].some((distance) => Math.min(Math.abs(gate.distance - distance), length - Math.abs(gate.distance - distance)) < 22);
    });
  }
  let level = coarse ? 1 : 2;
  function addStation(id, stop, index, title, kind = "event") {
    if (beacons.has(id)) return;
    const f = sampleTrack(track, stop.distance, length), beacon = new THREE.Group();
    beacon.name = `Station ${index + 1}: ${title}`;
    beacon.position.copy(f.point);
    basis.makeBasis(f.side, f.up, f.tangent.clone().negate());
    beacon.quaternion.setFromRotationMatrix(basis);
    const structural = [], lights = [];
    if (kind === "waypoint") {
      const waypointGeometry = new THREE.OctahedronGeometry(0.48);
      for (const side of [-1, 1]) {
        structural.push(matrix(side * 2.8, -0.5, 0, 1.2, 0.3, 3.8), matrix(side * 2.8, 1.2, 0, 0.14, 2.6, 0.14));
        lights.push(matrix(side * 2.8, -0.3, 0, 0.07, 0.07, 3.8));
        const gem = new THREE.Mesh(waypointGeometry, railMaterial);
        gem.position.set(side * 2.8, 2.9, 0);
        beacon.add(gem);
      }
    } else {
      for (const side of [-1, 1]) {
        structural.push(matrix(side * 3.3, -0.65, 0, 3.2, 0.35, 12));
        lights.push(matrix(side * 1.74, -0.45, 0, 0.07, 0.07, 12));
        for (const z of [-5.4, 5.4]) structural.push(matrix(side * 4.55, 1.9, z, 0.2, 4.6, 0.2));
      }
      structural.push(matrix(0, 4.5, 0, 10, 0.2, 13));
      lights.push(matrix(0, 4.35, 0, 1.3, 0.06, 10));
    }
    batchInstances(beacon, stationBox, dark, structural, 100);
    batchInstances(beacon, stationBox, railMaterial, lights, 100);
    const label = document.createElement("canvas");
    label.width = 512;
    label.height = 128;
    const context = label.getContext("2d");
    if (context && kind === "event") {
      context.fillStyle = "#06140c";
      context.fillRect(0, 0, 512, 128);
      context.strokeStyle = MINT;
      context.strokeRect(2, 2, 508, 124);
      context.fillStyle = MINT;
      context.textAlign = "center";
      context.font = "16px sans-serif";
      context.fillText(`STATION ${String(index + 1).padStart(2, "0")}`, 256, 34);
      context.font = "24px sans-serif";
      context.fillText(title.length > 34 ? `${title.slice(0, 33)}…` : title, 256, 83, 470);
      const texture = new THREE.CanvasTexture(label);
      texture.colorSpace = THREE.SRGBColorSpace;
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 1.65), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }));
      sign.position.set(0, 3.3, -5.8);
      beacon.add(sign);
    }
    beacon.traverse((object) => {
      object.updateMatrix();
      object.matrixAutoUpdate = false;
    });
    scene.add(beacon);
    beacons.set(id, beacon);
    beaconDistances.set(id, stop.distance);
    syncGates();
  }
  scene.traverse((object) => {
    if (object !== scene && object !== cart && object !== player) {
      object.updateMatrix();
      object.matrixAutoUpdate = false;
    }
  });
  return {
    cart,
    player,
    addStation,
    removeStation(id) {
      const beacon = beacons.get(id);
      if (beacon) {
        disposeObject(beacon, retained);
        beacons.delete(id);
        beaconDistances.delete(id);
        syncGates();
      }
    },
    setQuality(value) {
      level = value;
      railLevels.forEach((lod) => {
        lod.levels[1].distance = [40, 65, 100][value];
      });
    },
    update(_elapsed, _reduced, mapBlend, camera) {
      const overview = mapBlend > 0.85;
      if (mapRails.visible !== overview) {
        mapRails.visible = overview;
        rideSupports.visible = !overview;
        mapSupports.visible = overview;
        railLevels.forEach((lod) => {
          lod.visible = !overview;
        });
      }
      gates.visible = level > 0 && mapBlend < 0.85;
      cart.visible = mapBlend < 0.15;
      player.visible = mapBlend > 0.5;
      for (const batch of sleeperBatches) batch.visible = mapBlend < 0.85 && batch.boundingSphere.center.distanceToSquared(camera.position) < (level === 2 ? 100 : 55) ** 2;
    }
  };
}
function createRideMap(track) {
  const project = (point) => ({ x: point.x + point.z * 0.14, y: -point.y + point.z * 0.32 });
  const route = track.getPoints(500).map(project);
  const contours = WORLD.walls.map((wall) => [wall.outline, ...wall.holes].map((outline) => outline.map(([x, z]) => project({ x: x * LOGO_SCALE, y: LOGO_CENTER_Y - z * LOGO_SCALE, z: 0 }))));
  const points = [...route, ...contours.flat(2)];
  const minX = Math.min(...points.map((p) => p.x)), minY = Math.min(...points.map((p) => p.y));
  const spanX = Math.max(...points.map((p) => p.x)) - minX, spanY = Math.max(...points.map((p) => p.y)) - minY;
  const scale = Math.min(192 / spanX, 142 / spanY);
  const normalize = (p) => ({ x: (p.x - minX - spanX / 2) * scale + 120, y: (p.y - minY - spanY / 2) * scale + 95 });
  const path = (line) => line.map((p, i) => {
    const n = normalize(p);
    return `${i ? "L" : "M"}${n.x.toFixed(2)},${n.y.toFixed(2)}`;
  }).join(" ") + " Z";
  return {
    project: (point) => normalize(project(point)),
    layout: (stations) => ({ route: path(route), logo: contours.map((wall) => wall.map(path).join(" ")), stations: stations.map((p) => p ? normalize(project(p)) : null), start: normalize(route[0]) })
  };
}
function createRidePostprocessing(renderer) {
  const supported = renderer.extensions.has("EXT_color_buffer_float");
  let target = null;
  let level = 0;
  const uniforms = {
    sceneColor: { value: null },
    sceneDepth: { value: null },
    texel: { value: new THREE.Vector2(1, 1) },
    cameraNear: { value: 0.15 },
    cameraFar: { value: 1800 },
    focusDistance: { value: 35 },
    dofStrength: { value: 0 },
    bloomStrength: { value: 0.12 }
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    defines: { USE_DOF: 0, GLOW_SAMPLES: 4 },
    depthTest: false,
    depthWrite: false,
    vertexShader: `varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D sceneColor;
      uniform vec2 texel;
      uniform float cameraNear, cameraFar, focusDistance, dofStrength, bloomStrength;
      #if USE_DOF == 1
      uniform sampler2D sceneDepth;
      float distanceAt(vec2 uv) {
        float depth = texture2D(sceneDepth, uv).r;
        return cameraNear * cameraFar / (cameraFar - depth * (cameraFar - cameraNear));
      }
      #endif
      vec3 highlight(vec3 color) {
        float brightness = max(max(color.r, color.g), color.b);
        return color * smoothstep(.85, 1.3, brightness);
      }
      void main() {
        vec3 sharp = texture2D(sceneColor, vUv).rgb;
        float coc = 0.0;
        #if USE_DOF == 1
        float distance = distanceAt(vUv);
        // Only the distant world softens. The trolley, near rails and UI stay sharp.
        coc = smoothstep(focusDistance, focusDistance + 90.0, distance) * dofStrength;
        #endif
        vec2 radius = texel * (2.0 + coc * 3.0);
        vec3 blur = sharp * 2.0;
        vec3 glow = highlight(sharp) * 2.0;
        float weight = 2.0;
        for (int i = 0; i < GLOW_SAMPLES; i++) {
          float angle = float(i) * (6.283185307 / float(GLOW_SAMPLES));
          vec2 uv = clamp(vUv + vec2(cos(angle), sin(angle)) * radius, texel * .5, 1.0 - texel * .5);
          vec3 neighbor = texture2D(sceneColor, uv).rgb;
          // Reject foreground samples at distant silhouettes to avoid dark fringes.
          float accept = 1.0;
          #if USE_DOF == 1
          accept = coc > .01 ? smoothstep(focusDistance * .65, focusDistance, distanceAt(uv)) : 1.0;
          #endif
          blur += neighbor * accept; weight += accept;
          glow += highlight(neighbor);
        }
        gl_FragColor = vec4(mix(sharp, blur / weight, coc) + glow * (bloomStrength / (2.0 + float(GLOW_SAMPLES))), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  const quad = new FullScreenQuad(material);
  function releaseTarget() {
    target?.dispose();
    target = null;
    uniforms.sceneColor.value = uniforms.sceneDepth.value = null;
  }
  return {
    get enabled() {
      return target !== null;
    },
    get depthOfField() {
      return !!target && uniforms.dofStrength.value > 0;
    },
    resize(width, height, quality, reduced) {
      level = quality;
      if (!supported || quality === 0 || reduced) {
        releaseTarget();
        return;
      }
      const depth = quality === 2;
      if (target && !!target.depthTexture !== depth) releaseTarget();
      if (material.defines.USE_DOF !== Number(depth)) {
        material.defines.USE_DOF = Number(depth);
        material.defines.GLOW_SAMPLES = depth ? 8 : 4;
        material.needsUpdate = true;
      }
      if (!target) {
        target = new THREE.WebGLRenderTarget(width, height, {
          type: THREE.HalfFloatType,
          depthBuffer: true,
          stencilBuffer: false,
          samples: Math.min(2, renderer.capabilities.maxSamples),
          resolveDepthBuffer: depth
        });
        if (depth) target.depthTexture = new THREE.DepthTexture(width, height, THREE.UnsignedIntType);
        uniforms.sceneColor.value = target.texture;
        uniforms.sceneDepth.value = target.depthTexture;
      }
      target.setSize(width, height);
      uniforms.texel.value.set(1 / width, 1 / height);
    },
    render(scene, camera, mapBlend, compact, speed, stationFocused = false) {
      if (!target) {
        renderer.render(scene, camera);
        return;
      }
      uniforms.cameraNear.value = camera.near;
      uniforms.cameraFar.value = camera.far;
      uniforms.focusDistance.value = 32 + Math.min(1, Math.abs(speed) / 36) * 16;
      uniforms.dofStrength.value = level === 2 && !stationFocused ? (compact ? 0.32 : 0.58) * (1 - mapBlend) : 0;
      uniforms.bloomStrength.value = (level === 2 ? 0.12 : 0.075) * (1 - mapBlend * 0.65);
      const previous = renderer.getRenderTarget();
      try {
        renderer.setRenderTarget(target);
        renderer.render(scene, camera);
        renderer.setRenderTarget(previous);
        quad.render(renderer);
      } finally {
        renderer.setRenderTarget(previous);
      }
    },
    dispose() {
      releaseTarget();
      quad.dispose();
      material.dispose();
    }
  };
}
function createEventWorld(host, get) {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  const budget = rideQuality({ coarse, cores: navigator.hardwareConcurrency, memory: navigator.deviceMemory });
  const quality = createQualityController(budget.initial, budget.maximum);
  renderer.setClearColor("#010604");
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;
  renderer.info.autoReset = false;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2("#010604", 42e-4);
  const camera = new THREE.PerspectiveCamera(70, 1, 0.15, 1800);
  const postprocessing = createRidePostprocessing(renderer);
  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enabled = false;
  orbit.enablePan = true;
  orbit.screenSpacePanning = true;
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.09;
  orbit.minPolarAngle = 0.15;
  orbit.maxPolarAngle = Math.PI * 0.8;
  orbit.rotateSpeed = 0.5;
  orbit.zoomSpeed = 0.6;
  orbit.autoRotateSpeed = 0.45;
  const mapCenter = new THREE.Vector3(0, LOGO_CENTER_Y - 5, 35);
  orbit.target.copy(mapCenter);
  scene.add(new THREE.HemisphereLight("#d3ffe2", "#082019", 1.25));
  const light = new THREE.DirectionalLight("#e1f5da", 2.1);
  light.position.set(-45, 105, 90);
  light.target.position.set(0, LOGO_CENTER_Y, 0);
  scene.add(light, light.target);
  const rim = new THREE.DirectionalLight("#78d5a1", 1);
  rim.position.set(50, 90, -70);
  rim.target.position.set(0, LOGO_CENTER_Y, 0);
  scene.add(rim, rim.target);
  const track = createCoasterTrack(), length = track.getLength();
  const minimap = createRideMap(track);
  const mapSamples = track.getPoints(500);
  const mapBounds = new THREE.Box3().setFromPoints(mapSamples).expandByVector(new THREE.Vector3(6, 7, 6));
  mapBounds.min.y = -3;
  const planner = createStationPlanner(track);
  let stopDefinitions = [], stops = [];
  let travelTarget = null, travelDirection = 1, travelStops = [];
  const scenery = createScenery(scene, track, coarse);
  let markers = [], stopPoints = [];
  let cards = [];
  let stationProps = null;
  let worldStations = [];
  const stationSignatures = /* @__PURE__ */ new Map();
  const controlsRoot = host.parentElement ?? host;
  const keys = /* @__PURE__ */ new Set();
  const heldKeys = /* @__PURE__ */ new Set();
  const controlled = /* @__PURE__ */ new Set(["KeyW", "KeyD", "KeyS", "KeyA", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ShiftLeft", "ShiftRight"]);
  const driveOptions = { loop: true, boost: false };
  let boosting = false, boostFocus = 0;
  let boostStyle = "";
  let journey = initialCoasterJourney(), motion = journey.motion;
  let mode = get().mode, command = -1, paused = false;
  let disposed = false, failed = false, visible = true, frame = 0, last = 0, elapsed = 0;
  let contextUnavailable = false, recoveryTimer = 0;
  let dragging = null;
  let gazeX = 0, gazeY = 0, bank = 0, mapBlend = mode === "overview" ? 1 : 0;
  let transition = 1, initialized = false, notified = null;
  let dilation = 1, stationFocus = 0, focusStation = null;
  let panStation = null, panProgress = 0, panStarted = false, bookRevealed = false;
  const panFrom = new THREE.Quaternion(), panTarget = new THREE.Quaternion();
  let mapInteracted = false, cameraLift = 0, cameraPitch = 0, cameraPullback = 0;
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
  const basis = new THREE.Matrix4(), look = new THREE.Quaternion(), euler = new THREE.Euler(0, 0, 0, "YXZ");
  const up = new THREE.Vector3(0, 1, 0);
  let fromFov = 70;
  function syncStations(props) {
    renderDirty = true;
    const previousId = journey.station === null ? null : worldStations[journey.station]?.id;
    const dismissedId = journey.dismissed === null ? null : worldStations[journey.dismissed]?.id;
    const travelingId = travelTarget === null ? null : worldStations[travelTarget]?.id;
    const focusedId = focusStation === null ? null : worldStations[focusStation]?.id;
    const panId = panStation === null ? null : worldStations[panStation]?.id;
    stationProps = props.stations;
    const placements = planner.forEvents(props.stations.map((station) => station.event));
    worldStations = props.stations;
    stopDefinitions = placements.map((stop) => stop ?? { distance: Infinity, radius: 22, name: "" });
    stops = stopDefinitions.map((stop) => stop.distance);
    stopPoints = placements.map((stop) => stop ? stop.point.clone().add(new THREE.Vector3(0, 5.1, 0)) : null);
    for (const id of stationSignatures.keys()) if (!worldStations.some((station) => station.id === id)) {
      scenery.removeStation(id);
      stationSignatures.delete(id);
    }
    worldStations.forEach((station, index) => {
      const placement = placements[index];
      const signature = `${station.name}|${placement?.distance}|${index}`;
      if (stationSignatures.get(station.id) === signature) return;
      scenery.removeStation(station.id);
      if (placement) scenery.addStation(station.id, placement, index, station.name, station.kind ?? "event");
      stationSignatures.set(station.id, signature);
    });
    markers = Array.from(host.querySelectorAll("[data-world-station]"));
    const indexOf = (id) => {
      const index = worldStations.findIndex((s) => s.id === id);
      return index < 0 ? null : index;
    };
    journey.station = indexOf(previousId);
    journey.dismissed = indexOf(dismissedId);
    if (journey.station === null && journey.phase !== "riding") {
      journey = departCoasterStation(journey);
      motion = journey.motion;
    }
    notified = journey.station;
    if (travelTarget !== null) setTravel(indexOf(travelingId));
    focusStation = indexOf(focusedId);
    panStation = indexOf(panId);
    if (focusStation === null) stationFocus = 0;
    syncCards();
    props.onLayout?.(placements.map(Boolean), minimap.layout(placements.map((stop) => stop?.point ?? null)));
  }
  function syncCards() {
    cards = Array.from(host.querySelectorAll("[data-world-card]")).map((element) => ({
      element,
      index: worldStations.findIndex((station) => station.id === element.dataset.worldCard),
      opacity: 0
    }));
  }
  function arrivalFrame(journeyStops) {
    const next = nextCoasterStop(motion.distance, journeyStops, length, Math.sign(motion.speed), journey.dismissed);
    const docking = journey.phase === "braking" || journey.phase === "stopped";
    const index = docking ? journey.station : next.index;
    const remaining = docking && index !== null ? trackSeparation(motion.distance, stops[index], length) : next.remaining;
    return { index, ...stationArrivalFrame(remaining, index === null ? 0 : stopDefinitions[index].radius, get().reduced) };
  }
  function setTravel(index) {
    travelTarget = index;
    travelStops = stopDefinitions.map((stop, i) => i === index ? stop : { ...stop, distance: Infinity });
    get().onTravelChange(index);
  }
  function setBoost(active) {
    if (boosting !== active) {
      boosting = active;
      get().onBoostChange(active);
    }
  }
  function resetInput() {
    keys.clear();
    dragging = null;
    get().input.current = { x: 0, y: 0 };
    get().boostInput.current = false;
    get().audio.current?.quiet();
    setBoost(false);
  }
  function focus() {
    host.focus({ preventScroll: true });
  }
  function mapCamera() {
    const direction = new THREE.Vector3(0.3, 0.45, 1).normalize();
    const right = new THREE.Vector3().crossVectors(up, direction).normalize(), vertical = new THREE.Vector3().crossVectors(direction, right);
    const tangent = Math.tan(THREE.MathUtils.degToRad(44 / 2));
    let distance = 0;
    const sideGuide = width > 900 || height < 500;
    const usableWidth = Math.max(width * 0.45, width - (sideGuide ? width > 900 ? 360 : 288 : 48));
    const usableHeight = Math.max(height * 0.48, height - (sideGuide ? 120 : 300));
    for (const point of mapSamples) {
      const corner = point.clone().sub(orbit.target);
      distance = Math.max(distance, corner.dot(direction) + 1.12 * Math.max((Math.abs(corner.dot(right)) + 7) / (tangent * camera.aspect * usableWidth / width), (Math.abs(corner.dot(vertical)) + 7) / (tangent * usableHeight / height)));
    }
    mapPosition.copy(direction).multiplyScalar(distance).add(orbit.target);
    basis.lookAt(mapPosition, orbit.target, up);
    mapRotation.setFromRotationMatrix(basis);
    orbit.minDistance = Math.max(160, distance * 0.65);
    orbit.maxDistance = distance * 1.4;
  }
  function frameMapView() {
    const blend = mode === "overview" ? transition : 1 - transition;
    const offsetY = width <= 760 ? height < 500 ? -20 : 0 : width > 900 || height < 500 ? 0 : 70;
    if (blend > 0) camera.setViewOffset(width, height, (width > 900 ? -150 : height < 500 ? -120 : 0) * blend, offsetY * blend, width, height);
    else camera.clearViewOffset();
  }
  function size(resetCamera = true) {
    renderDirty = true;
    if (contextUnavailable) return;
    width = Math.max(host.clientWidth, 1);
    height = Math.max(host.clientHeight, 1);
    renderer.setPixelRatio(qualityPixelRatio(quality.level, width, height, window.devicePixelRatio, coarse));
    renderer.setSize(width, height, false);
    scenery.setQuality(quality.level);
    postprocessing.resize(renderer.domElement.width, renderer.domElement.height, quality.level, get().reduced);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    mapCamera();
    if (resetCamera && mode === "overview" && transition >= 1) {
      camera.position.copy(mapPosition);
      camera.quaternion.copy(mapRotation);
      orbit.update();
    }
  }
  function beginTransition() {
    fromPosition.copy(camera.position);
    fromRotation.copy(camera.quaternion);
    fromFov = camera.fov;
    transition = get().reduced ? 1 : 0;
    orbit.enabled = false;
    orbit.autoRotate = false;
    resetInput();
    gazeX = gazeY = 0;
    if (mode === "overview") {
      panStation = null;
      panProgress = 0;
      bookRevealed = false;
      orbit.target.copy(mapCenter);
      mapInteracted = false;
      mapCamera();
      if (get().reduced) {
        camera.position.copy(mapPosition);
        camera.quaternion.copy(mapRotation);
      }
    }
  }
  function nearest() {
    let index = -1, distance = Infinity;
    stops.forEach((stop, i) => {
      const d = trackSeparation(stop, motion.distance, length);
      if (d < distance) {
        index = i;
        distance = d;
      }
    });
    return { index, distance };
  }
  function openStation(index) {
    notified = index;
    journey = { ...journey, phase: "stopped", station: index, motion: { ...motion, speed: 0, acceleration: 0 } };
    motion = journey.motion;
    resetInput();
    panStation = index;
    panProgress = 0;
    panStarted = false;
    bookRevealed = false;
    const cover = worldStations[index].event?.photos?.[0];
    if (cover) {
      const image = new Image();
      image.src = cover.url;
    }
  }
  const keydown = (event) => {
    if (controlled.has(event.code) && !event.altKey && !event.ctrlKey && !event.metaKey) heldKeys.add(event.code);
    if (event.altKey || event.ctrlKey || event.metaKey || get().paused || panStation !== null || get().mode !== "explore") return;
    if (controlled.has(event.code)) {
      event.preventDefault();
      keys.add(event.code);
    }
    if (event.code === "KeyE" && !event.repeat) {
      const near = nearest();
      if (near.index >= 0 && near.distance < 3.8 && Math.abs(motion.speed) < 0.12) {
        event.preventDefault();
        openStation(near.index);
      }
    }
  };
  const keyup = (event) => {
    keys.delete(event.code);
    heldKeys.delete(event.code);
  };
  const pointerDown = (event) => {
    if (event.button !== 0 || get().mode !== "explore" || get().paused || panStation !== null) return;
    focus();
    dragging = { id: event.pointerId, x: event.clientX, y: event.clientY };
    renderer.domElement.setPointerCapture(event.pointerId);
  };
  const pointerMove = (event) => {
    if (!dragging || event.pointerId !== dragging.id || get().paused) return;
    gazeX = THREE.MathUtils.clamp(gazeX - (event.clientX - dragging.x) * 3e-3, -1.05, 1.05);
    gazeY = THREE.MathUtils.clamp(gazeY - (event.clientY - dragging.y) * 25e-4, -0.6, 0.6);
    dragging.x = event.clientX;
    dragging.y = event.clientY;
  };
  const pointerUp = () => {
    dragging = null;
  };
  const contextLost = (event) => {
    event.preventDefault();
    contextUnavailable = true;
    get().onRecovering?.(true);
    visibility();
  };
  const contextRestored = () => {
    if (disposed || failed) return;
    contextUnavailable = false;
    rendered = false;
    size(false);
    visibility();
  };
  function visibility() {
    heldKeys.clear();
    resetInput();
    last = 0;
    quality.reset();
    cancelAnimationFrame(frame);
    frame = 0;
    window.clearTimeout(recoveryTimer);
    if (document.hidden || !visible || disposed || failed) return;
    if (contextUnavailable) {
      recoveryTimer = window.setTimeout(() => {
        failed = true;
        get().onError();
      }, 1e4);
      return;
    }
    renderDirty = true;
    frame = requestAnimationFrame(animate);
  }
  function animate(now) {
    frame = 0;
    if (disposed || failed || contextUnavailable || document.hidden || !visible) return;
    const rawDelta = last ? (now - last) / 1e3 : 0;
    const dt = Math.min(rawDelta, 0.05);
    last = now;
    const props = get();
    if (reduced !== props.reduced) {
      reduced = props.reduced;
      size(false);
      syncCards();
    }
    let resumeInput = false, board = null;
    if (stationProps !== props.stations) syncStations(props);
    if (!props.paused) elapsed += dt;
    if (command !== props.command.serial) {
      command = props.command.serial;
      const destination = props.command.station;
      panStation = null;
      panProgress = 0;
      panStarted = false;
      bookRevealed = false;
      setTravel(null);
      if (props.command.travel && destination !== null && Number.isFinite(stops[destination])) {
        const forward = THREE.MathUtils.euclideanModulo(stops[destination] - motion.distance, length);
        travelDirection = forward <= length / 2 ? 1 : -1;
        journey = departCoasterStation(journey);
        journey.motion = { ...motion, speed: 0, acceleration: 0 };
        journey.dismissed = null;
        setTravel(destination);
      } else if (props.command.resume) journey = departCoasterStation(journey);
      else {
        journey = initialCoasterJourney(destination === null || !Number.isFinite(stops[destination]) ? 0 : stops[destination]);
        journey.dismissed = destination;
      }
      motion = journey.motion;
      notified = null;
      bank = 0;
      dilation = 1;
      cameraLift = cameraPitch = cameraPullback = 0;
      resetInput();
      if (!props.command.resume) {
        stationFocus = 0;
        focusStation = null;
        cards.forEach((card) => {
          card.opacity = 0;
        });
      }
      resumeInput = Boolean(props.command.resume || props.command.driveKey);
      if (props.command.board && destination !== null && Number.isFinite(stops[destination])) board = destination;
      if (mode === "explore") focus();
    }
    if (mode !== props.mode) {
      mode = props.mode;
      beginTransition();
      if (mode === "explore") focus();
    }
    if (paused !== props.paused) {
      paused = props.paused;
      resetInput();
      if (!paused && mode === "explore") {
        if (journey.phase === "stopped") journey = departCoasterStation(journey);
        notified = null;
        focus();
      }
    }
    if (board !== null) openStation(board);
    if (resumeInput && !paused) for (const key of heldKeys) keys.add(key);
    const active = mode === "explore" && !paused && panStation === null && transition >= 1 && controlsRoot.contains(document.activeElement);
    const keyboard = Number(keys.has("KeyW") || keys.has("KeyD") || keys.has("ArrowUp") || keys.has("ArrowRight")) - Number(keys.has("KeyS") || keys.has("KeyA") || keys.has("ArrowDown") || keys.has("ArrowLeft"));
    const stick = props.input.current;
    const drivingKey = keys.size > Number(keys.has("ShiftLeft")) + Number(keys.has("ShiftRight"));
    let throttle = drivingKey ? keyboard : Math.abs(stick.y) >= Math.abs(stick.x) ? stick.y : stick.x;
    if (travelTarget !== null && throttle) {
      setTravel(null);
      journey = departCoasterStation(journey);
    }
    if (travelTarget !== null) throttle = travelDirection;
    const journeyStops = travelTarget === null ? stopDefinitions : travelStops;
    driveOptions.boost = active && (journey.phase === "riding" || journey.phase === "approaching") && (keys.has("ShiftLeft") || keys.has("ShiftRight") || props.boostInput.current);
    if (driveOptions.boost && !throttle && !drivingKey) throttle = Math.sign(motion.speed) || 1;
    if (active) {
      const current = sampleTrack(track, motion.distance, length, slopeFrame);
      const scale = Math.min(approachScale(motion.distance, journeyStops, length, Math.sign(motion.speed) || Math.sign(throttle), journey.dismissed), arrivalFrame(journeyStops).timeScale);
      dilation = props.reduced ? 1 : THREE.MathUtils.damp(dilation, scale, 4, dt);
      journey = stepCoasterJourney(journey, throttle, current.tangent.y, dt * dilation, length, journeyStops, props.reduced, driveOptions);
      motion = journey.motion;
      if (journey.phase === "stopped" && journey.station !== null && notified !== journey.station) {
        setTravel(null);
        openStation(journey.station);
      }
    }
    setBoost(driveOptions.boost && (journey.phase === "riding" || journey.phase === "approaching"));
    if (props.reduced) dilation = 1;
    const arrival = arrivalFrame(journeyStops);
    const revealStation = mode === "explore" && !bookRevealed && transition >= 1 && !paused ? panStation ?? arrival.index : null;
    if (revealStation !== null && arrival.focus > 0) focusStation = revealStation;
    stationFocus = props.reduced ? 0 : THREE.MathUtils.damp(stationFocus, revealStation === null ? 0 : arrival.focus, 6, dt);
    const visualSpeed = motion.speed * dilation;
    props.audio.current?.update(visualSpeed / COASTER_SPEED, active && document.hasFocus() && Math.abs(visualSpeed) > 0.1);
    boostFocus = props.reduced ? 0 : THREE.MathUtils.damp(boostFocus, boosting ? 1 : 0, boosting ? 3.8 : 4.5, dt);
    const nextBoostStyle = boostFocus.toFixed(3);
    if (boostStyle !== nextBoostStyle) {
      boostStyle = nextBoostStyle;
      controlsRoot.style.setProperty("--nx-boost-focus", boostStyle);
    }
    const nextEvent = nextCoasterStop(motion.distance, journeyStops, length, Math.sign(motion.speed), journey.dismissed);
    const showGlimpse = active && !props.reduced && Math.abs(motion.speed) > 0.1 && journey.phase !== "stopped" && nextEvent.remaining > Math.max(GLIMPSE_EXIT, nextEvent.index === null ? 0 : stopDefinitions[nextEvent.index].radius);
    props.glimpses.current?.update(showGlimpse && nextEvent.index !== null ? worldStations[nextEvent.index] : null, nextEvent.remaining, dt);
    const f = sampleTrack(track, motion.distance, length, rideFrame);
    props.minimap.current?.update(minimap.project(f.point));
    const compactCamera = coarse || width <= 768 || height <= 500;
    const cinematic = cinematicCamera(visualSpeed, motion.acceleration * dilation, f.tangent.y, COASTER_SPEED, compactCamera, props.reduced, boostFocus);
    bank = props.reduced ? 0 : THREE.MathUtils.damp(bank, cameraBank(f.curvature, visualSpeed) * cinematic.bankScale, 9, dt);
    cameraLift = props.reduced ? 0 : THREE.MathUtils.damp(cameraLift, cinematic.lift, 9, dt);
    cameraPitch = props.reduced ? 0 : THREE.MathUtils.damp(cameraPitch, cinematic.pitch, 9, dt);
    cameraPullback = props.reduced ? 0 : THREE.MathUtils.damp(cameraPullback, cinematic.pullback, 6, dt);
    if (!dragging) {
      gazeX = THREE.MathUtils.damp(gazeX, 0, 3.4 + boostFocus * 5, dt);
      gazeY = THREE.MathUtils.damp(gazeY, 0, 3.4 + boostFocus * 5, dt);
    }
    target.copy(f.point).add(f.tangent);
    basis.lookAt(f.point, target, f.up);
    desiredRotation.setFromRotationMatrix(basis);
    look.setFromEuler(euler.set(0, 0, bank));
    desiredRotation.multiply(look);
    scenery.cart.position.copy(f.point);
    scenery.cart.quaternion.copy(desiredRotation);
    scenery.player.position.copy(f.point).addScaledVector(f.up, 1);
    desiredPosition.copy(f.point).addScaledVector(f.up, (compactCamera ? 1.68 : 1.48) + cameraLift).addScaledVector(f.tangent, -cameraPullback);
    look.setFromEuler(euler.set(gazeY + cameraPitch, gazeX, 0));
    desiredRotation.multiply(look);
    const rideFov = cinematic.fov - (props.reduced ? 0 : (1 - dilation) * 5);
    if (!initialized) {
      initialized = true;
      camera.position.copy(desiredPosition);
      camera.quaternion.copy(desiredRotation);
      camera.fov = rideFov;
      if (mode === "overview") {
        camera.position.copy(mapPosition);
        camera.quaternion.copy(mapRotation);
        camera.fov = 44;
      }
    }
    if (transition < 1) {
      transition = Math.min(1, transition + dt);
      const t = THREE.MathUtils.smootherstep(transition, 0, 1);
      camera.position.lerpVectors(fromPosition, mode === "overview" ? mapPosition : desiredPosition, t);
      camera.quaternion.slerpQuaternions(fromRotation, mode === "overview" ? mapRotation : desiredRotation, t);
      camera.fov = THREE.MathUtils.lerp(fromFov, mode === "overview" ? 44 : rideFov, t);
    } else if (mode === "explore") {
      camera.position.copy(desiredPosition);
      camera.quaternion.slerp(desiredRotation, props.reduced ? 1 : 1 - Math.exp(-35 * dt));
      camera.fov = props.reduced ? rideFov : THREE.MathUtils.damp(camera.fov, rideFov, 8, dt);
    } else {
      camera.fov = 44;
      orbit.enabled = !paused;
      orbit.autoRotate = !paused && !props.reduced && !mapInteracted;
      if (!paused) {
        orbit.update(dt);
        panOffset.copy(orbit.target);
        orbit.target.clamp(mapBounds.min, mapBounds.max);
        panOffset.sub(orbit.target);
        camera.position.sub(panOffset);
      }
    }
    if (panStation !== null && mode === "explore" && transition >= 1) {
      if (!panStarted) {
        panFrom.copy(camera.quaternion);
        panStarted = true;
      }
      if (!paused) panProgress = props.reduced ? 1 : Math.min(1, panProgress + rawDelta / STATION_PAN_SECONDS);
      panTarget.copy(panFrom).multiply(look.setFromEuler(euler.set(0, stationPanAngle(panProgress), 0)));
      camera.quaternion.copy(panTarget);
    }
    frameMapView();
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    for (const card of cards) {
      const opacity = card.index === revealStation ? arrival.opacity * (panStation === null ? 1 : 1 - panProgress) : 0;
      if (opacity === 0 && card.opacity === 0 && card.element.style.visibility !== "visible") continue;
      card.opacity = THREE.MathUtils.damp(card.opacity, opacity, 7, dt);
      if (opacity === 0 && card.opacity < 2e-3) card.opacity = 0;
      const show = mode === "explore" && !props.reduced && card.opacity > 2e-3 && !bookRevealed;
      if (show) {
        card.element.style.transform = `translate(${width * 0.5}px,${height * (height <= 500 ? 0.55 : 0.66)}px) translate(-50%,-50%)`;
      }
      card.element.style.opacity = String(card.opacity);
      card.element.style.visibility = show ? "visible" : "hidden";
      card.element.setAttribute("aria-hidden", String(!show || paused || card.opacity < 0.1));
      card.element.style.setProperty("--nx-arrival-progress", String(card.index === revealStation ? arrival.proximity : 0));
    }
    mapBlend = props.reduced ? mode === "overview" ? 1 : 0 : THREE.MathUtils.damp(mapBlend, mode === "overview" ? 1 : 0, 3, dt);
    scenery.update(elapsed, props.reduced, mapBlend, camera);
    scene.fog.density = THREE.MathUtils.lerp(42e-4, 8e-4, mapBlend);
    if (mode === "overview" && now - lastMarkerUpdate > 50) {
      lastMarkerUpdate = now;
      markers = Array.from(host.querySelectorAll("[data-world-station]"));
      const depths = stopPoints.map((point, i) => ({ i, distance: point?.distanceTo(camera.position) ?? Infinity })).sort((a, b) => b.distance - a.distance);
      const ranks = new Map(depths.map((item, rank) => [item.i, rank]));
      markers.forEach((marker, i) => {
        const show = mode === "overview" && transition >= 1 && !paused && !!stopPoints[i];
        if (show) {
          projected.copy(stopPoints[i]).project(camera);
          const scale = THREE.MathUtils.clamp(camera.position.distanceTo(orbit.target) / stopPoints[i].distanceTo(camera.position), 0.8, 1.2);
          marker.style.transform = `translate(${(projected.x * 0.5 + 0.5) * width}px,${(-projected.y * 0.5 + 0.5) * height}px) translate(-50%,-50%) scale(${scale})`;
          marker.style.zIndex = String(ranks.get(i) ?? 0);
        }
        marker.style.visibility = !show || projected.z > 1 || projected.z < -1 || Math.abs(projected.x) > 0.95 || Math.abs(projected.y) > 0.94 ? "hidden" : "visible";
      });
    }
    if (!paused && drewLastFrame && quality.sample(rawDelta) !== null) size(false);
    const cameraChanged = renderedPosition.distanceToSquared(camera.position) > 1e-6 || renderedRotation.angleTo(camera.quaternion) > 1e-4 || Math.abs(renderedFov - camera.fov) > 1e-3;
    drewLastFrame = !rendered || renderDirty || cameraChanged || transition < 1;
    try {
      if (drewLastFrame) {
        renderer.info.reset();
        postprocessing.render(scene, camera, mapBlend, compactCamera, visualSpeed, panStation !== null);
        renderDirty = false;
        renderedPosition.copy(camera.position);
        renderedRotation.copy(camera.quaternion);
        renderedFov = camera.fov;
      }
    } catch (error) {
      failed = true;
      props.audio.current?.quiet();
      console.error("Unable to render the Nucleus ride:", error);
      props.onError();
      return;
    }
    if (!rendered) {
      rendered = true;
      props.onRecovering?.(false);
      props.onReady();
    }
    if (panStation !== null && panProgress === 1 && !bookRevealed && !paused) {
      bookRevealed = true;
      props.onArrive(panStation);
    }
    frame = requestAnimationFrame(animate);
  }
  const takeOverMap = () => {
    mapInteracted = true;
    orbit.autoRotate = false;
  };
  orbit.addEventListener("start", takeOverMap);
  const resize = new ResizeObserver(() => size());
  resize.observe(host);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visibility();
  });
  intersection.observe(host);
  controlsRoot.addEventListener("keydown", keydown);
  host.addEventListener("focusout", resetInput);
  window.addEventListener("keyup", keyup);
  window.addEventListener("blur", resetInput);
  document.addEventListener("visibilitychange", visibility);
  renderer.domElement.addEventListener("pointerdown", pointerDown);
  renderer.domElement.addEventListener("pointermove", pointerMove);
  renderer.domElement.addEventListener("pointerup", pointerUp);
  renderer.domElement.addEventListener("pointercancel", pointerUp);
  renderer.domElement.addEventListener("lostpointercapture", pointerUp);
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  renderer.domElement.addEventListener("webglcontextrestored", contextRestored);
  size();
  frame = requestAnimationFrame(animate);
  return () => {
    disposed = true;
    window.clearTimeout(recoveryTimer);
    cancelAnimationFrame(frame);
    resetInput();
    resize.disconnect();
    intersection.disconnect();
    orbit.removeEventListener("start", takeOverMap);
    orbit.dispose();
    controlsRoot.removeEventListener("keydown", keydown);
    host.removeEventListener("focusout", resetInput);
    window.removeEventListener("keyup", keyup);
    window.removeEventListener("blur", resetInput);
    document.removeEventListener("visibilitychange", visibility);
    renderer.domElement.removeEventListener("pointerdown", pointerDown);
    renderer.domElement.removeEventListener("pointermove", pointerMove);
    renderer.domElement.removeEventListener("pointerup", pointerUp);
    renderer.domElement.removeEventListener("pointercancel", pointerUp);
    renderer.domElement.removeEventListener("lostpointercapture", pointerUp);
    renderer.domElement.removeEventListener("webglcontextlost", contextLost);
    renderer.domElement.removeEventListener("webglcontextrestored", contextRestored);
    postprocessing.dispose();
    disposeObject(scene);
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
function LogoWorld(props) {
  const host = useRef(null);
  const live = useRef(props);
  live.current = props;
  useEffect(() => {
    if (!host.current) return;
    let dispose;
    const frame = requestAnimationFrame(() => {
      if (!host.current) return;
      try {
        dispose = createEventWorld(host.current, () => live.current);
      } catch (error) {
        console.error("Unable to create the Nucleus world:", error);
        live.current.onError();
      }
    });
    return () => {
      cancelAnimationFrame(frame);
      dispose?.();
    };
  }, []);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: host,
      className: "nx-world",
      tabIndex: 0,
      role: "group",
      "aria-label": "Nucleus roller coaster. W or D to accelerate, S or A to brake and reverse. Hold Shift to boost. Drag to look. E opens a nearby station.",
      "aria-describedby": "nx-control-summary",
      children: [
        /* @__PURE__ */ jsx("div", { className: "nx-world-markers", "aria-label": "Stations on the map", hidden: props.mode !== "overview" || props.paused, children: props.stations.map((station) => /* @__PURE__ */ jsxs(
          "button",
          {
            "data-world-station": station.id,
            "data-stop-kind": "event",
            onClick: () => props.onBoard(station.index),
            "aria-label": `Ride from station ${station.number}: ${station.name}`,
            children: [
              /* @__PURE__ */ jsx("span", { children: station.number }),
              /* @__PURE__ */ jsx("small", { children: station.name })
            ]
          },
          station.id
        )) }),
        !props.reduced && /* @__PURE__ */ jsx("div", { className: "nx-world-cards", children: props.stations.map((station) => /* @__PURE__ */ jsxs("aside", { className: "nx-teaser", "data-world-card": station.id, "aria-hidden": "true", children: [
          /* @__PURE__ */ jsxs("svg", { className: "nx-approach-arc", viewBox: "0 0 44 44", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsx("circle", { cx: "22", cy: "22", r: "19" }),
            /* @__PURE__ */ jsx("circle", { cx: "22", cy: "22", r: "19", pathLength: "1", strokeDasharray: "1" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("span", { className: "nx-event-category", children: [
              station.event?.category || "Preview station",
              " · ",
              station.number
            ] }),
            /* @__PURE__ */ jsx("h2", { children: station.name }),
            station.event?.startsAt && /* @__PURE__ */ jsx("p", { children: new Date(station.event.startsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) }),
            station.event?.location && /* @__PURE__ */ jsx("p", { children: station.event.location }),
            /* @__PURE__ */ jsx("small", { children: "Arriving at station" })
          ] })
        ] }, station.id)) })
      ]
    }
  );
}
export {
  LogoWorld as default
};
