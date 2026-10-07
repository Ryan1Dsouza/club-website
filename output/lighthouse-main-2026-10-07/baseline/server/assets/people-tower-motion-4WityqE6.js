const TOWER_INTRO = 0.15;
const TOWER_OUTRO = 0.15;
const BLOCK_SIZE = [3.18, 0.71, 1.02];
const LAYER_HEIGHT = BLOCK_SIZE[1] + 2e-3;
const clamp01 = (value) => Math.max(0, Math.min(1, value));
function smooth(value) {
  const t = clamp01(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
}
function advanceTowerScroll(scroll, target, delta, response = 16) {
  target = clamp01(target);
  const dt = Math.max(0, Math.min(0.25, delta));
  if (!dt) return scroll.value;
  const offset = scroll.value - target;
  if (!offset) {
    scroll.velocity = 0;
    return scroll.value;
  }
  if (scroll.velocity * offset > 0) scroll.velocity = 0;
  const decay = Math.exp(-response * dt), impulse = (scroll.velocity + response * offset) * dt;
  const next = target + (offset + impulse) * decay;
  scroll.velocity = (scroll.velocity - response * impulse) * decay;
  scroll.value = clamp01(next);
  if ((next - target) * offset < 0 || Math.abs(next - target) < 1e-6 && Math.abs(scroll.velocity) < 1e-5) {
    scroll.value = target;
    scroll.velocity = 0;
  }
  return scroll.value;
}
function towerExit(local) {
  const progress = local >= 0.98 ? 1 : clamp01(smooth((local - 0.76) / 0.22));
  return { progress, scale: 1 - progress, opacity: smooth((local - 0.33) / 0.1) * (1 - progress) };
}
function hash(value) {
  let result = 2166136261;
  for (let i = 0; i < value.length; i++) result = Math.imul(result ^ value.charCodeAt(i), 16777619);
  return result >>> 0;
}
function towerSlots(ids) {
  const layers = Math.ceil(ids.length / 3);
  const ranks = ids.map((_, i) => ids.length - 1 - i);
  return ids.map((id, index) => {
    const rank = ranks[index];
    const layer = Math.floor(rank / 3), count = Math.min(3, ids.length - layer * 3);
    const lane = rank % 3 - (count - 1) / 2, turned = layer % 2 === 1;
    const seed = hash(id);
    return {
      rank,
      layer,
      yaw: turned ? Math.PI / 2 : 0,
      position: [turned ? lane * 1.055 : 0, (layer - (layers - 1) / 2) * LAYER_HEIGHT, turned ? 0 : lane * 1.055],
      direction: seed % 2 ? 1 : -1,
      spin: (seed % 3 - 1) * 0.35 + 0.8
    };
  });
}
function towerFrame(progress, count) {
  const duration = TOWER_INTRO + Math.max(0, count) + TOWER_OUTRO;
  const time = clamp01(progress) * duration, memberTime = time - TOWER_INTRO;
  const index = count < 1 || memberTime < 0 || memberTime >= count ? -1 : Math.floor(memberTime);
  return {
    index,
    local: index < 0 ? 0 : memberTime - index,
    intro: smooth(time / TOWER_INTRO),
    outro: smooth((memberTime - count) / TOWER_OUTRO),
    completed: Math.max(0, Math.min(count, Math.floor(memberTime)))
  };
}
function memberProgress(index, count) {
  if (count < 1) return 0;
  return (TOWER_INTRO + Math.max(0, Math.min(count - 1, index)) + 0.59) / (TOWER_INTRO + count + TOWER_OUTRO);
}
export {
  BLOCK_SIZE as B,
  LAYER_HEIGHT as L,
  towerExit as a,
  advanceTowerScroll as b,
  clamp01 as c,
  towerSlots as d,
  memberProgress as m,
  smooth as s,
  towerFrame as t
};
