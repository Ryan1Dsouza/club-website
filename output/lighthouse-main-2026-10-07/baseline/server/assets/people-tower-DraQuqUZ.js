import * as THREE from "three";
import { CSS3DObject, CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { B as BLOCK_SIZE, L as LAYER_HEIGHT, t as towerFrame, a as towerExit, s as smooth, b as advanceTowerScroll, c as clamp01, d as towerSlots } from "./people-tower-motion-4WityqE6.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { World, Vec3, SAPBroadphase, Material, ContactMaterial, Body, Plane, Cylinder, Box, AABB, Quaternion, PointToPointConstraint } from "cannon-es";
function towerQuality(width, height, devicePixelRatio, device) {
  const lowEnd = device.cores !== void 0 && device.cores > 0 && device.cores <= 4 || device.memory !== void 0 && device.memory > 0 && device.memory <= 4;
  const mobile = device.coarsePointer || width <= 768;
  const extreme = device.cores !== void 0 && device.cores > 0 && device.cores <= 2 || device.memory !== void 0 && device.memory > 0 && device.memory <= 2;
  const simplified = mobile || lowEnd;
  const maxPixels = lowEnd ? mobile ? 9e5 : 21e5 : mobile ? 14e5 : 36e5;
  const maxRatio = lowEnd && mobile ? 1 : lowEnd ? 1.25 : mobile ? 1.75 : 2;
  return {
    simplified,
    lowEnd,
    detail: extreme ? 0 : simplified ? 1 : 2,
    // On a struggling phone only the 3D buffer may downshift below native
    // resolution. The shared DOM profile and its text stay at full resolution.
    minPixelRatio: extreme ? 0.5 : mobile ? 0.75 : 1,
    pixelRatio: Math.min(devicePixelRatio || 1, maxRatio, Math.sqrt(maxPixels / Math.max(1, width * height))),
    maxTextureSize: extreme ? 1024 : lowEnd ? 2048 : 4096
  };
}
function createTowerQualityController(initial) {
  let detail = initial, scale = 1, duration = 0, frames = 0, slowWindows = 0, severeFrames = 0;
  function reduce() {
    duration = frames = slowWindows = severeFrames = 0;
    if (detail > 0) detail = detail - 1;
    else if (scale > 0.5) scale = Math.max(0.5, scale - 0.25);
    else return false;
    return true;
  }
  return {
    get detail() {
      return detail;
    },
    get scale() {
      return scale;
    },
    reset() {
      duration = frames = slowWindows = severeFrames = 0;
    },
    sample(seconds) {
      if (seconds <= 0 || seconds > 2) {
        this.reset();
        return false;
      }
      severeFrames = seconds > 0.09 ? severeFrames + 1 : 0;
      if (severeFrames >= 3) return reduce();
      duration += seconds;
      frames++;
      if (duration < 0.75) return false;
      const slow = duration / frames > (detail === 0 ? 1 / 24 : 1 / 45);
      duration = frames = 0;
      slowWindows = slow ? slowWindows + 1 : 0;
      if (slowWindows < 2) return false;
      return reduce();
    }
  };
}
function towerPixelRatio(baseRatio, resolutionScale, minimum = 1) {
  return Math.max(Math.min(minimum, baseRatio), baseRatio * resolutionScale);
}
function surfaceTextures() {
  const woodCanvas = document.createElement("canvas");
  woodCanvas.width = woodCanvas.height = 512;
  const woodContext = woodCanvas.getContext("2d");
  woodContext.fillStyle = "#d9c6a6";
  woodContext.fillRect(0, 0, 512, 512);
  let seed = 91;
  const random = () => {
    seed = Math.imul(seed, 1664525) + 1013904223 >>> 0;
    return seed / 4294967296;
  };
  for (let line = 0; line < 420; line++) {
    const y = random() * 512, phase = random() * Math.PI * 2, amplitude = 1 + random() * 4;
    woodContext.strokeStyle = line % 5 === 0 ? "rgba(255,242,211,.14)" : `rgba(89,58,30,${0.025 + random() * 0.05})`;
    woodContext.lineWidth = 0.4 + random() * 0.8;
    woodContext.beginPath();
    for (let x = 0; x <= 512; x += 8) {
      const yy = y + Math.sin(x / 512 * Math.PI * 2 + phase) * amplitude;
      if (x === 0) woodContext.moveTo(x, yy);
      else woodContext.lineTo(x, yy);
    }
    woodContext.stroke();
  }
  const wood = new THREE.CanvasTexture(woodCanvas);
  wood.colorSpace = THREE.SRGBColorSpace;
  wood.wrapS = wood.wrapT = THREE.RepeatWrapping;
  wood.anisotropy = 4;
  const feltCanvas = document.createElement("canvas");
  feltCanvas.width = feltCanvas.height = 128;
  const feltContext = feltCanvas.getContext("2d"), weave = feltContext.createImageData(128, 128);
  for (let i = 0; i < weave.data.length; i += 4) {
    const value = 175 + Math.floor(random() * 35);
    weave.data[i] = weave.data[i + 1] = weave.data[i + 2] = value;
    weave.data[i + 3] = 255;
  }
  feltContext.putImageData(weave, 0, 0);
  const felt = new THREE.CanvasTexture(feltCanvas);
  felt.wrapS = felt.wrapT = THREE.RepeatWrapping;
  return { wood, felt };
}
function createTowerScenery(scene, floorY, towerHeight, detail) {
  const simplified = detail < 2;
  const group = new THREE.Group();
  group.name = "people-tower-scenery";
  scene.add(group);
  const materials = [], geometries = [];
  const { wood, felt } = surfaceTextures();
  const theme = getComputedStyle(document.documentElement);
  const mint = new THREE.Color(theme.getPropertyValue("--mint").trim() || "#c3e5c8");
  const sage = new THREE.Color(theme.getPropertyValue("--muted").trim() || "#93ac97");
  const backdrop = new THREE.Color("#20261e");
  group.add(new THREE.AmbientLight(16773591, 0.4));
  group.add(new THREE.HemisphereLight(mint.clone().lerp(new THREE.Color(16777215), 0.18), 1585700, 0.85));
  const key = new THREE.DirectionalLight(16773855, 2.4);
  key.position.set(-5, towerHeight + 5, 6);
  key.castShadow = !simplified;
  key.shadow.mapSize.setScalar(1024);
  const extent = Math.max(5.5, towerHeight * 0.7);
  Object.assign(key.shadow.camera, { left: -extent, right: extent, top: extent, bottom: -extent, near: 0.5, far: towerHeight * 2 + 22 });
  key.shadow.normalBias = 0.025;
  key.shadow.bias = -2e-4;
  group.add(key);
  const rim = new THREE.DirectionalLight(sage, 0.85);
  rim.position.set(5, 4, -6);
  group.add(rim);
  function material(options) {
    const result = new THREE.MeshStandardMaterial(options);
    materials.push(result);
    return result;
  }
  function mesh(name, geometry, surface, y) {
    geometries.push(geometry);
    const object = new THREE.Mesh(geometry, surface);
    object.name = name;
    object.position.y = y;
    object.receiveShadow = true;
    group.add(object);
    return object;
  }
  const tabletop = new THREE.PlaneGeometry(240, 240);
  const tabletopUV = tabletop.getAttribute("uv");
  for (let i = 0; i < tabletopUV.count; i++) tabletopUV.setXY(i, tabletopUV.getX(i) * 32, tabletopUV.getY(i) * 32);
  const floor = mesh("timber-tabletop", tabletop, material({
    color: 4207915,
    map: wood,
    roughness: 0.86,
    metalness: 0
  }), floorY - 0.28);
  floor.rotation.x = -Math.PI / 2;
  const segments = detail === 0 ? 12 : simplified ? 32 : 64;
  const board = mesh("wooden-board", new THREE.CylinderGeometry(2.6, 2.75, 0.28, segments), material({
    color: 10849899,
    map: wood,
    bumpMap: wood,
    bumpScale: 4e-3,
    roughness: 0.63,
    metalness: 0
  }), floorY - 0.14);
  const inset = new THREE.CircleGeometry(2.48, segments), insetUV = inset.getAttribute("uv");
  for (let i = 0; i < insetUV.count; i++) insetUV.setXY(i, insetUV.getX(i) * 18, insetUV.getY(i) * 18);
  const mat = mesh("green-felt-inset", inset, material({
    color: 1849387,
    bumpMap: felt,
    bumpScale: 3e-3,
    roughness: 1,
    metalness: 0
  }), floorY + 1e-3);
  mat.rotation.x = -Math.PI / 2;
  scene.background = backdrop;
  scene.fog = new THREE.Fog(backdrop, 24, 52);
  const surfaces = [floor, board, mat].map((object) => {
    const standard = object.material;
    const lean = new THREE.MeshLambertMaterial({ color: standard.color, map: standard.map });
    materials.push(lean);
    return { object, standard, lean, bump: standard.bumpMap };
  });
  let currentDetail;
  function setDetail(value) {
    if (currentDetail === value) return;
    const previous = currentDetail;
    currentDetail = value;
    key.castShadow = value === 2;
    if (value < 2) {
      key.shadow.dispose();
      key.shadow.map = null;
    }
    rim.visible = value !== 0;
    if (previous !== void 0) {
      const count = value === 0 ? 12 : value === 1 ? 32 : 64;
      board.geometry.dispose();
      mat.geometry.dispose();
      board.geometry = new THREE.CylinderGeometry(2.6, 2.75, 0.28, count);
      mat.geometry = new THREE.CircleGeometry(2.48, count);
      const uv = mat.geometry.getAttribute("uv");
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 18, uv.getY(i) * 18);
      geometries.push(board.geometry, mat.geometry);
    }
    for (const { object, standard, lean, bump } of surfaces) {
      object.material = value === 0 ? lean : standard;
      standard.bumpMap = value < 2 ? null : bump;
      standard.needsUpdate = true;
    }
    wood.anisotropy = value === 0 ? 1 : value === 1 ? 2 : 4;
    wood.needsUpdate = true;
  }
  setDetail(detail);
  function dispose() {
    group.removeFromParent();
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((surface) => surface.dispose());
    wood.dispose();
    felt.dispose();
    key.shadow.dispose();
    scene.background = null;
    scene.fog = null;
  }
  return { setDetail, dispose };
}
const TOWER_PALETTES = [
  { paper: "#0d2117", ink: "#c3e5c8", wood: "#7a718d" },
  { paper: "#14261b", ink: "#c3e5c8", wood: "#9b8663" },
  { paper: "#10241d", ink: "#c3e5c8", wood: "#71768d" },
  { paper: "#182a20", ink: "#c3e5c8", wood: "#83708e" },
  { paper: "#0c1b12", ink: "#c3e5c8", wood: "#8a8274" },
  { paper: "#0d2117", ink: "#c3e5c8", wood: "#85797b" },
  { paper: "#14261b", ink: "#c3e5c8", wood: "#8d8171" },
  { paper: "#10241d", ink: "#c3e5c8", wood: "#7f7e80" },
  { paper: "#182a20", ink: "#c3e5c8", wood: "#6b8493" },
  { paper: "#0c1b12", ink: "#c3e5c8", wood: "#7a7d84" },
  { paper: "#0d2117", ink: "#c3e5c8", wood: "#797688" },
  { paper: "#14261b", ink: "#c3e5c8", wood: "#a56b59" },
  { paper: "#10241d", ink: "#c3e5c8", wood: "#817d7d" },
  { paper: "#182a20", ink: "#c3e5c8", wood: "#a55971" },
  { paper: "#0c1b12", ink: "#c3e5c8", wood: "#8e8470" }
];
function woodTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#e8dfca";
  ctx.fillRect(0, 0, 512, 128);
  let seed = 37;
  const random = () => {
    seed = Math.imul(seed, 1664525) + 1013904223 >>> 0;
    return seed / 4294967296;
  };
  for (let line = 0; line < 170; line++) {
    const y = random() * 128, amplitude = 0.5 + random() * 2.5, phase = random() * Math.PI * 2;
    ctx.strokeStyle = line % 4 === 0 ? "rgba(255,250,224,.2)" : `rgba(97,73,43,${0.025 + random() * 0.065})`;
    ctx.lineWidth = 0.3 + random() * 0.6;
    ctx.beginPath();
    for (let x = 0; x <= 512; x += 8) {
      const yy = y + Math.sin(x / 100 + phase) * amplitude + Math.sin(x / 27 + phase) * 0.3;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
function createTowerBlocks(scene, members, maxTextureSize, detail = 2, maxAnisotropy = 4) {
  const simplified = detail < 2;
  const columns = Math.max(1, Math.ceil(Math.sqrt(members.length * 3 / 16)));
  const rows = Math.max(1, Math.ceil(members.length / columns));
  const tileWidth = Math.floor(Math.min(simplified ? 768 : 1024, Math.floor(maxTextureSize / columns), Math.floor(maxTextureSize / rows) * 16 / 3));
  const tileHeight = Math.floor(tileWidth * 3 / 16);
  const canvas = document.createElement("canvas");
  canvas.width = columns * tileWidth;
  canvas.height = rows * tileHeight;
  const ctx = canvas.getContext("2d"), offsets = new Float32Array(members.length * 2);
  members.forEach((member, index) => {
    const column = index % columns, row = Math.floor(index / columns), palette = TOWER_PALETTES[index % TOWER_PALETTES.length];
    const number = String(index + 1).padStart(2, "0");
    offsets[index * 2] = column;
    offsets[index * 2 + 1] = rows - 1 - row;
    ctx.save();
    ctx.translate(column * tileWidth, row * tileHeight);
    ctx.scale(tileWidth / 1024, tileHeight / 192);
    ctx.fillStyle = palette.paper;
    ctx.fillRect(0, 0, 1024, 192);
    ctx.strokeStyle = "#c4b28a80";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(16, 32, 736, 128);
    ctx.fillStyle = "#b9bd9d";
    ctx.font = "14px monospace";
    ctx.fillText("NUCLEUS / SJEC", 38, 56);
    ctx.textAlign = "right";
    ctx.font = "17px monospace";
    ctx.fillText(number, 729, 57);
    ctx.textAlign = "left";
    let size = 44;
    ctx.font = `500 ${size}px Arial`;
    while (size > 16 && ctx.measureText(member.name).width > 686) ctx.font = `500 ${size -= 1}px Arial`;
    ctx.fillStyle = palette.ink;
    ctx.fillText(member.name, 38, 111, 686);
    ctx.fillStyle = "#c7ceba";
    ctx.font = "24px monospace";
    ctx.fillText(member.role.toUpperCase(), 39, 140, 684);
    ctx.strokeStyle = "#c4b28a65";
    ctx.strokeRect(808, 20, 200, 152);
    ctx.textAlign = "center";
    ctx.fillStyle = palette.ink;
    ctx.font = "500 60px Georgia";
    ctx.fillText(member.initials, 908, 108, 164);
    ctx.fillStyle = "#c4b28a";
    ctx.font = "20px monospace";
    ctx.fillText(number, 908, 145);
    ctx.restore();
  });
  const atlas = new THREE.CanvasTexture(canvas);
  atlas.colorSpace = THREE.SRGBColorSpace;
  atlas.anisotropy = 4;
  function blockGeometry(level) {
    const result = level === 0 ? new THREE.BoxGeometry(...BLOCK_SIZE) : new RoundedBoxGeometry(...BLOCK_SIZE, level, 0.055);
    result.scale(1 / BLOCK_SIZE[0], 1 / BLOCK_SIZE[1], 1 / BLOCK_SIZE[2]);
    result.clearGroups();
    return result;
  }
  let geometry = blockGeometry(detail);
  const grain = woodTexture();
  const material = new THREE.MeshStandardMaterial({ map: grain, bumpMap: simplified ? null : grain, bumpScale: 0.012, roughness: 0.62, metalness: 0 });
  const leanMaterial = new THREE.MeshLambertMaterial({ map: grain });
  const blocks = new THREE.InstancedMesh(geometry, detail === 0 ? leanMaterial : material, members.length);
  blocks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  blocks.castShadow = true;
  blocks.receiveShadow = true;
  blocks.frustumCulled = false;
  members.forEach((_, index) => blocks.setColorAt(index, new THREE.Color(TOWER_PALETTES[index % TOWER_PALETTES.length].wood)));
  function plate(width, height, end) {
    const plane = new THREE.PlaneGeometry(width, height), uv = plane.getAttribute("uv");
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, (end ? 0.785 : 5e-3) + uv.getX(i) * (end ? 0.21 : 0.735), (end ? 0.01 : 0.125) + uv.getY(i) * (end ? 0.98 : 0.75));
    }
    return plane;
  }
  const faces = [
    plate(0.92, 0.78, false).translate(0, 0, 0.501),
    plate(0.92, 0.78, false).rotateY(Math.PI).translate(0, 0, -0.501),
    plate(0.65, 0.72, true).rotateY(Math.PI / 2).translate(0.501, 0, 0),
    plate(0.65, 0.72, true).rotateY(-Math.PI / 2).translate(-0.501, 0, 0)
  ];
  const labelGeometry = mergeGeometries(faces);
  faces.forEach((face) => face.dispose());
  labelGeometry.setAttribute("atlasOffset", new THREE.InstancedBufferAttribute(offsets, 2));
  const labelMaterial = new THREE.MeshStandardMaterial({
    map: atlas,
    roughness: 0.68,
    metalness: 0,
    emissiveMap: atlas,
    emissive: 16777215,
    emissiveIntensity: 0.08
  });
  const leanLabel = new THREE.MeshLambertMaterial({ map: atlas });
  for (const surface of [labelMaterial, leanLabel]) surface.onBeforeCompile = (shader) => {
    shader.uniforms.atlasScale = { value: new THREE.Vector2(1 / columns, 1 / rows) };
    shader.vertexShader = "attribute vec2 atlasOffset;\nuniform vec2 atlasScale;\n" + shader.vertexShader.replace(
      "#include <uv_vertex>",
      "#include <uv_vertex>\nvMapUv = (vMapUv + atlasOffset) * atlasScale;" + (surface === labelMaterial ? "\nvEmissiveMapUv = vMapUv;" : "")
    );
  };
  const labels = new THREE.InstancedMesh(labelGeometry, detail === 0 ? leanLabel : labelMaterial, members.length);
  labels.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  labels.frustumCulled = false;
  scene.add(blocks, labels);
  const pose = new THREE.Object3D(), hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  function update(index, visible = true) {
    if (visible) pose.updateMatrix();
    blocks.setMatrixAt(index, visible ? pose.matrix : hidden);
    labels.setMatrixAt(index, visible ? pose.matrix : hidden);
  }
  function commit() {
    blocks.instanceMatrix.needsUpdate = true;
    labels.instanceMatrix.needsUpdate = true;
    blocks.boundingSphere = null;
  }
  let currentDetail;
  function setDetail(value) {
    if (currentDetail === value) return;
    if (currentDetail !== void 0) {
      geometry.dispose();
      geometry = blockGeometry(value);
      blocks.geometry = geometry;
      blocks.boundingSphere = null;
      blocks.boundingBox = null;
    }
    currentDetail = value;
    blocks.material = value === 0 ? leanMaterial : material;
    labels.material = value === 0 ? leanLabel : labelMaterial;
    material.bumpMap = value < 2 ? null : grain;
    material.needsUpdate = true;
    for (const texture of [grain, atlas]) {
      texture.anisotropy = Math.min(maxAnisotropy, value === 0 ? 1 : value === 1 ? 4 : 8);
      texture.needsUpdate = true;
    }
  }
  setDetail(detail);
  function dispose() {
    blocks.removeFromParent();
    labels.removeFromParent();
    blocks.dispose();
    labels.dispose();
    geometry.dispose();
    labelGeometry.dispose();
    material.dispose();
    labelMaterial.dispose();
    leanMaterial.dispose();
    leanLabel.dispose();
    atlas.dispose();
    grain.dispose();
  }
  return { blocks, pose, update, commit, setDetail, dispose };
}
const PHYSICS_STEP = 1 / 120;
const PHYSICS_STEP_MOBILE = 1 / 60;
function createTowerPhysics(slots, simplified = false) {
  let detail = typeof simplified === "boolean" ? simplified ? 1 : 2 : simplified;
  let physicsStep = detail < 2 ? PHYSICS_STEP_MOBILE : PHYSICS_STEP;
  let maxSubSteps = detail === 0 ? 2 : detail === 1 ? 3 : 6;
  const floorY = -(Math.ceil(slots.length / 3) - 1) * LAYER_HEIGHT / 2 - BLOCK_SIZE[1] / 2;
  const world = new World({ gravity: new Vec3(0, -9.82, 0), allowSleep: true });
  world.broadphase = new SAPBroadphase(world);
  const solver = world.solver;
  solver.iterations = detail === 0 ? 6 : detail === 1 ? 10 : 24;
  solver.tolerance = 1e-6;
  const wood = new Material("tower-block"), stone = new Material("tower-foundation");
  const contact = { friction: 0.38, restitution: 0, contactEquationStiffness: 1e8, contactEquationRelaxation: 4 };
  world.addContactMaterial(new ContactMaterial(wood, wood, contact));
  world.addContactMaterial(new ContactMaterial(wood, stone, { ...contact, friction: 0.55 }));
  const floor = new Body({ mass: 0, material: stone, shape: new Plane(), position: new Vec3(0, floorY - 0.28, 0) });
  floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(floor);
  const plinth = new Body({ mass: 0, material: stone, shape: new Cylinder(2.6, 2.75, 0.28, detail === 0 ? 8 : 24), position: new Vec3(0, floorY - 0.14, 0) });
  world.addBody(plinth);
  const shape = new Box(new Vec3(BLOCK_SIZE[0] / 2, BLOCK_SIZE[1] / 2, BLOCK_SIZE[2] / 2));
  const bodies = slots.map((slot) => {
    const body = new Body({
      mass: 0.36,
      material: wood,
      shape,
      position: new Vec3(...slot.position),
      linearDamping: 0.08,
      angularDamping: 0.18,
      sleepSpeedLimit: 0.07,
      sleepTimeLimit: 0.8
    });
    body.quaternion.setFromEuler(0, slot.yaw, 0);
    body.previousQuaternion.copy(body.quaternion);
    body.interpolatedQuaternion.copy(body.quaternion);
    world.addBody(body);
    body.sleep();
    return body;
  });
  const anchor = new Body({ type: Body.KINEMATIC, collisionFilterGroup: 0, collisionFilterMask: 0 });
  const storyShape = new Box(new Vec3(...BLOCK_SIZE).scale(0.5));
  const contactBounds = bodies.map(() => new AABB());
  const target = new Vec3(), pivot = new Vec3(), velocity = new Vec3(), pullStart = new Vec3(), pullEnd = new Vec3();
  let joint, held = -1, story = -1, pullTime = -1, accumulator = 0, disposed = false;
  const pendingReturns = /* @__PURE__ */ new Map();
  const storyOrigins = /* @__PURE__ */ new Map();
  const manual = /* @__PURE__ */ new Set();
  function makeDynamic(body) {
    body.type = Body.DYNAMIC;
    body.mass = 0.36;
    body.collisionFilterMask = -1;
    if (body.shapes[0] !== shape) {
      body.removeShape(storyShape);
      body.addShape(shape);
    }
    body.updateMassProperties();
    body.aabbNeedsUpdate = true;
    world.broadphase.dirty = true;
  }
  function restoreManual(index) {
    if (!manual.has(index)) return false;
    const body = bodies[index];
    if (story === index) {
      const origin = storyOrigins.get(index);
      body.position.copy(origin.position);
      body.quaternion.copy(origin.quaternion);
      body.previousPosition.copy(body.position);
      body.interpolatedPosition.copy(body.position);
      body.previousQuaternion.copy(body.quaternion);
      body.interpolatedQuaternion.copy(body.quaternion);
      makeDynamic(body);
      body.sleep();
      story = -1;
    }
    return true;
  }
  function setDetail(value) {
    if (detail === value) return;
    detail = value;
    physicsStep = value < 2 ? PHYSICS_STEP_MOBILE : PHYSICS_STEP;
    maxSubSteps = value === 0 ? 2 : value === 1 ? 3 : 6;
    solver.iterations = value === 0 ? 6 : value === 1 ? 10 : 24;
    accumulator = 0;
    plinth.removeShape(plinth.shapes[0]);
    plinth.addShape(new Cylinder(2.6, 2.75, 0.28, value === 0 ? 8 : 24));
    plinth.aabbNeedsUpdate = true;
    world.broadphase.dirty = true;
  }
  const wake = () => bodies.forEach((body) => {
    if (body.world) body.wakeUp();
  });
  const wakeSupported = (support) => bodies.forEach((body) => {
    if (body.world && body.type === Body.DYNAMIC && body.position.y > support.position.y + 0.01) body.wakeUp();
  });
  function release(throwVelocity) {
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
    joint = void 0;
    held = -1;
    pullTime = -1;
    anchor.velocity.setZero();
  }
  function grab(index, point) {
    release();
    const body = bodies[index];
    if (!body?.world) return false;
    pendingReturns.delete(index);
    body.transition = null;
    body.position.copy(body.interpolatedPosition);
    body.quaternion.copy(body.interpolatedQuaternion);
    body.previousPosition.copy(body.position);
    body.previousQuaternion.copy(body.quaternion);
    if (story === index) story = -1;
    makeDynamic(body);
    manual.add(index);
    storyOrigins.delete(index);
    held = index;
    anchor.position.set(point.x, point.y, point.z);
    target.copy(anchor.position);
    body.pointToLocalFrame(anchor.position, pivot);
    pivot.x = Math.max(-3.18 / 2, Math.min(BLOCK_SIZE[0] / 2, pivot.x));
    pivot.y = Math.max(-0.71 / 2, Math.min(BLOCK_SIZE[1] / 2, pivot.y));
    pivot.z = Math.max(-1.02 / 2, Math.min(BLOCK_SIZE[2] / 2, pivot.z));
    world.addBody(anchor);
    joint = new PointToPointConstraint(body, pivot, anchor, new Vec3(), 100);
    joint.collideConnected = false;
    world.addConstraint(joint);
    wake();
    return true;
  }
  function move(point) {
    if (!joint) return;
    target.set(Math.max(-10, Math.min(10, point.x)), Math.max(floorY + 0.1, Math.min(14, point.y)), Math.max(-10, Math.min(10, point.z)));
  }
  function pull(index) {
    const body = bodies[index];
    if (!body?.world || !grab(index, body.position)) return;
    pullStart.copy(body.position);
    body.quaternion.vmult(new Vec3(slots[index].direction * 4.5, 0, 0), pullEnd);
    pullEnd.vadd(pullStart, pullEnd);
    pullTime = 0;
  }
  function remove(index) {
    if (restoreManual(index)) return;
    if (held === index) release();
    const wasStory = story === index;
    if (wasStory) story = -1;
    const body = bodies[index];
    pendingReturns.delete(index);
    if (body) body.transition = null;
    if (body?.world) {
      world.removeBody(body);
      if (!wasStory) wakeSupported(body);
    }
  }
  function beginStory(index) {
    if (held === index) return;
    if (story >= 0 && story !== index) returnBody(story);
    const body = bodies[index];
    if (!body) return;
    const returning = pendingReturns.has(index) || body.transition?.returning;
    if (pendingReturns.has(index)) {
      pendingReturns.delete(index);
      if (!body.world) world.addBody(body);
    }
    if (!body.world) return;
    if (returning) {
      const origin = storyOrigins.get(index);
      if (origin) {
        body.position.copy(origin.position);
        body.quaternion.copy(origin.quaternion);
      } else {
        const slot = slots[index];
        body.position.set(...slot.position);
        body.quaternion.setFromEuler(0, slot.yaw, 0);
      }
    } else {
      body.position.copy(body.interpolatedPosition);
      body.quaternion.copy(body.interpolatedQuaternion);
      storyOrigins.set(index, { position: body.position.clone(), quaternion: body.quaternion.clone() });
    }
    body.transition = null;
    body.previousPosition.copy(body.position);
    body.interpolatedPosition.copy(body.position);
    body.previousQuaternion.copy(body.quaternion);
    body.interpolatedQuaternion.copy(body.quaternion);
    body.velocity.setZero();
    body.angularVelocity.setZero();
    body.force.setZero();
    body.torque.setZero();
    story = index;
    storyShape.halfExtents.set(BLOCK_SIZE[0] / 2, BLOCK_SIZE[1] / 2, BLOCK_SIZE[2] / 2);
    storyShape.updateConvexPolyhedronRepresentation();
    storyShape.updateBoundingSphereRadius();
    body.type = Body.KINEMATIC;
    body.mass = 0;
    body.collisionFilterMask = 0;
    body.removeShape(shape);
    body.addShape(storyShape);
    body.updateMassProperties();
    body.sleep();
    body.aabbNeedsUpdate = true;
    world.broadphase.dirty = true;
  }
  function placeStory(position, quaternion, size, isFlying2 = true) {
    const body = bodies[story];
    if (!body?.world) return;
    const half = storyShape.halfExtents;
    const x = Math.max(1e-5, size.x / 2), y = Math.max(1e-5, size.y / 2), z = Math.max(1e-5, size.z / 2);
    if (half.x !== x || half.y !== y || half.z !== z) {
      half.set(x, y, z);
      storyShape.updateBoundingSphereRadius();
      body.updateBoundingRadius();
    }
    body.collisionFilterMask = 0;
    body.position.set(position.x, position.y, position.z);
    body.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    body.updateAABB();
    const bounds = body.aabb, margin = 1e-3;
    if (isFlying2) {
      const overlapsXZ = (other) => bounds.lowerBound.x < other.upperBound.x - margin && bounds.upperBound.x > other.lowerBound.x + margin && bounds.lowerBound.z < other.upperBound.z - margin && bounds.upperBound.z > other.lowerBound.z + margin;
      if (plinth.aabbNeedsUpdate) plinth.updateAABB();
      bodies.forEach((other, index) => {
        if (other === body || !other.world) return;
        if (other.aabbNeedsUpdate) other.updateAABB();
        const contact2 = contactBounds[index];
        contact2.copy(other.aabb);
        if (other.sleepState !== Body.SLEEPING) {
          other.shapes[0].calculateWorldAABB(other.interpolatedPosition, other.interpolatedQuaternion, contact2.lowerBound, contact2.upperBound);
          contact2.extend(other.aabb);
        }
      });
      let lift = Math.max(0, (overlapsXZ(plinth.aabb) ? floorY : floorY - 0.28) + margin - bounds.lowerBound.y);
      for (let pass = 0; pass < bodies.length; pass++) {
        const before = lift;
        for (let index = 0; index < bodies.length; index++) {
          const other = bodies[index], contact2 = contactBounds[index];
          if (other === body || !other.world || !other.collisionFilterMask) continue;
          if (overlapsXZ(contact2) && bounds.lowerBound.y + lift < contact2.upperBound.y - margin && bounds.upperBound.y + lift > contact2.lowerBound.y + margin) {
            lift = contact2.upperBound.y + margin - bounds.lowerBound.y;
          }
        }
        if (before === lift) break;
      }
      body.position.y += lift;
      position.y = body.position.y;
    }
    body.previousPosition.copy(body.position);
    body.interpolatedPosition.copy(body.position);
    body.previousQuaternion.copy(body.quaternion);
    body.interpolatedQuaternion.copy(body.quaternion);
    body.aabbNeedsUpdate = true;
    world.broadphase.dirty = true;
  }
  function reset(completed = 0) {
    release();
    story = -1;
    accumulator = 0;
    pendingReturns.clear();
    storyOrigins.clear();
    manual.clear();
    bodies.forEach((body, index) => {
      const slot = slots[index];
      const oldPos = body.interpolatedPosition.clone();
      const oldQuat = body.interpolatedQuaternion.clone();
      const dist = oldPos.distanceTo(new Vec3(...slot.position));
      const needsTransition = body.world && dist > 0.01;
      body.type = Body.DYNAMIC;
      body.mass = 0.36;
      body.collisionFilterMask = -1;
      if (body.shapes[0] !== shape) {
        body.removeShape(storyShape);
        body.addShape(shape);
      }
      body.position.set(...slot.position);
      body.quaternion.setFromEuler(0, slot.yaw, 0);
      body.updateMassProperties();
      body.previousPosition.copy(body.position);
      body.interpolatedPosition.copy(body.position);
      body.previousQuaternion.copy(body.quaternion);
      body.interpolatedQuaternion.copy(body.quaternion);
      body.velocity.setZero();
      body.angularVelocity.setZero();
      body.force.setZero();
      body.torque.setZero();
      body.aabbNeedsUpdate = true;
      if (index < completed) {
        if (body.world) world.removeBody(body);
      } else {
        if (!body.world) world.addBody(body);
        body.sleep();
      }
      if (needsTransition) {
        body.transition = { time: 0, fromPos: oldPos, fromQuat: oldQuat };
      } else {
        body.transition = null;
      }
    });
    world.broadphase.dirty = true;
  }
  function returnBody(index) {
    const body = bodies[index];
    if (!body) return;
    if (restoreManual(index)) return;
    const slot = slots[index];
    if (story === index) story = -1;
    if (body.shapes[0] !== shape) {
      body.removeShape(storyShape);
      body.addShape(shape);
    }
    if (body.world) world.removeBody(body);
    pendingReturns.delete(index);
    const targetPos = new Vec3(...slot.position);
    const targetQuat = new Quaternion();
    targetQuat.setFromEuler(0, slot.yaw, 0);
    const dir = slot.direction;
    const turned = slot.yaw !== 0;
    const fromPos = new Vec3(...slot.position);
    if (turned) {
      fromPos.x += dir * 5.5;
      fromPos.y += 1.2;
    } else {
      fromPos.z += dir * 5.5;
      fromPos.y += 1.2;
    }
    const fromQuat = new Quaternion();
    fromQuat.setFromEuler(0.6 * dir, slot.yaw + 0.5 * dir, 0.8 * dir);
    const delay = slot.layer * 0.45;
    if (delay <= 0) {
      body.type = Body.KINEMATIC;
      body.mass = 0;
      body.collisionFilterMask = 0;
      body.position.copy(fromPos);
      body.quaternion.copy(fromQuat);
      body.previousPosition.copy(fromPos);
      body.interpolatedPosition.copy(fromPos);
      body.previousQuaternion.copy(fromQuat);
      body.interpolatedQuaternion.copy(fromQuat);
      body.velocity.setZero();
      body.angularVelocity.setZero();
      body.force.setZero();
      body.torque.setZero();
      body.aabbNeedsUpdate = true;
      world.addBody(body);
      body.sleep();
      body.transition = { time: 0, returning: true, fromPos, fromQuat, toPos: targetPos, toQuat: targetQuat };
    } else {
      pendingReturns.set(index, { delay, fromPos, fromQuat, toPos: targetPos, toQuat: targetQuat });
    }
    world.broadphase.dirty = true;
  }
  const moving = () => held >= 0 || pendingReturns.size > 0 || bodies.some((body) => body.world && body.type === Body.DYNAMIC && body.sleepState !== Body.SLEEPING || body.transition);
  function step(delta) {
    if (disposed || !moving()) return false;
    if (pendingReturns.size > 0) {
      pendingReturns.forEach((p, index) => {
        p.delay -= delta;
        if (p.delay <= 0) {
          pendingReturns.delete(index);
          const body = bodies[index];
          if (!body) return;
          body.type = Body.KINEMATIC;
          body.mass = 0;
          body.collisionFilterMask = 0;
          body.position.copy(p.fromPos);
          body.quaternion.copy(p.fromQuat);
          body.previousPosition.copy(p.fromPos);
          body.interpolatedPosition.copy(p.fromPos);
          body.previousQuaternion.copy(p.fromQuat);
          body.interpolatedQuaternion.copy(p.fromQuat);
          body.velocity.setZero();
          body.angularVelocity.setZero();
          body.force.setZero();
          body.torque.setZero();
          body.aabbNeedsUpdate = true;
          if (!body.world) world.addBody(body);
          body.sleep();
          body.transition = { time: 0, returning: true, fromPos: p.fromPos, fromQuat: p.fromQuat, toPos: p.toPos, toQuat: p.toQuat };
          world.broadphase.dirty = true;
        }
      });
    }
    const simulating = held >= 0 || bodies.some((body) => body.world && body.type === Body.DYNAMIC && body.sleepState !== Body.SLEEPING);
    if (simulating) accumulator = Math.min(physicsStep * maxSubSteps, accumulator + Math.max(0, delta));
    else accumulator = 0;
    let changed = false;
    while (accumulator >= physicsStep) {
      if (joint) {
        if (pullTime >= 0) {
          pullTime += physicsStep;
          pullStart.lerp(pullEnd, Math.min(1, pullTime / 0.7), target);
        }
        target.vsub(anchor.position, velocity);
        velocity.scale(18, velocity);
        const speed = velocity.length();
        const maxSpeed = pullTime >= 0 ? 7 : 14;
        if (speed > maxSpeed) velocity.scale(maxSpeed / speed, velocity);
        anchor.velocity.copy(velocity);
      }
      world.step(physicsStep);
      accumulator -= physicsStep;
      changed = true;
      if (pullTime >= 1) release();
    }
    const alpha = accumulator / physicsStep;
    bodies.forEach((body) => {
      if (body.type === Body.DYNAMIC && body.sleepState !== Body.SLEEPING) {
        body.previousPosition.lerp(body.position, alpha, body.interpolatedPosition);
        body.previousQuaternion.slerp(body.quaternion, alpha, body.interpolatedQuaternion);
        body.transition = null;
      } else {
        body.interpolatedPosition.copy(body.position);
        body.interpolatedQuaternion.copy(body.quaternion);
        if (body.transition) {
          const t = body.transition;
          t.time += delta;
          const progress = Math.min(1, t.time / 0.35);
          const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          if (t.returning) {
            if (t.time < 0) {
              body.interpolatedPosition.copy(t.fromPos);
              body.interpolatedQuaternion.copy(t.fromQuat);
            } else {
              const arcProgress = Math.min(1, t.time / 0.35);
              const arcEase = arcProgress < 0.5 ? 2 * arcProgress * arcProgress : 1 - Math.pow(-2 * arcProgress + 2, 2) / 2;
              t.fromPos.lerp(t.toPos, arcEase, body.position);
              t.fromQuat.slerp(t.toQuat, arcEase, body.quaternion);
              body.previousPosition.copy(body.position);
              body.interpolatedPosition.copy(body.position);
              body.previousQuaternion.copy(body.quaternion);
              body.interpolatedQuaternion.copy(body.quaternion);
              if (arcProgress >= 1) {
                body.type = Body.DYNAMIC;
                body.mass = 0.36;
                body.collisionFilterMask = -1;
                body.updateMassProperties();
                body.velocity.setZero();
                body.angularVelocity.setZero();
                body.force.setZero();
                body.torque.setZero();
                body.aabbNeedsUpdate = true;
                world.broadphase.dirty = true;
                body.sleep();
                body.transition = null;
              }
            }
          } else {
            t.fromPos.lerp(body.position, ease, body.interpolatedPosition);
            t.fromQuat.slerp(body.quaternion, ease, body.interpolatedQuaternion);
            if (progress >= 1) body.transition = null;
          }
          changed = true;
        }
      }
    });
    return changed || moving();
  }
  function dispose() {
    if (disposed) return;
    release();
    disposed = true;
    pendingReturns.clear();
    storyOrigins.clear();
    manual.clear();
    [...world.bodies].forEach((body) => world.removeBody(body));
    world.contacts.length = 0;
    world.frictionEquations.length = 0;
  }
  const isPending = (index) => pendingReturns.has(index);
  const isFlying = (index) => isPending(index) || !!bodies[index].transition;
  const isManual = (index) => manual.has(index);
  const isStory = (index) => story === index;
  return { world, bodies, floorY, step, moving, setDetail, isPending, isFlying, isManual, isStory, grab, move, release, pull, remove, beginStory, placeStory, reset, returnBody, dispose };
}
function makeProfile() {
  const element = document.createElement("div");
  element.className = "tower-profile";
  element.innerHTML = '<div class="tower-profile__meta"><span>NUCLEUS / SJEC</span><span data-profile-index></span></div><div class="tower-profile__monogram"></div><div class="tower-profile__photo-fade"></div><span class="tower-profile__cross">+</span><div class="tower-profile__copy"><p class="tower-profile__role"></p><div class="tower-profile__name"><span></span><span></span></div></div><div class="tower-profile__footer"><span>The people / Nucleus</span><span>Keep scrolling ↗</span></div>';
  return element;
}
async function createPeopleTower(host, section, members, callbacks, portraits) {
  const cleanups = [];
  let disposed = false, compiled = false;
  function dispose() {
    if (disposed) return;
    disposed = true;
    while (cleanups.length) cleanups.pop()();
  }
  try {
    let updateProfile = function(index) {
      const member = members[index];
      const parts = member.name.split(" ");
      const palette = TOWER_PALETTES[index % TOWER_PALETTES.length];
      profile.style.setProperty("--tower-paper", palette.paper);
      profile.style.setProperty("--tower-ink", palette.ink);
      const profileName = profile.querySelector(".tower-profile__name");
      profileName.children[0].textContent = parts[0];
      profileName.children[1].textContent = parts.slice(1).join(" ");
      profile.querySelector(".tower-profile__role").textContent = member.role;
      profile.querySelector(".tower-profile__monogram").textContent = member.initials;
      profile.querySelector("[data-profile-index]").textContent = `${String(index + 1).padStart(2, "0")} / ${String(members.length).padStart(2, "0")}`;
      sizeProfileName(index);
      portraits.show(index, profile);
    }, sizeProfileName = function(index) {
      const parts = members[index].name.split(" ");
      const longest = Math.max(parts[0].length, parts.slice(1).join(" ").length);
      const portraitLayout = width <= 760 && height > 500;
      const fontSize = Math.min(profileHeight * (portraitLayout && height < 700 ? 0.14 : 0.19), profileWidth * (portraitLayout ? 0.86 : 0.45) / (Math.max(5, longest) * 0.49));
      profile.style.setProperty("--profile-name", `${fontSize}px`);
    }, releasePointer = function(velocity) {
      const id = pointerId;
      pointerId = -1;
      draggedIndex = -1;
      physics.release(velocity);
      if (id >= 0 && renderer.domElement.hasPointerCapture(id)) renderer.domElement.releasePointerCapture(id);
      delete host.dataset.dragging;
    }, syncStory = function(state) {
      const desiredRemoved = state.completed;
      if (active === state.index && storyRemoved === desiredRemoved) return;
      if (active >= 0 && active !== state.index && active >= state.completed) physics.returnBody(active);
      if (state.completed < storyRemoved) {
        for (let i = storyRemoved - 1; i >= state.completed; i--) physics.returnBody(i);
        if (storyRemoved === members.length) {
          for (let i = 0; i < state.completed; i++) physics.remove(i);
        }
      }
      for (let i = storyRemoved; i < state.completed; i++) physics.remove(i);
      storyRemoved = state.completed;
      if (state.completed === members.length) {
        for (let i = members.length - 1; i >= 0; i--) physics.returnBody(i);
      }
      active = state.index;
      if (active >= 0) {
        updateProfile(active);
        physics.beginStory(active);
        const body = physics.bodies[active];
        activeSource.copy(body.position);
        activeQuaternion.copy(body.quaternion);
      }
      callbacks.onMember(active);
      matricesDirty = true;
    }, render = function(state, transformsChanged, cameraMoved) {
      const changedProgress = renderedProgress !== progress;
      if (changedProgress) {
        section.style.setProperty("--tower-intro", String(1 - state.intro));
        section.style.setProperty("--tower-progress", String(progress));
        section.style.setProperty("--tower-outro", String(state.outro));
        host.dataset.activeMember = String(state.index);
      }
      const previous = towerFrame(renderedProgress, members.length);
      if (!transformsChanged && !matricesDirty && !cameraMoved && state.index >= 0 && previous.index === state.index && previous.local >= 0.43 && previous.local <= 0.76 && state.local >= 0.43 && state.local <= 0.76) {
        renderedProgress = progress;
        return;
      }
      const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const radius = Math.max(10, 2.6 / (halfFov * camera.aspect), (layers * LAYER_HEIGHT / 2 + 1.1) / halfFov);
      const angle = 0.68 + idleAngle;
      camera.position.set(Math.sin(angle) * radius, radius * 0.32, Math.cos(angle) * radius);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
      right.set(1, 0, 0).applyQuaternion(camera.quaternion);
      up.set(0, 1, 0).applyQuaternion(camera.quaternion);
      camera.getWorldDirection(forward);
      const distance = 4.8;
      const viewHeight = 2 * halfFov * distance;
      targetScale.set(viewHeight * camera.aspect * profileWidth / width, viewHeight * profileHeight / height, 0.16);
      destination.copy(camera.position).addScaledVector(forward, distance + 0.08).addScaledVector(up, (height / 2 - profileTop - profileHeight / 2) / height * viewHeight);
      const exitState = towerExit(state.local);
      const labelsChanged = matricesDirty || changedProgress || cameraMoved;
      profile.style.opacity = state.index >= 0 && physics.isStory(state.index) ? String(exitState.opacity) : "0";
      if (transformsChanged || matricesDirty || changedProgress || cameraMoved && state.index >= 0) {
        const block = batch.pose;
        physics.bodies.forEach((body, index) => {
          if (!transformsChanged && !matricesDirty && index !== state.index) return;
          const slot = slots[index];
          if (!body.world || physics.isPending(index)) {
            batch.update(index, false);
            return;
          }
          block.position.copy(body.interpolatedPosition);
          block.quaternion.copy(body.interpolatedQuaternion);
          block.scale.copy(plankScale);
          const storyBlock = index === state.index && physics.isStory(index);
          if (storyBlock) {
            source.copy(activeSource);
            block.position.copy(source);
            block.quaternion.copy(activeQuaternion);
            const t = state.local, pull = smooth(t / 0.1), flight = smooth((t - 0.1) / 0.24), unfold = smooth((t - 0.2) / 0.23);
            direction.set(slot.direction, 0, 0).applyQuaternion(activeQuaternion);
            pulled.copy(source).addScaledVector(direction, BLOCK_SIZE[0] + 0.35);
            block.position.lerp(pulled, pull);
            if (t > 0.1) {
              control1.copy(pulled).addScaledVector(direction, 2);
              control1.y = THREE.MathUtils.lerp(control1.y, destination.y, 0.85);
              control2.copy(destination).addScaledVector(right, slot.direction * targetScale.x * 0.45).addScaledVector(up, -0.4);
              curve.v0.copy(pulled);
              curve.v1.copy(control1);
              curve.v2.copy(control2);
              curve.v3.copy(destination);
              curve.getPoint(flight, block.position);
              tumbleQuaternion.setFromEuler(euler.set(0.85 * slot.spin, slot.yaw + 0.6 * slot.direction, 1.3 * slot.direction));
              block.quaternion.slerp(tumbleQuaternion, smooth(Math.max(0, t - 0.14) / 0.1));
              block.quaternion.slerp(camera.quaternion, smooth((t - 0.23) / 0.2));
            }
            block.scale.lerp(targetScale, unfold);
            const floorClearance = THREE.MathUtils.lerp(Math.min(source.y, physics.floorY + 0.3), physics.floorY + 0.3, unfold);
            block.position.y = Math.max(block.position.y, floorClearance);
            const exit = exitState.progress;
            if (exit > 0) {
              block.position.addScaledVector(right, slot.direction * targetScale.x * 1.55 * exit).addScaledVector(up, (index % 3 - 1) * targetScale.y * 0.7 * exit).addScaledVector(forward, 2.7 * exit);
              exitQuaternion.setFromEuler(euler.set(-0.18 * exit, 0.4 * slot.direction * exit, -0.45 * slot.direction * exit));
              block.quaternion.multiply(exitQuaternion);
            }
            block.scale.multiplyScalar(exitState.scale);
            physics.placeStory(block.position, block.quaternion, block.scale, t > 0.1 && t < 0.35);
            faceOffset.set(0, 0, block.scale.z / 2 + 8e-3).applyQuaternion(block.quaternion);
            profileObject.position.copy(block.position).add(faceOffset);
            profileObject.quaternion.copy(block.quaternion);
            profileObject.scale.set(block.scale.x / profileWidth, block.scale.y / profileHeight, 1);
          }
          batch.update(index, !storyBlock || exitState.opacity < 1);
        });
        batch.commit();
        renderer.shadowMap.needsUpdate = renderer.shadowMap.enabled;
        matricesDirty = false;
      }
      renderer.render(scene, camera);
      if (labelsChanged) css.render(labels, camera);
      renderedProgress = progress;
    }, draw = function(time) {
      frame = 0;
      if (disposed || !visible || document.hidden) return;
      const elapsed = (time - previousTime) / 1e3;
      previousTime = time;
      if (adaptive.sample(elapsed)) layoutDirty = true;
      if (detail === 0 && !layoutDirty && time - previousUpdate < 1e3 / 30 - 1) {
        frame = requestAnimationFrame(draw);
        return;
      }
      const updateElapsed = (time - previousUpdate) / 1e3;
      previousUpdate = time;
      const dt = Math.max(0, Math.min(0.05, updateElapsed));
      try {
        if (layoutDirty) measure();
        sampleScroll();
        if (!initialized) {
          scrollMotion.value = target;
          initialized = true;
        }
        progress = advanceTowerScroll(scrollMotion, target, updateElapsed, 32);
        const state = towerFrame(progress, members.length);
        const idleOrbit = detail === 2 && state.index < 0 && state.completed === 0 && state.outro === 0;
        const orbiting = idleOrbit && pointerId < 0 && time - lastInteraction > 1e3;
        if (orbiting) idleAngle = (idleAngle + dt * 0.16) % (Math.PI * 2);
        syncStory(state);
        const transformsChanged = physics.step(dt);
        if (transformsChanged || matricesDirty || progress !== renderedProgress || orbiting && time - lastRenderTime >= 1e3 / 30) {
          render(state, transformsChanged, orbiting);
          lastRenderTime = time;
        }
        const scrollSettling = time - lastInteraction < 200;
        if (idleOrbit || physics.moving() || progress !== target || layoutDirty || scrollDirty || scrollSettling) frame = requestAnimationFrame(draw);
        else adaptive.reset();
      } catch {
        dispose();
        callbacks.onError();
      }
    }, wake = function() {
      if (compiled && !frame && !disposed && visible && !document.hidden) {
        previousTime = previousUpdate = performance.now();
        adaptive.reset();
        frame = requestAnimationFrame(draw);
      }
    }, scroll = function() {
      scrollDirty = true;
      lastInteraction = performance.now();
      wake();
    }, getScrollPosition = function() {
      return window.scrollY;
    }, sampleScroll = function() {
      scrollDirty = false;
      if (pinnedViewport.matches) return;
      const next = clamp01((getScrollPosition() - start) / range);
      if (next !== target) lastInteraction = performance.now();
      target = next;
    }, resize = function() {
      layoutDirty = true;
      scrollDirty = true;
      wake();
    }, measure = function() {
      layoutDirty = false;
      const nextWidth = Math.max(1, host.clientWidth), nextHeight = Math.max(1, host.clientHeight);
      const header = parseFloat(getComputedStyle(stage).top) || 0;
      start = pinnedViewport.matches ? 0 : section.getBoundingClientRect().top + getScrollPosition() - header;
      range = pinnedViewport.matches ? nextHeight * (members.length * 0.55 + 0.2) : Math.max(1, section.offsetHeight - stage.offsetHeight);
      device.coarsePointer = coarsePointer.matches;
      quality = towerQuality(nextWidth, nextHeight, window.devicePixelRatio, device);
      detail = Math.min(detail, quality.detail, adaptive.detail);
      const baseRatio = detail === 0 ? Math.min(quality.pixelRatio, 1, Math.sqrt(45e4 / (nextWidth * nextHeight))) : quality.pixelRatio;
      const ratio = towerPixelRatio(baseRatio, adaptive.scale, detail === 0 ? 0.5 : quality.minPixelRatio);
      const sizeChanged = width !== nextWidth || height !== nextHeight;
      if (device.coarsePointer && width === nextWidth && height !== nextHeight) {
        window.clearTimeout(viewportResizeTimer);
        viewportResizeTimer = window.setTimeout(() => {
          viewportResizeTimer = 0;
          layoutDirty = true;
          wake();
        }, 150);
      } else if (width !== nextWidth) {
        window.clearTimeout(viewportResizeTimer);
        viewportResizeTimer = 0;
      }
      if (!viewportResizeTimer && (bufferWidth !== nextWidth || bufferHeight !== nextHeight || renderer.getPixelRatio() !== ratio)) {
        renderer.setDrawingBufferSize(nextWidth, nextHeight, ratio);
        bufferWidth = nextWidth;
        bufferHeight = nextHeight;
        matricesDirty = true;
      }
      if (sizeChanged) {
        matricesDirty = true;
        width = nextWidth;
        height = nextHeight;
        css.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        const portraitLayout = width <= 760 && height > 500;
        profileTop = height <= 500 ? 82 : portraitLayout ? 148 : 100;
        const bottomSpace = height <= 500 ? 88 : portraitLayout ? 154 : 104;
        profileWidth = width * 0.9;
        profileHeight = Math.max(160, height - profileTop - bottomSpace);
        const monogramSize = Math.min(profileHeight * 0.57, profileWidth * 0.6);
        profile.style.width = `${profileWidth}px`;
        profile.style.height = `${profileHeight}px`;
        profile.style.setProperty("--profile-monogram", `${monogramSize}px`);
        if (active >= 0) sizeProfileName(active);
      }
      if (renderer.shadowMap.enabled !== (detail === 2) || host.dataset.quality !== String(detail)) matricesDirty = true;
      renderer.shadowMap.enabled = detail === 2;
      batch.setDetail(detail);
      scenery.setDetail(detail);
      physics.setDetail(detail);
      host.dataset.quality = String(detail);
      scrollDirty = true;
    }, cast = function(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
    }, pointerDown = function(event) {
      if (event.button !== 0 || !event.isPrimary || pointerId >= 0) return;
      cast(event);
      const hit = raycaster.intersectObject(batch.blocks)[0];
      let index = hit?.instanceId, point = hit?.point;
      if (active >= 0 && physics.isStory(active) && Number(profile.style.opacity) === 1) {
        direction.set(0, 0, 1).applyQuaternion(profileObject.quaternion);
        profilePlane.setFromNormalAndCoplanarPoint(direction, profileObject.position);
        if (raycaster.ray.intersectPlane(profilePlane, profilePoint)) {
          profileObject.worldToLocal(profileLocal.copy(profilePoint));
          if (Math.abs(profileLocal.x) <= profileWidth / 2 && Math.abs(profileLocal.y) <= profileHeight / 2 && (!hit || raycaster.ray.origin.distanceTo(profilePoint) < hit.distance)) {
            index = active;
            point = profilePoint;
          }
        }
      }
      if (index === void 0 || !point || !physics.grab(index, point)) {
        if (pinnedViewport.matches && event.pointerType !== "mouse") {
          gestureId = event.pointerId;
          lastGestureY = event.clientY;
          renderer.domElement.setPointerCapture(event.pointerId);
        }
        return;
      }
      pointerId = event.pointerId;
      draggedIndex = index;
      downX = event.clientX;
      downY = event.clientY;
      travelled = 0;
      lastDragPoint.copy(point);
      throwVelocity.set(0, 0, 0);
      lastDragTime = performance.now();
      camera.getWorldDirection(forward);
      dragPlane.setFromNormalAndCoplanarPoint(forward, point);
      renderer.domElement.setPointerCapture(pointerId);
      host.dataset.dragging = "true";
      matricesDirty = true;
      lastInteraction = performance.now();
      wake();
    }, pointerMove = function(event) {
      if (event.pointerId === gestureId) {
        seek(target + (lastGestureY - event.clientY) / range);
        lastGestureY = event.clientY;
        return;
      }
      if (event.pointerId !== pointerId) return;
      travelled = Math.max(travelled, Math.hypot(event.clientX - downX, event.clientY - downY));
      cast(event);
      if (raycaster.ray.intersectPlane(dragPlane, dragPoint)) {
        const now = performance.now(), elapsed = Math.max(8e-3, (now - lastDragTime) / 1e3);
        pointerVelocity.copy(dragPoint).sub(lastDragPoint).divideScalar(elapsed).clampLength(0, 14);
        throwVelocity.lerp(pointerVelocity, 0.65);
        lastDragPoint.copy(dragPoint);
        lastDragTime = now;
        physics.move(dragPoint);
      }
      lastInteraction = performance.now();
      wake();
    }, pointerUp = function(event) {
      if (event.pointerId === gestureId) {
        gestureId = -1;
        if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
      }
      if (event.pointerId !== pointerId) return;
      const index = draggedIndex, click = travelled < 6 && event.type === "pointerup";
      const throwing = !click && event.type === "pointerup" && performance.now() - lastDragTime < 120;
      releasePointer(throwing ? throwVelocity : void 0);
      if (click) physics.pull(index);
      lastInteraction = performance.now();
      wake();
    }, seek = function(next) {
      if (disposed) return;
      if (pinnedViewport.matches) target = clamp01(next);
      else window.scrollTo({ top: start + clamp01(next) * range, behavior: "instant" });
      lastInteraction = performance.now();
      wake();
    }, wheel = function(event) {
      if (!pinnedViewport.matches || event.ctrlKey || event.target.closest("select")) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1;
      seek(target + event.deltaY * unit / range);
    }, keydown = function(event) {
      if (!pinnedViewport.matches || section.closest("[inert]") || event.altKey || event.ctrlKey || event.metaKey) return;
      const control = event.target;
      if (control.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]') || event.key === " " && control.closest("button, a")) return;
      const delta = { ArrowDown: 80, ArrowUp: -80, PageDown: height * 0.65, PageUp: -height * 0.65, " ": height * (event.shiftKey ? -0.65 : 0.65) }[event.key];
      if (delta === void 0 && event.key !== "Home" && event.key !== "End") return;
      event.preventDefault();
      seek(event.key === "Home" ? 0 : event.key === "End" ? 1 : target + delta / range);
    }, changeViewportMode = function() {
      const saved = target;
      measure();
      seek(saved);
      resize();
    }, rebuild = function() {
      if (disposed) return;
      releasePointer();
      physics.reset();
      storyRemoved = 0;
      active = -2;
      progress = target = 0;
      idleAngle = 0;
      scrollMotion.value = 0;
      scrollMotion.velocity = 0;
      matricesDirty = true;
      renderedProgress = -1;
      lastInteraction = performance.now();
      seek(0);
    };
    const coarsePointer = matchMedia("(pointer: coarse)");
    const pinnedViewport = matchMedia("(max-width: 760px), (pointer: coarse)");
    const device = {
      coarsePointer: coarsePointer.matches,
      cores: navigator.hardwareConcurrency,
      memory: navigator.deviceMemory
    };
    let quality = towerQuality(host.clientWidth, host.clientHeight, window.devicePixelRatio, device);
    const adaptive = createTowerQualityController(quality.detail);
    let detail = quality.detail;
    const renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: !quality.lowEnd,
      powerPreference: quality.simplified ? "low-power" : "high-performance"
    });
    cleanups.push(() => {
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.shadowMap.enabled = !quality.simplified;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    const css = new CSS3DRenderer();
    css.domElement.className = "people-tower__labels";
    cleanups.push(() => css.domElement.remove());
    const scene = new THREE.Scene(), labels = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 150);
    const slots = towerSlots(members.map((member) => member.id)), layers = Math.ceil(members.length / 3);
    const physics = createTowerPhysics(slots, detail);
    cleanups.push(physics.dispose);
    const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const batch = createTowerBlocks(scene, members, Math.min(quality.maxTextureSize, renderer.capabilities.maxTextureSize), detail, anisotropy);
    cleanups.push(batch.dispose);
    const scenery = createTowerScenery(scene, physics.floorY, layers * LAYER_HEIGHT, detail);
    cleanups.push(scenery.dispose);
    const profile = makeProfile(), profileObject = new CSS3DObject(profile);
    profile.style.pointerEvents = "none";
    profile.style.opacity = "0";
    labels.add(profileObject);
    cleanups.push(() => profileObject.removeFromParent());
    const stage = host.parentElement;
    let width = 1, height = 1, profileWidth = 1, profileHeight = 1, profileTop = 0;
    let bufferWidth = 0, bufferHeight = 0, viewportResizeTimer = 0;
    let start = 0, range = 1, target = 0, progress = 0, frame = 0, previousTime = 0;
    let active = -2, storyRemoved = 0, visible = true, idleAngle = 0, lastInteraction = -Infinity;
    let matricesDirty = true, renderedProgress = -1, lastRenderTime = 0;
    let layoutDirty = true, scrollDirty = true, initialized = false;
    let previousUpdate = 0;
    const scrollMotion = { value: 0, velocity: 0 };
    const right = new THREE.Vector3(), up = new THREE.Vector3(), forward = new THREE.Vector3();
    const source = new THREE.Vector3(), pulled = new THREE.Vector3(), activeSource = new THREE.Vector3();
    const control1 = new THREE.Vector3(), control2 = new THREE.Vector3(), destination = new THREE.Vector3();
    const direction = new THREE.Vector3(), faceOffset = new THREE.Vector3(), targetScale = new THREE.Vector3();
    const activeQuaternion = new THREE.Quaternion(), tumbleQuaternion = new THREE.Quaternion(), exitQuaternion = new THREE.Quaternion();
    const euler = new THREE.Euler(), curve = new THREE.CubicBezierCurve3();
    const plankScale = new THREE.Vector3(...BLOCK_SIZE);
    const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(), dragPlane = new THREE.Plane(), dragPoint = new THREE.Vector3();
    const profilePlane = new THREE.Plane(), profilePoint = new THREE.Vector3(), profileLocal = new THREE.Vector3();
    const lastDragPoint = new THREE.Vector3(), throwVelocity = new THREE.Vector3(), pointerVelocity = new THREE.Vector3();
    let lastDragTime = 0;
    let pointerId = -1, draggedIndex = -1, downX = 0, downY = 0, travelled = 0;
    let gestureId = -1, lastGestureY = 0;
    cleanups.push(() => {
      window.clearTimeout(viewportResizeTimer);
      cancelAnimationFrame(frame);
      releasePointer();
      section.style.removeProperty("--tower-intro");
      section.style.removeProperty("--tower-progress");
      section.style.removeProperty("--tower-outro");
      delete host.dataset.activeMember;
      delete host.dataset.dragging;
      delete host.dataset.quality;
    });
    const resizeObserver = new ResizeObserver(resize);
    cleanups.push(() => resizeObserver.disconnect());
    resizeObserver.observe(host);
    resizeObserver.observe(section);
    const intersection = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (!visible) {
        cancelAnimationFrame(frame);
        frame = 0;
        adaptive.reset();
        releasePointer();
      } else resize();
    });
    cleanups.push(() => intersection.disconnect());
    intersection.observe(host);
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        adaptive.reset();
        releasePointer();
      } else resize();
    };
    const contextLost = (event) => {
      event.preventDefault();
      dispose();
      callbacks.onError();
    };
    cleanups.push(() => {
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", resize);
      stage.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", keydown);
      pinnedViewport.removeEventListener("change", changeViewportMode);
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointermove", pointerMove);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("pointercancel", pointerUp);
      renderer.domElement.removeEventListener("lostpointercapture", pointerUp);
    });
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointermove", pointerMove);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    renderer.domElement.addEventListener("pointercancel", pointerUp);
    renderer.domElement.addEventListener("lostpointercapture", pointerUp);
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    stage.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", keydown);
    pinnedViewport.addEventListener("change", changeViewportMode);
    document.addEventListener("visibilitychange", visibility);
    host.append(renderer.domElement, css.domElement);
    await renderer.compileAsync(scene, camera);
    if (disposed) throw new Error("Tower initialization was interrupted");
    compiled = true;
    resize();
    return { dispose, rebuild, seek };
  } catch (error) {
    dispose();
    throw error;
  }
}
export {
  createPeopleTower
};
