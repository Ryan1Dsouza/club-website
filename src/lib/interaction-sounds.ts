import { initializeSound, prepareAudio, setAudioForeground, unlockAudio } from './audio-engine.ts';
import { playSound, sfx, type SoundCue } from './sound-effects.ts';

const selector = 'button, a[href], summary, select, input[type="checkbox"], input[type="radio"], input[type="submit"], [role="button"], [role="tab"], [role="switch"]';
function control(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  const element = target.closest<HTMLElement>(selector);
  return element && !element.closest('[inert], [aria-disabled="true"]') && !element.matches(':disabled') ? element : null;
}
function playControl(element: HTMLElement) {
  const cue = element.closest<HTMLElement>('[data-sound]')?.dataset.sound;
  if (cue === 'none') return;
  if (cue && cue !== 'dispose' && Object.hasOwn(sfx, cue) && typeof sfx[cue as keyof typeof sfx] === 'function') { playSound(cue as SoundCue); return; }
  if (element.matches('summary, [aria-expanded], [aria-pressed], [role="switch"], [role="tab"]')) sfx.toggle();
  else if (!element.matches('select, input[type="checkbox"], input[type="radio"]')) sfx.click();
}

/** Delegation also covers lazy routes, portals, forms and keyboard activation. */
export function installInteractionSounds() {
  initializeSound(); setAudioForeground(!document.hidden);
  const sounded = new WeakMap<HTMLElement, number>();
  const warm = window.setTimeout(prepareAudio, 0);
  const unlock = () => { void unlockAudio(); };
  const down = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) return;
    unlock();
    const element = control(event.target);
    // On touch, wait for activation so a swipe over a button stays silent.
    if (element && event.pointerType !== 'touch') { playControl(element); sounded.set(element, performance.now()); }
  };
  const key = (event: KeyboardEvent) => {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    unlock();
    if (!['Enter', ' '].includes(event.key)) return;
    const element = control(event.target);
    if (element && !(event.key === ' ' && element.matches('a[href]'))) { playControl(element); sounded.set(element, performance.now()); }
  };
  const click = (event: MouseEvent) => {
    const element = control(event.target);
    if (!element || event.button !== 0) return;
    unlock();
    if (performance.now() - (sounded.get(element) ?? -Infinity) > 1000) playControl(element);
    sounded.delete(element);
  };
  const change = (event: Event) => {
    const element = control(event.target);
    if (element?.matches('select, input[type="checkbox"], input[type="radio"]') && element.closest<HTMLElement>('[data-sound]')?.dataset.sound !== 'none') sfx.toggle();
  };
  const invalid = () => sfx.error();
  const hide = () => setAudioForeground(!document.hidden);
  const blur = () => setAudioForeground(false);
  const focus = () => setAudioForeground(!document.hidden);
  document.addEventListener('pointerdown', down, true);
  document.addEventListener('pointerup', unlock, true);
  document.addEventListener('keydown', key, true);
  document.addEventListener('click', click, true);
  document.addEventListener('change', change, true);
  document.addEventListener('invalid', invalid, true);
  document.addEventListener('visibilitychange', hide);
  window.addEventListener('blur', blur); window.addEventListener('focus', focus);
  window.addEventListener('pagehide', blur); window.addEventListener('pageshow', focus);
  return () => {
    clearTimeout(warm); setAudioForeground(false);
    document.removeEventListener('pointerdown', down, true); document.removeEventListener('pointerup', unlock, true);
    document.removeEventListener('keydown', key, true); document.removeEventListener('click', click, true);
    document.removeEventListener('change', change, true); document.removeEventListener('invalid', invalid, true);
    document.removeEventListener('visibilitychange', hide);
    window.removeEventListener('blur', blur); window.removeEventListener('focus', focus);
    window.removeEventListener('pagehide', blur); window.removeEventListener('pageshow', focus);
  };
}

export function createPageTurnSound(initial = 0, play = sfx.pageTurn) {
  let lastLeaf = Math.round(initial);
  return (current: number) => {
    const leaf = Math.round(current);
    const fraction = Math.abs(current - leaf);
    if (fraction < 0.02 && leaf !== lastLeaf) {
      play(current > lastLeaf ? 1 : -1);
      lastLeaf = leaf;
    } else if (fraction > 0.15) {
      lastLeaf = -1;
    }
  };
}
