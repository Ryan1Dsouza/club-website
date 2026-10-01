import * as THREE from 'three';
import { mergeGeometries, toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import { WORLD } from './event-navigation.ts';
import { LOGO_SCALE, LOGO_CENTER_Y, LOGO_DEPTH, sampleTrack, type CoasterTrack } from './event-coaster.ts';
import { logoClearance, type StationPlacement } from './event-layout.ts';
import { batchInstances, disposeObject } from './event-batching.ts';
import type { QualityLevel } from './event-quality.ts';
import { createTrackSupports } from './event-supports.ts';

const MINT = '#c3e5c8';
function roundedContour<T extends THREE.Path>(path: T, outline: number[][]): T {
  const points = outline.map(([x, z]) => new THREE.Vector2(x, -z));
  points.forEach((point, index) => {
    const previous = points[(index + points.length - 1) % points.length], next = points[(index + 1) % points.length];
    // Round only the traced pixel corners; short edges and passage widths survive.
    const before = point.distanceTo(previous), after = point.distanceTo(next);
    const radius = Math.min(.12, before * .2, after * .2);
    const entry = point.clone().lerp(previous, before ? radius / before : 0);
    const exit = point.clone().lerp(next, after ? radius / after : 0);
    if (index === 0) path.moveTo(entry.x, entry.y); else path.lineTo(entry.x, entry.y);
    path.quadraticCurveTo(point.x, point.y, exit.x, exit.y);
  });
  path.closePath();
  return path;
}

function shape(outline: number[][], holes: number[][][] = []) {
  const result = roundedContour(new THREE.Shape(), outline);
  result.holes = holes.map(hole => roundedContour(new THREE.Path(), hole));
  return result;
}

/** One opaque, softly beveled surface, built once and shared by all quality levels. */
export function createVerticalLogo() {
  const bevel = .16;
  const pieces = WORLD.walls.map(wall => new THREE.ExtrudeGeometry(shape(wall.outline, wall.holes), {
    // The source is already densely traced; two samples round each tiny corner.
    depth: LOGO_DEPTH - bevel * 2, steps: 1, curveSegments: 2,
    bevelEnabled: true, bevelSegments: 2, bevelThickness: bevel,
    bevelSize: .055, bevelOffset: -.055,
  }).translate(0, 0, bevel));
  const geometry = mergeGeometries(pieces)!; pieces.forEach(piece => piece.dispose());
  // Extrusions duplicate vertices at face boundaries, so computeVertexNormals()
  // alone cannot smooth them. Include the traced right-angle pixel corners in
  // the averaging so long sides do not break into vertical lighting stripes.
  geometry.scale(LOGO_SCALE, LOGO_SCALE, 1);
  toCreasedNormals(geometry, Math.PI / 2 + .001);
  // Keep the broad caps planar: averaging their normals with bevels can draw
  // false diagonal shading across the extrusion's large triangulated faces.
  const positions = geometry.getAttribute('position'), normals = geometry.getAttribute('normal');
  for (let i = 0; i < positions.count; i++) {
    const z = positions.getZ(i);
    if (Math.abs(z) < 1e-6) normals.setXYZ(i, 0, 0, -1);
    else if (Math.abs(z - LOGO_DEPTH) < 1e-6) normals.setXYZ(i, 0, 0, 1);
  }
  geometry.normalizeNormals(); geometry.computeBoundingSphere();
  const material = new THREE.MeshStandardMaterial({ color: '#79a787', metalness: .22, roughness: .46, emissive: '#709b7e', emissiveIntensity: .24, flatShading: false });
  const logo = new THREE.Mesh(geometry, material);
  logo.name = 'Solid Nucleus sculpture'; logo.userData.logoObstacle = true;
  logo.position.set(0, LOGO_CENTER_Y, -LOGO_DEPTH / 2);
  return logo;
}

function railGeometry(frames: ReturnType<typeof sampleTrack>[], offset: number, height: number, radius: number) {
  const sides = 5, vertices: number[] = [], indices: number[] = [];
  frames.forEach((f, i) => {
    for (let j = 0; j < sides; j++) {
      const angle = j / sides * Math.PI * 2;
      const p = f.point.clone().addScaledVector(f.side, offset + Math.cos(angle) * radius).addScaledVector(f.up, height + Math.sin(angle) * radius);
      vertices.push(p.x, p.y, p.z);
      if (i) { const a = (i - 1) * sides + j, b = (i - 1) * sides + (j + 1) % sides, c = i * sides + j, d = i * sides + (j + 1) % sides; indices.push(a, c, b, b, c, d); }
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geometry.setIndex(indices);
  geometry.computeVertexNormals(); geometry.computeBoundingSphere(); return geometry;
}

function createCoasterCart() {
  const cart = new THREE.Group(); cart.name = 'Mint runner cart';
  const shell = new THREE.MeshPhysicalMaterial({ color: '#173426', metalness: .45, roughness: .22, clearcoat: 1, clearcoatRoughness: .16 });
  const upholstery = new THREE.MeshStandardMaterial({ color: '#091e16', metalness: .1, roughness: .78 });
  const neon = new THREE.MeshStandardMaterial({ color: MINT, emissive: MINT, emissiveIntensity: .8, metalness: .9, roughness: .3 });
  // Bake the static parts into three meshes to keep the cart inexpensive on phones.
  const addParts = (name: string, parts: THREE.BufferGeometry[], material: THREE.Material) => {
    const geometries = parts.map(part => {
      if (!part.index) return part;
      const geometry = part.toNonIndexed(); part.dispose(); return geometry;
    });
    const geometry = mergeGeometries(geometries)!; geometries.forEach(part => part.dispose());
    const mesh = new THREE.Mesh(geometry, material); mesh.name = name; cart.add(mesh);
  };
  // The bevel is included in the 1.4 × 1.8 footprint; negative Z is the nose.
  const outline = new THREE.Shape().moveTo(0, 1.23)
    .bezierCurveTo(.32, 1.23, .58, 1, .63, .6).lineTo(.63, -.16)
    .quadraticCurveTo(.63, -.43, .36, -.43).lineTo(-.36, -.43)
    .quadraticCurveTo(-.63, -.43, -.63, -.16).lineTo(-.63, .6)
    .bezierCurveTo(-.58, 1, -.32, 1.23, 0, 1.23).closePath();
  const hull = new THREE.ExtrudeGeometry(outline, {
    depth: .18, steps: 1, curveSegments: 8, bevelEnabled: true,
    bevelThickness: .07, bevelSize: .07, bevelSegments: 3,
  }).rotateX(-Math.PI / 2).translate(0, .21, 0);
  toCreasedNormals(hull, Math.PI / 3);
  addParts('Glossy hull and side pods', [hull, ...[-1, 1].map(side =>
    new THREE.CapsuleGeometry(.14, 1.05, 4, 10).rotateX(Math.PI / 2).translate(side * .53, .5, -.3))], shell);
  addParts('Recessed cockpit seat', [
    new THREE.CapsuleGeometry(.24, .5, 4, 10).rotateZ(Math.PI / 2).scale(1, .24, 1.1).translate(0, .48, 0),
    new THREE.CapsuleGeometry(.22, .48, 4, 10).rotateZ(Math.PI / 2).scale(1, .95, .26).rotateX(-.12).translate(0, .73, .3),
  ], upholstery);
  const tube = (points: number[][], radius: number, segments: number) => new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z))), segments, radius, 6, false,
  );
  addParts('Mint safety hoop and running lights', [
    tube([[-.53, .53, -.62], [-.52, .77, -.86], [-.42, .87, -.98], [0, .88, -1], [.42, .87, -.98], [.52, .77, -.86], [.53, .53, -.62]], .033, 24),
    ...[-1, 1].map(side => tube([[side * .635, .595, .2], [side * .655, .595, -.3], [side * .635, .595, -.8]], .014, 16)),
    tube([[-.28, .5, -1.12], [0, .5, -1.18], [.28, .5, -1.12]], .022, 12),
  ], neon);
  return cart;
}

export function createScenery(scene: THREE.Scene, track: CoasterTrack, coarse: boolean) {
  const length = track.getLength();
  const dark = new THREE.MeshStandardMaterial({ color: '#173426', metalness: .3, roughness: .6 });
  const railMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(MINT).multiplyScalar(.9) });
  const distantRailMaterial = new THREE.LineBasicMaterial({ color: new THREE.Color('#9acba7').multiplyScalar(.9) });
  const box = new THREE.BoxGeometry(1, 1, 1), dummy = new THREE.Object3D(), basis = new THREE.Matrix4();
  const matrix = (x: number, y: number, z: number, w: number, h: number, d: number) => {
    dummy.position.set(x, y, z); dummy.quaternion.identity(); dummy.scale.set(w, h, d); dummy.updateMatrix(); return dummy.matrix.clone();
  };
  scene.add(createVerticalLogo());
  const ground = new THREE.GridHelper(800, 100, '#264b35', '#10271b'); ground.position.y = -3; scene.add(ground);
  const groundColors = ground.geometry.getAttribute('color'), groundPositions = ground.geometry.getAttribute('position');
  for (let i = 0; i < groundColors.count; i++) {
    const fade = Math.max(0, 1 - Math.hypot(groundPositions.getX(i), groundPositions.getZ(i)) / 400);
    groundColors.setXYZ(i, groundColors.getX(i) * fade, groundColors.getY(i) * fade, groundColors.getZ(i) * fade);
  }
  const terrainGeometry = new THREE.CircleGeometry(480, 64), terrainColors = new Float32Array(terrainGeometry.attributes.position.count * 3);
  const terrainTint = new THREE.Color('#0b2016'); terrainColors.set(terrainTint.toArray(), 0);
  terrainGeometry.setAttribute('color', new THREE.BufferAttribute(terrainColors, 3));
  const terrain = new THREE.Mesh(terrainGeometry, new THREE.MeshBasicMaterial({ vertexColors: true }));
  terrain.rotation.x = -Math.PI / 2; terrain.position.y = -3.1; scene.add(terrain);
  const dais = new THREE.Mesh(new THREE.TorusGeometry(44, .07, 4, 100), railMaterial); dais.rotation.x = Math.PI / 2; dais.position.y = -2.6; scene.add(dais);

  // Short rail sections cull separately; vertices follow the exact physics curve.
  const divisions = Math.ceil(length / 1.1);
  const frames = Array.from({ length: divisions + 1 }, (_, i) => sampleTrack(track, length * i / divisions, length));
  const railLevels: THREE.LOD[] = [];
  for (let start = 0; start < divisions; start += 64) {
    const section = frames.slice(start, Math.min(divisions + 1, start + 65));
    const near = new THREE.Group(), lod = new THREE.LOD();
    const center = section[Math.floor(section.length / 2)].point;
    const rails = [-.68, .68].map(offset => railGeometry(section, offset, 0, .1));
    const paired = mergeGeometries(rails)!; rails.forEach(geometry => geometry.dispose());
    paired.translate(-center.x, -center.y, -center.z); near.add(new THREE.Mesh(paired, railMaterial));
    const spine = railGeometry(section, 0, -.32, .16).translate(-center.x, -center.y, -center.z); near.add(new THREE.Mesh(spine, dark));
    const segments: THREE.Vector3[] = [];
    for (const offset of [-.68, .68]) for (let i = 1; i < section.length; i++) {
      for (const f of [section[i - 1], section[i]]) segments.push(f.point.clone().addScaledVector(f.side, offset).sub(center));
    }
    const far = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(segments), distantRailMaterial);
    lod.position.copy(center); lod.addLevel(near, 0); lod.addLevel(far, coarse ? 65 : 100, .12); scene.add(lod); railLevels.push(lod);
  }
  const sleepers: THREE.Matrix4[] = [], supports: THREE.Matrix4[] = [], supportFeet: THREE.Matrix4[] = [];
  for (let distance = 0; distance <= length; distance += 1.15) {
    const f = sampleTrack(track, distance, length);
    dummy.position.copy(f.point).addScaledVector(f.up, -.09);
    basis.makeBasis(f.side, f.up, f.tangent.clone().negate()); dummy.quaternion.setFromRotationMatrix(basis);
    dummy.scale.set(2.05, .12, .19); dummy.updateMatrix(); sleepers.push(dummy.matrix.clone());
  }
  const vertical = new THREE.Vector3(0, 1, 0), direction = new THREE.Vector3();
  for (const part of createTrackSupports(track)) {
    direction.subVectors(part.end, part.start);
    dummy.position.copy(part.start).add(part.end).multiplyScalar(.5);
    dummy.quaternion.setFromUnitVectors(vertical, direction.clone().normalize());
    dummy.scale.set(part.radius, direction.length(), part.radius); dummy.updateMatrix(); supports.push(dummy.matrix.clone());
    if (part.kind === 'column') supportFeet.push(matrix(part.start.x, -2.85, part.start.z, .8, .3, .8));
  }
  batchInstances(scene, new THREE.CylinderGeometry(1, 1, 1, 6), dark, supports);
  batchInstances(scene, box, dark, [matrix(0, -1.5, 0, 78, 3, 13), ...supportFeet]);
  const sleeperBatches = batchInstances(scene, box, dark, sleepers, 32);

  const gates = new THREE.Group(); scene.add(gates);
  const gateRecords: { mesh: THREE.Mesh; distance: number }[] = [];
  const gateGeometry = new THREE.TorusGeometry(3.65, .055, 4, 40, Math.PI * 1.72);
  for (let distance = 22; distance < length; distance += 70) {
    const f = sampleTrack(track, distance, length); if (logoClearance(f.point) < 9) continue;
    const mesh = new THREE.Mesh(gateGeometry, railMaterial); mesh.position.copy(f.point).addScaledVector(f.up, 1.8);
    basis.makeBasis(f.side, f.up, f.tangent.clone().negate()); mesh.quaternion.setFromRotationMatrix(basis);
    gates.add(mesh); gateRecords.push({ mesh, distance });
  }
  const cart = createCoasterCart(), player = new THREE.Group(); scene.add(cart, player);
  player.add(new THREE.Mesh(new THREE.SphereGeometry(.65, 8, 6), railMaterial));
  const beacons = new Map<string, THREE.Group>();
  const beaconDistances = new Map<string, number>();
  // One palette per world: individual removals retain shared GPU resources;
  // disposeObject(scene) releases them once when the world is unmounted.
  const stationBox = box;
  const retained = { geometries: new Set<THREE.BufferGeometry>([stationBox]), materials: new Set<THREE.Material>([dark, railMaterial]) };
  function syncGates() { gateRecords.forEach(gate => { gate.mesh.visible = ![...beaconDistances.values()].some(distance => Math.min(Math.abs(gate.distance - distance), length - Math.abs(gate.distance - distance)) < 22); }); }
  let level: QualityLevel = coarse ? 1 : 2;
  function addStation(id: string, stop: StationPlacement, index: number, title: string, kind: 'event' | 'waypoint' = 'event') {
    if (beacons.has(id)) return;
    const f = sampleTrack(track, stop.distance, length), beacon = new THREE.Group();
    beacon.name = `Station ${index + 1}: ${title}`; beacon.position.copy(f.point);
    basis.makeBasis(f.side, f.up, f.tangent.clone().negate()); beacon.quaternion.setFromRotationMatrix(basis);
    const structural: THREE.Matrix4[] = [], lights: THREE.Matrix4[] = [];
    if (kind === 'waypoint') {
      const waypointGeometry = new THREE.OctahedronGeometry(.48);
      for (const side of [-1, 1]) {
        structural.push(matrix(side * 2.8, -.5, 0, 1.2, .3, 3.8), matrix(side * 2.8, 1.2, 0, .14, 2.6, .14));
        lights.push(matrix(side * 2.8, -.3, 0, .07, .07, 3.8));
        const gem = new THREE.Mesh(waypointGeometry, railMaterial); gem.position.set(side * 2.8, 2.9, 0); beacon.add(gem);
      }
    } else {
      for (const side of [-1, 1]) {
      structural.push(matrix(side * 3.3, -.65, 0, 3.2, .35, 12)); lights.push(matrix(side * 1.74, -.45, 0, .07, .07, 12));
      for (const z of [-5.4, 5.4]) structural.push(matrix(side * 4.55, 1.9, z, .2, 4.6, .2));
    }
    structural.push(matrix(0, 4.5, 0, 10, .2, 13)); lights.push(matrix(0, 4.35, 0, 1.3, .06, 10));
    }
    batchInstances(beacon, stationBox, dark, structural, 100); batchInstances(beacon, stationBox, railMaterial, lights, 100);
    const label = document.createElement('canvas'); label.width = 512; label.height = 128; const context = label.getContext('2d');
    if (context && kind === 'event') {
      context.fillStyle = '#06140c'; context.fillRect(0, 0, 512, 128); context.strokeStyle = MINT; context.strokeRect(2, 2, 508, 124);
      context.fillStyle = MINT; context.textAlign = 'center'; context.font = '16px sans-serif'; context.fillText(`STATION ${String(index + 1).padStart(2, '0')}`, 256, 34);
      context.font = '24px sans-serif'; context.fillText(title.length > 34 ? `${title.slice(0, 33)}…` : title, 256, 83, 470);
      const texture = new THREE.CanvasTexture(label); texture.colorSpace = THREE.SRGBColorSpace;
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 1.65), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })); sign.position.set(0, 3.3, -5.8); beacon.add(sign);
    }
    beacon.traverse(object => { object.updateMatrix(); object.matrixAutoUpdate = false; }); scene.add(beacon); beacons.set(id, beacon);
    beaconDistances.set(id, stop.distance); syncGates();
  }
  scene.traverse(object => { if (object !== scene && object !== cart && object !== player) { object.updateMatrix(); object.matrixAutoUpdate = false; } });
  return {
    cart, player, addStation,
    removeStation(id: string) { const beacon = beacons.get(id); if (beacon) { disposeObject(beacon, retained); beacons.delete(id); beaconDistances.delete(id); syncGates(); } },
    setQuality(value: QualityLevel) {
      level = value;
      railLevels.forEach(lod => { lod.levels[1].distance = [40, 65, 100][value]; });
    },
    update(_elapsed: number, _reduced: boolean, mapBlend: number, camera: THREE.Camera) {
      gates.visible = level > 0 && mapBlend < .85;
      cart.visible = mapBlend < .15; player.visible = mapBlend > .5;
      for (const batch of sleeperBatches) batch.visible = mapBlend < .85 && batch.boundingSphere!.center.distanceToSquared(camera.position) < (level === 2 ? 100 : 55) ** 2;
    },
  };
}
