/** One low-latency output for UI, books and the 3D experiences. */
export type AudioGraph = { context: AudioContext; output: GainNode; noise: AudioBuffer };
export const SOUND_STORAGE_KEY = 'nucleus.sound.v3';
const defaults = { muted: false, volume: 1.0 };
let settings = defaults;
let graph: AudioGraph | null = null;
let initialized = false, unlocked = false, foreground = true;
let resuming: Promise<void> | null = null;
const listeners = new Set<() => void>();
const quietListeners = new Set<() => void>();

export const soundSnapshot = () => settings;
export const serverSoundSnapshot = () => defaults;
export function subscribeSound(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function onAudioQuiet(listener: () => void) { quietListeners.add(listener); return () => { quietListeners.delete(listener); }; }
export const audioAllowed = () => unlocked && foreground && !settings.muted && settings.volume > 0 && (typeof document === 'undefined' || !document.hidden);

function applyVolume() {
  if (!graph) return;
  const { context, output } = graph;
  output.gain.cancelScheduledValues(context.currentTime);
  output.gain.setTargetAtTime(audioAllowed() ? settings.volume : 0, context.currentTime, .008);
}

export function initializeSound() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  try {
    const saved = JSON.parse(localStorage.getItem(SOUND_STORAGE_KEY) ?? 'null');
    if (saved && typeof saved.muted === 'boolean' && Number.isFinite(saved.volume)) settings = { muted: saved.muted, volume: Math.max(0, Math.min(1, saved.volume)) };
  } catch { /* Storage can be unavailable in private browsing. */ }
  listeners.forEach(listener => listener());
}

export function setSoundSettings(next: Partial<typeof defaults>) {
  initializeSound();
  settings = { muted: next.muted ?? settings.muted, volume: Number.isFinite(next.volume) ? Math.max(0, Math.min(1, next.volume!)) : settings.volume };
  if (settings.muted || !settings.volume) quietListeners.forEach(listener => listener());
  applyVolume();
  try { localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(settings)); } catch { /* Keep the in-memory preference. */ }
  listeners.forEach(listener => listener());
}

/** Prepares reusable noise outside the input/render hot path; never starts sound. */
export function prepareAudio(): AudioGraph | null {
  if (graph?.context.state === 'closed') graph = null;
  if (graph || typeof window === 'undefined') return graph;
  initializeSound();
  const Audio = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Audio) return null;
  try {
    const context = new Audio({ latencyHint: 'interactive' });
    const output = context.createGain(); output.gain.value = 0; output.connect(context.destination);
    const noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const samples = noise.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    graph = { context, output, noise }; applyVolume(); return graph;
  } catch { return null; }
}

/** Call synchronously inside a pointer/key gesture, including on iOS Safari. */
export function unlockAudio(): Promise<void> {
  unlocked = true;
  const ready = prepareAudio();
  if (!ready) return Promise.resolve();
  applyVolume();
  if (ready.context.state === 'running') return Promise.resolve();
  // Retry on each real gesture: Safari may reject pointerdown but accept pointerup.
  // Reusing a still-pending resume here would prevent that second unlock attempt.
  try {
    const attempt = ready.context.resume().catch(() => {}).finally(() => { if (resuming === attempt) resuming = null; });
    resuming = attempt;
  } catch { return Promise.resolve(); }
  return resuming;
}

/** A blocked gesture must never replay a backlog when audio becomes available. */
export function withAudio(play: (value: AudioGraph) => void) {
  if (!audioAllowed()) return;
  const ready = prepareAudio();
  if (!ready) return;
  if (ready.context.state === 'running') { play(ready); return; }
  const requested = performance.now();
  void (resuming ?? unlockAudio()).then(() => {
    if (graph === ready && ready.context.state === 'running' && audioAllowed() && performance.now() - requested < 400) play(ready);
  });
}

export function setAudioForeground(active: boolean) {
  foreground = active;
  if (!active) quietListeners.forEach(listener => listener());
  applyVolume();
}

export function disposeAudio() {
  quietListeners.forEach(listener => listener());
  if (graph) void graph.context.close().catch(() => {});
  graph = null; resuming = null; unlocked = false;
}
