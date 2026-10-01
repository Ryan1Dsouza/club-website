export const TOWER_INTRO = .15;
export const TOWER_OUTRO = .15;
export const BLOCK_SIZE = [3.18, .71, 1.02] as const;
export const LAYER_HEIGHT = BLOCK_SIZE[1] + .002;

const ROLE_RANK: Record<string, number> = {
  president: 0, 'vice president': 1, vp: 1, secretary: 2, treasurer: 3,
  'plan & strategy lead': 4, 'technical lead': 5, 'tech lead': 5,
  'ai & ml lead': 6, 'development lead': 7, 'dsa lead': 8,
  'event lead': 9, 'media lead': 10, 'discipline head': 11,
};
function roleRank(role: string) {
  const key = role.trim().toLowerCase();
  return ROLE_RANK[key] ?? (/lead|head/.test(key) ? 50 : 100);
}
/** Story order is top to bottom. Dated additions follow the established team;
 * newest additions form the foundation, including newly appointed officers.
 * Legacy entries have no creation date, so use rank, then stable API order. */
export function sortTowerMembers<T extends { role: string; createdAt?: string }>(members: readonly T[]): T[] {
  const created = (member: T) => Date.parse(member.createdAt ?? '') || 0;
  return [...members].sort((a, b) => created(a) - created(b) || roleRank(a.role) - roleRank(b.role));
}
export const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
export function smooth(value: number) {
  const t = clamp01(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
}
export type TowerScroll = { value: number; velocity: number };

/** Exact critically damped response: scroll events change the destination, not
 * the rendered pose. Retaining velocity filters uneven touch/wheel samples. */
export function advanceTowerScroll(scroll: TowerScroll, target: number, delta: number, response = 16) {
  target = clamp01(target);
  // This analytic filter has no solver to destabilize. Use elapsed time even
  // on slow frames, instead of making scrolling run in slow motion below 20 Hz.
  // Visibility changes reset the renderer clock; cap only exceptional stalls.
  const dt = Math.max(0, Math.min(.25, delta));
  if (!dt) return scroll.value;
  const offset = scroll.value - target;
  if (!offset) { scroll.velocity = 0; return scroll.value; }
  // A direction change should respond immediately, without drifting backwards.
  if (scroll.velocity * offset > 0) scroll.velocity = 0;
  const decay = Math.exp(-response * dt), impulse = (scroll.velocity + response * offset) * dt;
  const next = target + (offset + impulse) * decay;
  scroll.velocity = (scroll.velocity - response * impulse) * decay;
  scroll.value = clamp01(next);
  if ((next - target) * offset < 0 || (Math.abs(next - target) < 1e-6 && Math.abs(scroll.velocity) < 1e-5)) {
    scroll.value = target; scroll.velocity = 0;
  }
  return scroll.value;
}

/** Finish disappearing before the next member owns the shared DOM profile.
 * The short zero-size tail also tolerates rounding at timeline boundaries. */
export function towerExit(local: number) {
  const progress = local >= .98 ? 1 : clamp01(smooth((local - .76) / .22));
  return { progress, scale: 1 - progress, opacity: smooth((local - .25) / .13) * (1 - progress) };
}
function hash(value: string) {
  let result = 2166136261;
  for (let i = 0; i < value.length; i++) result = Math.imul(result ^ value.charCodeAt(i), 16777619);
  return result >>> 0;
}
/** Fill every foundation layer before the next, with story leaders at the top. */
export function towerSlots(ids: readonly string[]) {\n  const layers = Math.ceil(ids.length / 3);\n  const ranks = Array.from({ length: ids.length }, (_, i) => i);\n  for (let i = ranks.length - 1; i > 0; i--) {\n    const j = Math.floor(Math.abs(Math.sin(i * 12.9898 + 78.233)) * 100000) % (i + 1);\n    const temp = ranks[i]; ranks[i] = ranks[j]; ranks[j] = temp;\n  }\n  return ids.map((id, index) => {\n    const rank = ranks[index];\n    const layer = Math.floor(rank / 3), count = Math.min(3, ids.length - layer * 3);\n    const lane = rank % 3 - (count - 1) / 2, turned = layer % 2 === 1;\n    const seed = hash(id);\n    return {\n      rank, layer, yaw: turned ? Math.PI / 2 : 0,\n      position: [turned ? lane * 1.055 : 0, (layer - (layers - 1) / 2) * LAYER_HEIGHT, turned ? 0 : lane * 1.055] as const,\n      direction: seed % 2 ? 1 : -1,\n      spin: (seed % 3 - 1) * .35 + .8,\n    };\n  });\n}\nexport function towerFrame(progress: number, count: number) {
  const duration = TOWER_INTRO + Math.max(0, count) + TOWER_OUTRO;
  const time = clamp01(progress) * duration, memberTime = time - TOWER_INTRO;
  const index = count < 1 || memberTime < 0 || memberTime >= count ? -1 : Math.floor(memberTime);
  return {
    index, local: index < 0 ? 0 : memberTime - index,
    intro: smooth(time / TOWER_INTRO), outro: smooth((memberTime - count) / TOWER_OUTRO),
    completed: Math.max(0, Math.min(count, Math.floor(memberTime))),
  };
}
export function memberProgress(index: number, count: number) {
  if (count < 1) return 0;
  return (TOWER_INTRO + Math.max(0, Math.min(count - 1, index)) + .59) / (TOWER_INTRO + count + TOWER_OUTRO);
}
