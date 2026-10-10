import { audioAllowed, onAudioQuiet, prepareAudio, unlockAudio } from './audio-engine.ts';
import { sfx } from './sound-effects.ts';

/** Bounded speed envelope shared by every device and travel direction. */
export function windEnvelope(speed: number, active: boolean) {
  const pace = Math.min(1.6, Math.abs(Number.isFinite(speed) ? speed : 0));
  return { gain: active ? .045 * Math.pow(pace / 1.6, 1.5) : 0, frequency: 220 + pace * 420 };
}
export type RideSoundState = { boost?: boolean; braking?: boolean; slope?: number };

/** Shares the website output and preference; owns only the ride's continuous layers. */
export function createRideAudio() {
  let enabled = true, disposed = false, lastGain = 0, lastUpdate = -Infinity;
  let boosting = false, braking = false, moving = false;
  let layers: ReturnType<typeof createLayers> | null = null;

  function createLayers() {
    const graph = prepareAudio();
    if (!graph || graph.context.state !== 'running') return null;
    const { context, output, noise } = graph;
    const source = context.createBufferSource(); source.buffer = noise; source.loop = true;
    const highpass = context.createBiquadFilter(); highpass.type = 'highpass'; highpass.frequency.value = 100;
    const windFilter = context.createBiquadFilter(); windFilter.type = 'lowpass'; windFilter.Q.value = .6;
    const wind = context.createGain(); wind.gain.value = 0;
    source.connect(highpass).connect(windFilter).connect(wind).connect(output);
    const railFilter = context.createBiquadFilter(); railFilter.type = 'bandpass'; railFilter.frequency.value = 95; railFilter.Q.value = .8;
    const rail = context.createGain(); rail.gain.value = 0;
    source.connect(railFilter).connect(rail).connect(output);
    const boostFilter = context.createBiquadFilter(); boostFilter.type = 'bandpass'; boostFilter.Q.value = .5;
    const boost = context.createGain(); boost.gain.value = 0;
    source.connect(boostFilter).connect(boost).connect(output);
    const nodes = [source, highpass, windFilter, wind, railFilter, rail, boostFilter, boost];
    source.onended = () => nodes.forEach(node => node.disconnect());
    source.start();
    return { context, source, windFilter, wind, railFilter, rail, boostFilter, boost };
  }

  function quiet() {
    lastGain = 0; lastUpdate = -Infinity; boosting = braking = moving = false;
    if (!layers) return;
    const { context, source, wind, rail, boost } = layers;
    for (const gain of [wind, rail, boost]) {
      gain.gain.cancelScheduledValues(context.currentTime);
      gain.gain.setTargetAtTime(0, context.currentTime, .02);
    }
    source.stop(context.currentTime + .12); layers = null;
  }
  const unsubscribe = onAudioQuiet(quiet);
  return {
    get running() { return !!layers && layers.context.state === 'running' && audioAllowed(); },
    get gain() { return lastGain; },
    async setEnabled(value: boolean) {
      if (disposed) return;
      enabled = value;
      if (!value) { quiet(); return; }
      await unlockAudio();
    },
    update(speed: number, active: boolean, state: RideSoundState = {}) {
      if (disposed) return;
      if (!enabled || !active || !audioAllowed()) { quiet(); return; }
      const pace = Math.min(2.6, Math.abs(Number.isFinite(speed) ? speed : 0));
      if (state.boost && !boosting) sfx.boost();
      if (state.braking && !braking && pace > .12) sfx.brake();
      if (pace > .06 && !moving && !state.boost) sfx.depart();
      const changed = boosting !== !!state.boost || braking !== !!state.braking;
      boosting = !!state.boost; braking = !!state.braking; moving = pace > .06;
      if (pace < .015 && !boosting) { if (layers) quiet(); return; }
      layers ??= createLayers();
      if (!layers) return;
      const { context, wind, windFilter, rail, railFilter, boost, boostFilter } = layers;
      const now = context.currentTime;
      if (!changed && now - lastUpdate < 1 / 30) return;
      lastUpdate = now;
      const envelope = windEnvelope(pace, true);
      const slope = Number.isFinite(state.slope) ? Math.max(-1, Math.min(1, state.slope!)) : 0;
      lastGain = envelope.gain;
      // Continuous interpolation follows acceleration without audible stepping.
      wind.gain.setTargetAtTime(envelope.gain * 3, now, .045);
      windFilter.frequency.setTargetAtTime(450 + pace * 1050 + Math.max(0, -slope) * 350, now, .06);
      rail.gain.setTargetAtTime(Math.min(.1, pace * .055), now, .04);
      railFilter.frequency.setTargetAtTime(75 + pace * 95, now, .05);
      boost.gain.setTargetAtTime(boosting ? Math.min(.11, .03 + pace * .035) : 0, now, .04);
      boostFilter.frequency.setTargetAtTime(1100 + pace * 850, now, .05);
    },
    arrive() { if (enabled && !disposed) { quiet(); sfx.arrival(); } },
    quiet,
    dispose() { if (disposed) return; quiet(); disposed = true; unsubscribe(); },
  };
}

export type RideAudio = ReturnType<typeof createRideAudio>;
