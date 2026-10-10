import { audioAllowed, disposeAudio, onAudioQuiet, setSoundSettings, soundSnapshot, withAudio, type AudioGraph } from './audio-engine.ts';

export type SoundCue = 'click' | 'toggle' | 'swoosh' | 'pageTurn' | 'cardFan' | 'bookOpen' | 'bookClose' | 'woodPlace' | 'woodRemove' | 'woodGrab' | 'woodThrow' | 'woodImpact' | 'rebuild' | 'boost' | 'brake' | 'arrival' | 'depart' | 'success' | 'error';
const voices = new Set<() => void>();
const lastPlayed = new Map<SoundCue, number>();
const cooldown: Partial<Record<SoundCue, number>> = { pageTurn: 100, cardFan: 90, woodRemove: 100, woodPlace: 100, woodImpact: 65, boost: 240, brake: 350, arrival: 500 };
onAudioQuiet(() => { voices.forEach(stop => stop()); lastPlayed.clear(); });

/** Short attack/release ramps remove digital clicks; timing uses the audio clock. */
export function playSound(cue: SoundCue, strength = 1, direction = 1) {
  if (!audioAllowed()) return;
  const now = performance.now();
  if (now - (lastPlayed.get(cue) ?? -Infinity) < (cooldown[cue] ?? 30)) return;
  lastPlayed.set(cue, now);
  withAudio(graph => synthesize(graph, cue, Math.max(.1, Math.min(1, Number.isFinite(strength) ? strength : 1)), direction));
}

function synthesize({ context: ctx, output, noise }: AudioGraph, cue: SoundCue, strength: number, direction: number) {
  // Bound overlap during fast scrolling and a whole tower collapsing at once.
  while (voices.size >= 18) voices.values().next().value?.();
  const nodes: AudioNode[] = [], sources: AudioScheduledSourceNode[] = [];
  const bus = ctx.createGain(); bus.gain.value = strength; bus.connect(output); nodes.push(bus);
  const start = ctx.currentTime;
  let remaining = 0, stopped = false;
  const finish = () => { if (--remaining <= 0) { nodes.forEach(node => node.disconnect()); voices.delete(stop); } };
  const stop = () => {
    if (stopped) return;
    stopped = true; voices.delete(stop);
    bus.gain.cancelScheduledValues(ctx.currentTime); bus.gain.setTargetAtTime(0, ctx.currentTime, .004);
    for (const source of sources) { try { source.stop(ctx.currentTime + .025); } catch { /* Already ended. */ } }
  };
  voices.add(stop);
  const envelope = (source: AudioScheduledSourceNode, tail: AudioNode, duration: number, level: number, offset: number) => {
    const gain = ctx.createGain(), time = start + offset;
    gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(level, time + .003);
    gain.gain.exponentialRampToValueAtTime(.0001, time + duration - .008); gain.gain.linearRampToValueAtTime(0, time + duration);
    tail.connect(gain).connect(bus); nodes.push(source, gain); sources.push(source); remaining++;
    source.onended = finish; source.start(time); source.stop(time + duration);
  };
  const tone = (from: number, to: number, duration: number, level: number, offset = 0, type: OscillatorType = 'sine') => {
    const source = ctx.createOscillator(); source.type = type;
    source.frequency.setValueAtTime(from, start + offset); source.frequency.exponentialRampToValueAtTime(to, start + offset + duration);
    envelope(source, source, duration, level, offset);
  };
  const air = (from: number, to: number, duration: number, level: number, offset = 0, q = .65) => {
    const source = ctx.createBufferSource(); source.buffer = noise;
    const filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.Q.value = q;
    filter.frequency.setValueAtTime(from, start + offset); filter.frequency.exponentialRampToValueAtTime(to, start + offset + duration);
    source.connect(filter); nodes.push(filter); envelope(source, filter, duration, level, offset);
  };
  switch (cue) {
    case 'click': tone(920, 580, .055, .32); air(2200, 1400, .035, .20); break;
    case 'toggle': tone(620, 880, .08, .28); tone(1100, 1000, .07, .12, .035); break;
    case 'swoosh': air(500, 2600, .19, .28); tone(420, 700, .12, .06); break;
    case 'pageTurn':
      air(direction < 0 ? 2900 : 1100, direction < 0 ? 1000 : 3200, .24, .35);
      air(4400, 1800, .12, .13, .035); tone(170, 110, .065, .09, .17); break;
    case 'cardFan': air(3000, 1700, .105, .25); tone(700, 450, .045, .07); break;
    case 'bookOpen': air(800, 2200, .22, .23); tone(240, 380, .15, .10, 0, 'triangle'); break;
    case 'bookClose': air(1800, 600, .12, .21); tone(180, 90, .13, .18); break;
    case 'woodGrab': tone(390, 270, .065, .28, 0, 'triangle'); air(1400, 650, .05, .22); break;
    case 'woodRemove': air(580, 1700, .2, .56, 0, 1.4); tone(260, 180, .095, .20, 0, 'triangle'); break;
    case 'woodPlace': case 'woodImpact':
      tone(220, 115, .13, .52); tone(510, 330, .065, .19, 0, 'triangle'); air(1700, 500, .08, .40); break;
    case 'woodThrow': air(800, 3100, .21, .52); break;
    case 'rebuild':
      for (let i = 0; i < 3; i++) { tone(170 + i * 55, 100 + i * 45, .1, .35, i * .06, 'triangle'); air(1000, 450, .07, .22, i * .06); } break;
    case 'boost': air(350, 5200, .42, .32); tone(95, 420, .35, .085, 0, 'triangle'); break;
    case 'brake': air(3100, 450, .3, .2, 0, 1.2); tone(200, 65, .25, .075); break;
    case 'arrival': tone(660, 660, .22, .09); tone(990, 990, .3, .075, .085); break;
    case 'depart': tone(180, 330, .2, .075); air(400, 1300, .2, .14); break;
    case 'success': tone(660, 660, .13, .1); tone(880, 880, .18, .09, .07); tone(1320, 1320, .22, .075, .14); break;
    case 'error': tone(290, 240, .12, .1); tone(240, 190, .16, .09, .09); break;
  }
}

export const sfx = {
  click: () => playSound('click'), toggle: () => playSound('toggle'), swoosh: () => playSound('swoosh'),
  pageTurn: (direction = 1) => playSound('pageTurn', 1, direction), cardFan: () => playSound('cardFan'),
  bookOpen: () => playSound('bookOpen'), bookClose: () => playSound('bookClose'),
  woodPlace: () => playSound('woodPlace'), woodRemove: () => playSound('woodRemove'), woodGrab: () => playSound('woodGrab'),
  woodThrow: (strength = 1) => playSound('woodThrow', strength), woodImpact: (strength: number) => playSound('woodImpact', strength),
  rebuild: () => playSound('rebuild'), boost: () => playSound('boost'), brake: () => playSound('brake'),
  arrival: () => playSound('arrival'), depart: () => playSound('depart'), success: () => playSound('success'), error: () => playSound('error'),
  get muted() { return soundSnapshot().muted; }, set muted(value: boolean) { setSoundSettings({ muted: value }); },
  get volume() { return soundSnapshot().volume; }, set volume(value: number) { setSoundSettings({ volume: value }); },
  dispose: disposeAudio,
};
