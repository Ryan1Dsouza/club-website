/** A bounded wind bed; speed is measured as a fraction of the normal cruise speed. */
export function windEnvelope(speed: number, active: boolean) {
  const pace = Math.min(1.6, Math.abs(Number.isFinite(speed) ? speed : 0));
  return { gain: active ? .045 * Math.pow(pace / 1.6, 1.5) : 0, frequency: 220 + pace * 420 };
}

/** Created only by the Sound button: no downloads, microphone, or autoplay. */
export function createRideAudio() {
  const context = new AudioContext({ latencyHint: 'playback' });
  const source = context.createBufferSource();
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  source.buffer = buffer; source.loop = true;
  const highpass = context.createBiquadFilter(); highpass.type = 'highpass'; highpass.frequency.value = 70;
  const lowpass = context.createBiquadFilter(); lowpass.type = 'lowpass'; lowpass.frequency.value = 220; lowpass.Q.value = .5;
  const volume = context.createGain(); volume.gain.value = 0;
  source.connect(highpass).connect(lowpass).connect(volume).connect(context.destination);
  source.start();
  let enabled = false, disposed = false, quieting = false, lastUpdate = -1, lastGain = 0;
  let suspension: ReturnType<typeof setTimeout> | undefined;
  let resuming: Promise<void> | undefined;
  const cancelSuspension = () => { clearTimeout(suspension); suspension = undefined; };
  const resume = () => {
    if (context.state === 'running') return Promise.resolve();
    return resuming ??= context.resume().finally(() => { resuming = undefined; });
  };
  function quiet() {
    if (disposed || quieting) return;
    quieting = true; lastGain = 0; lastUpdate = -1;
    volume.gain.setTargetAtTime(0, context.currentTime, .06);
    if (suspension === undefined) suspension = setTimeout(() => {
      suspension = undefined;
      if (!disposed) void context.suspend().catch(() => {});
    }, 300);
  }
  return {
    get running() { return context.state === 'running'; },
    get gain() { return lastGain; },
    async setEnabled(value: boolean) {
      if (disposed) return;
      enabled = value;
      if (!value) { quiet(); return; }
      quieting = false; cancelSuspension();
      try { await resume(); } catch (error) { enabled = false; throw error; }
    },
    update(speed: number, active: boolean) {
      if (disposed) return;
      if (!enabled || !active) { quiet(); return; }
      quieting = false; cancelSuspension();
      if (context.state !== 'running') { void resume().catch(() => { enabled = false; }); return; }
      const now = context.currentTime;
      if (now - lastUpdate < .1) return; // Ten audio updates per second, independent of frame rate.
      lastUpdate = now;
      const envelope = windEnvelope(speed, true); lastGain = envelope.gain;
      volume.gain.setTargetAtTime(envelope.gain, now, .22);
      lowpass.frequency.setTargetAtTime(envelope.frequency, now, .3);
    },
    quiet,
    dispose() {
      if (disposed) return;
      disposed = true; cancelSuspension(); source.stop();
      source.disconnect(); highpass.disconnect(); lowpass.disconnect(); volume.disconnect();
      void context.close().catch(() => {});
    },
  };
}

export type RideAudio = ReturnType<typeof createRideAudio>;
