# Website sound

The navigation, event books and ride share one sound preference. The speaker button toggles all effects and remembers the choice in local storage. Sound starts after a pointer or keyboard interaction, as required by browser autoplay policies. Effects use generated audio, with no downloads to delay playback.

## Integration

- `src/lib/audio-engine.ts` owns the single interactive AudioContext, reusable noise buffer, master volume, unlock attempts and foreground/mute handling. Default volume is 55%. Unsupported Web Audio or blocked storage does not block the interface.
- `src/lib/sound-effects.ts` defines 19 short effects. Attack/release envelopes avoid abrupt edges, cooldowns prevent repeated input packets from stacking, and ended nodes disconnect. Layered sounds are scheduled on the audio clock.
- `src/lib/interaction-sounds.ts` delegates button, navigation, toggle, selection and validation feedback across routes and portals. Mouse/key presses sound immediately; touch waits for activation so scrolling over a button stays silent. Pointer and click events do not play the same cue twice.
- Event books call `createPageTurnSound` from their actual scroll updates, covering wheel, trackpad, touch, arrow controls and keyboard navigation. Rotation does not replay an old turn.
- `src/lib/event-audio.ts` owns only the ride's wind, rail and boost layers. Speed, slope and braking drive the mix; departures, boosts, braking and station arrivals have distinct cues. Pause, overview, lost focus, mute and disposal fade and release the loops without closing the shared UI context.
- Jenga cues follow grabs, extraction, throws, measured collisions, completed returns and rebuilds. Collision bursts are combined per rendered frame and rate limited.

Use semantic buttons/links for automatic feedback. For an interaction with its own animation or physics cue, add `data-sound="none"` to its control and call the appropriate `sfx` method when that action begins. An explicit `data-sound="swoosh"` (or another cue name) overrides the generic feedback. Avoid adding sounds to every animation frame or to decorative autoplay.

## Validation

Run the focused checks:

```sh
node --test tests/sound-effects.test.mjs tests/event-audio.test.mjs
npx playwright test tests/browser/sound-effects.spec.mjs
npx playwright test tests/browser/ride-navigation.spec.mjs --grep "ride audio follows"
npm run build
```

The browser checks cover mouse, keyboard, touch page turns, preference persistence, unsupported audio, delayed unlock recovery, one shared context, ride cleanup and Jenga feedback. Layout checks span 320–2560px and phone landscape. Offline Web Audio renders verify that every effect produces finite, audible samples with clipping headroom and a silent tail. These checks measure software scheduling; device, operating-system and Bluetooth output latency can still vary.

The wider suite also has unrelated failures observed during this change: existing event counts/order, tower solver timestep expectations, and a navigation fixture expecting six links when the site has seven. The two solver failures were reproduced with the new audio callbacks removed.
