import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Member } from '../types';
import { BLOCK_SIZE } from './people-tower-motion';

export const TOWER_PALETTES = [
  { paper: '#2e2224', ink: '#e9e1e2', wood: '#7a718d' },
  { paper: '#292520', ink: '#e8e6e2', wood: '#9b8663' },
  { paper: '#302a28', ink: '#e8e4e2', wood: '#71768d' },
  { paper: '#382f2d', ink: '#e8e3e2', wood: '#83708e' },
  { paper: '#2c2923', ink: '#e8e6e2', wood: '#8a8274' },
  { paper: '#1a1813', ink: '#e9e6e1', wood: '#85797b' },
  { paper: '#36302f', ink: '#e7e4e3', wood: '#8d8171' },
  { paper: '#38332d', ink: '#e8e5e2', wood: '#7f7e80' },
  { paper: '#2e3437', ink: '#e3e6e7', wood: '#6b8493' },
  { paper: '#1c1418', ink: '#eae0e4', wood: '#7a7d84' },
  { paper: '#353130', ink: '#e6e4e4', wood: '#797688' },
  { paper: '#39332c', ink: '#e8e5e2', wood: '#a56b59' },
  { paper: '#171411', ink: '#e9e6e1', wood: '#817d7d' },
  { paper: '#392f2c', ink: '#e8e3e2', wood: '#a55971' },
  { paper: '#2d2a22', ink: '#e9e6e1', wood: '#8e8470' }
];

/** One small, shared grain map adds surface detail without extra meshes. */
function woodTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#e8dfca'; ctx.fillRect(0, 0, 512, 128);
  let seed = 37;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  for (let line = 0; line < 170; line++) {
    const y = random() * 128, amplitude = .5 + random() * 2.5, phase = random() * Math.PI * 2;
    ctx.strokeStyle = line % 4 === 0 ? 'rgba(255,250,224,.2)' : `rgba(97,73,43,${.025 + random() * .065})`;
    ctx.lineWidth = .3 + random() * .6; ctx.beginPath();
    for (let x = 0; x <= 512; x += 8) {
      const yy = y + Math.sin(x / 100 + phase) * amplitude + Math.sin(x / 27 + phase) * .3;
      if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
  return texture;
}

/** Two instanced draws: rounded timber and inset identity plates on all four sides. */
export function createTowerBlocks(scene: THREE.Scene, members: Member[], maxTextureSize: number, simplified = false, maxAnisotropy = 4) {
  const columns = Math.max(1, Math.ceil(Math.sqrt(members.length * 3 / 16)));
  const rows = Math.max(1, Math.ceil(members.length / columns));
  const tileWidth = Math.floor(Math.min(simplified ? 768 : 1024, Math.floor(maxTextureSize / columns), Math.floor(maxTextureSize / rows) * 16 / 3));
  const tileHeight = Math.floor(tileWidth * 3 / 16);
  const canvas = document.createElement('canvas');
  canvas.width = columns * tileWidth; canvas.height = rows * tileHeight;
  const ctx = canvas.getContext('2d')!, offsets = new Float32Array(members.length * 2);
  members.forEach((member, index) => {
    const column = index % columns, row = Math.floor(index / columns), palette = TOWER_PALETTES[index % TOWER_PALETTES.length];
    const number = String(index + 1).padStart(2, '0');
    offsets[index * 2] = column; offsets[index * 2 + 1] = rows - 1 - row;
    ctx.save(); ctx.translate(column * tileWidth, row * tileHeight); ctx.scale(tileWidth / 1024, tileHeight / 192);
    ctx.fillStyle = palette.paper; ctx.fillRect(0, 0, 1024, 192);
    // Hairline brass frame, larger names, and a quiet role line.
    ctx.strokeStyle = '#c4b28a80'; ctx.lineWidth = 1.5; ctx.strokeRect(16, 32, 736, 128);
    ctx.fillStyle = '#b9bd9d'; ctx.font = '14px monospace'; ctx.fillText('NUCLEUS / SJEC', 38, 56);
    ctx.textAlign = 'right'; ctx.font = '17px monospace'; ctx.fillText(number, 729, 57); ctx.textAlign = 'left';
    let size = 44; ctx.font = `500 ${size}px Arial`;
    while (size > 16 && ctx.measureText(member.name).width > 686) ctx.font = `500 ${size -= 1}px Arial`;
    ctx.fillStyle = palette.ink; ctx.fillText(member.name, 38, 111, 686);
    ctx.fillStyle = '#c7ceba'; ctx.font = '17px monospace'; ctx.fillText(member.role.toUpperCase(), 39, 140, 684);
    // Monogram end caps identify blocks even when their long face is turned away.
    ctx.strokeStyle = '#c4b28a65'; ctx.strokeRect(808, 20, 200, 152);
    ctx.textAlign = 'center'; ctx.fillStyle = palette.ink; ctx.font = '500 60px Georgia';
    ctx.fillText(member.initials, 908, 108, 164);
    ctx.fillStyle = '#c4b28a'; ctx.font = '20px monospace'; ctx.fillText(number, 908, 145);
    ctx.restore();
  });
  const atlas = new THREE.CanvasTexture(canvas); atlas.colorSpace = THREE.SRGBColorSpace; atlas.anisotropy = 4;
  // Build the bevel at real plank dimensions, then normalize for instance transforms.
  // This keeps the edge radius consistent on the long and short sides.
  const geometry = new RoundedBoxGeometry(...BLOCK_SIZE, 2, .055);
  geometry.scale(1 / BLOCK_SIZE[0], 1 / BLOCK_SIZE[1], 1 / BLOCK_SIZE[2]); geometry.clearGroups();
  const grain = woodTexture();
  const material = new THREE.MeshStandardMaterial({ map: grain, bumpMap: grain, bumpScale: .012, roughness: .62, metalness: 0 });
  const blocks = new THREE.InstancedMesh(geometry, material, members.length);
  blocks.instanceMatrix.setUsage(THREE.DynamicDrawUsage); blocks.castShadow = true; blocks.receiveShadow = true;
  blocks.frustumCulled = false;
  members.forEach((_, index) => blocks.setColorAt(index, new THREE.Color(TOWER_PALETTES[index % TOWER_PALETTES.length].wood)));
  function plate(width: number, height: number, end: boolean) {
    const plane = new THREE.PlaneGeometry(width, height), uv = plane.getAttribute('uv');
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, (end ? .785 : .005) + uv.getX(i) * (end ? .21 : .735), (end ? .01 : .125) + uv.getY(i) * (end ? .98 : .75));
    }
    return plane;
  }
  const faces = [
    plate(.92, .78, false).translate(0, 0, .501),
    plate(.92, .78, false).rotateY(Math.PI).translate(0, 0, -.501),
    plate(.65, .72, true).rotateY(Math.PI / 2).translate(.501, 0, 0),
    plate(.65, .72, true).rotateY(-Math.PI / 2).translate(-.501, 0, 0),
  ];
  const labelGeometry = mergeGeometries(faces); faces.forEach(face => face.dispose());
  labelGeometry.setAttribute('atlasOffset', new THREE.InstancedBufferAttribute(offsets, 2));
  const labelMaterial = new THREE.MeshStandardMaterial({
    map: atlas, roughness: .68, metalness: 0, emissiveMap: atlas, emissive: 0xffffff, emissiveIntensity: .08,
  });
  labelMaterial.onBeforeCompile = shader => {
    shader.uniforms.atlasScale = { value: new THREE.Vector2(1 / columns, 1 / rows) };
    shader.vertexShader = 'attribute vec2 atlasOffset;\nuniform vec2 atlasScale;\n' + shader.vertexShader.replace(
      '#include <uv_vertex>', '#include <uv_vertex>\nvMapUv = (vMapUv + atlasOffset) * atlasScale;\nvEmissiveMapUv = vMapUv;',
    );
  };
  const labels = new THREE.InstancedMesh(labelGeometry, labelMaterial, members.length);
  labels.instanceMatrix.setUsage(THREE.DynamicDrawUsage); labels.frustumCulled = false;
  scene.add(blocks, labels);
  const pose = new THREE.Object3D(), hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  function update(index: number, visible = true) {
    if (visible) pose.updateMatrix();
    blocks.setMatrixAt(index, visible ? pose.matrix : hidden); labels.setMatrixAt(index, visible ? pose.matrix : hidden);
  }
  function commit() {
    blocks.instanceMatrix.needsUpdate = true; labels.instanceMatrix.needsUpdate = true;
    // Frustum culling is disabled; only an actual pointer raycast needs bounds.
    blocks.boundingSphere = null;
  }
  let currentSimplified: boolean | undefined;
  function setSimplified(value: boolean) {
    if (currentSimplified === value) return;
    currentSimplified = value;
    material.bumpMap = value ? null : grain; material.needsUpdate = true;
    for (const texture of [grain, atlas]) {
      texture.anisotropy = Math.min(maxAnisotropy, value ? 4 : 8); texture.needsUpdate = true;
    }
  }
  setSimplified(simplified);
  function dispose() {
    blocks.removeFromParent(); labels.removeFromParent(); blocks.dispose(); labels.dispose();
    geometry.dispose(); labelGeometry.dispose(); material.dispose(); labelMaterial.dispose(); atlas.dispose(); grain.dispose();
  }
  return { blocks, pose, update, commit, setSimplified, dispose };
}

