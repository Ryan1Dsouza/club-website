import { Component, Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode, type RefObject } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, Layers3, Plus, Route, X, Zap } from 'lucide-react';
import { type MoveInput, type WorldMode } from '../lib/event-navigation';
import type { LogoWorldProps } from '../components/shared/LogoWorld';
import type { RideMapLayout } from '../lib/event-minimap';
import { createEventStations } from '../lib/event-stations';
import { populateWorkshopStation } from '../events/workshop-content';
import Book from '../components/events/Book';
import { shouldShowJoystick } from '../lib/event-quality';
import { createRideAudio, type RideAudio } from '../lib/event-audio';
import type { ClubEvent } from '../types';
import RideGlimpses, { type RideGlimpsesHandle } from '../components/shared/RideGlimpses';
import RideMap, { type RideMapHandle } from '../components/shared/RideMap';
import SoundToggle from '../components/shared/SoundToggle';
import { sfx } from '../lib/sound-effects';
import './event-explorer.css';

const LogoWorld = lazy(() => import('../components/shared/LogoWorld'));
const AddEventForm = lazy(() => import('./AddEventForm'));

class WorldBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function EventDialog({ children, label, onClose, busy = false }: { children: ReactNode; label: string; onClose: () => void; busy?: boolean }) {
  const close = () => { sfx.bookClose(); onClose(); };
  const ref = useRef<HTMLDialogElement>(null), opened = useRef(false);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    dialog.showModal();
    if (!opened.current) { opened.current = true; sfx.bookOpen(); }
    return () => { dialog.close(); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={ref} className="nx-dialog" aria-label={label} aria-busy={busy} onCancel={event => { event.preventDefault(); if (!busy) close(); }}>
    <button className="nx-close" data-sound="none" disabled={busy} onClick={close} aria-label="Close event"><X size={18} /></button>
    {children}
  </dialog>;
}

function Joystick({ input, disabled, onFocus }: { input: RefObject<MoveInput>; disabled: boolean; onFocus: () => void }) {
  const active = useRef<number | null>(null);
  const knob = useRef<HTMLSpanElement>(null);
  const reset = useCallback(() => {
    active.current = null; input.current = { x: 0, y: 0 };
    if (knob.current) knob.current.style.transform = 'translate(0, 0)';
  }, [input]);
  useEffect(() => {
    window.addEventListener('blur', reset); document.addEventListener('visibilitychange', reset);
    return () => { reset(); window.removeEventListener('blur', reset); document.removeEventListener('visibilitychange', reset); };
  }, [reset]);
  useEffect(() => { if (disabled) reset(); }, [disabled, reset]);
  function update(event: PointerEvent<HTMLButtonElement>) {
    if (active.current !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect(), radius = rect.width * 0.29;
    let x = event.clientX - rect.left - rect.width / 2, y = event.clientY - rect.top - rect.height / 2;
    const distance = Math.hypot(x, y);
    if (distance > radius) { x *= radius / distance; y *= radius / distance; }
    input.current = { x: distance < 5 ? 0 : x / radius, y: distance < 5 ? 0 : -y / radius };
    if (knob.current) knob.current.style.transform = `translate(${x}px, ${y}px)`;
  }
  return <button className="nx-joystick" data-sound="none" disabled={disabled} aria-label="Ride joystick. Drag up or right to accelerate; down or left to brake and reverse. You can also use W D and S A."
    aria-describedby="nx-control-summary" title="W / D to accelerate · S / A to brake and reverse"
    onPointerDown={event => { if (active.current !== null) return; event.preventDefault(); onFocus(); active.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId); update(event); }}
    onPointerMove={update} onPointerUp={reset} onPointerCancel={reset} onLostPointerCapture={reset}>
    <span className="nx-joystick-track" /><ArrowUp className="nx-joystick-up" size={13} /><ArrowDown className="nx-joystick-down" size={13} />
    <span ref={knob} className="nx-joystick-knob"><span /><span /><span /></span>
  </button>;
}

function BoostControl({ input, active, disabled, touch, onFocus }: { input: RefObject<boolean>; active: boolean; disabled: boolean; touch: boolean; onFocus: () => void }) {
  const pointer = useRef<number | null>(null);
  const reset = useCallback(() => { input.current = false; pointer.current = null; }, [input]);
  useEffect(() => {
    window.addEventListener('blur', reset); document.addEventListener('visibilitychange', reset);
    return () => { reset(); window.removeEventListener('blur', reset); document.removeEventListener('visibilitychange', reset); };
  }, [reset]);
  useEffect(() => { if (disabled) reset(); }, [disabled, reset]);
  return <button className="nx-boost-button" data-sound="none" type="button" disabled={disabled} aria-pressed={active} aria-label="Hold to boost. Keyboard shortcut: Shift."
    onPointerDown={event => { if (event.button !== 0 || pointer.current !== null) return; event.preventDefault(); onFocus(); pointer.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId); input.current = true; }}
    onPointerUp={event => { if (event.pointerId === pointer.current) reset(); }} onPointerCancel={reset} onLostPointerCapture={reset} onBlur={reset}
    onKeyDown={event => { if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); input.current = true; } }}
    onKeyUp={event => { if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); reset(); } }}>
    <Zap size={16} /><span>Boost</span><small>{touch ? 'HOLD' : 'SHIFT'}</small>
  </button>;
}

export default function EventRollercoaster({ events, onPublished, onReady }: { events: ClubEvent[]; onPublished: (event: ClubEvent) => void; onReady?: () => void }) {
  // Focus refreshes return fresh arrays even when no event changed. Keep the
  // current journey, book, and station layout intact through those refreshes.
  const eventKey = JSON.stringify(events);
  const stations = useMemo(() => createEventStations(events).map(populateWorkshopStation), [eventKey]);
  const [mapLayout, setMapLayout] = useState<RideMapLayout | null>(null);
  const [traveling, setTraveling] = useState<number | null>(null);
  const wrapper = useRef<HTMLElement>(null);
  const input = useRef<MoveInput>({ x: 0, y: 0 });
  const boostInput = useRef(false);
  const audio = useRef<RideAudio | null>(null);
  const glimpses = useRef<RideGlimpsesHandle>(null);
  const minimap = useRef<RideMapHandle>(null);
  const [boosting, setBoosting] = useState(false);
  const [mode, setMode] = useState<WorldMode>(typeof window !== 'undefined' && window.innerWidth <= 768 ? 'explore' : 'overview');
  const [ready, setReady] = useState(false), [failed, setFailed] = useState(false), [reduced, setReduced] = useState(false);
  const [recovering, setRecovering] = useState(false);
  useEffect(() => { if (ready || failed) onReady?.(); }, [ready, failed, onReady]);
  const [selected, setSelected] = useState<number | null>(null);
  const [adding, setAdding] = useState(false), [publishing, setPublishing] = useState(false), [listing, setListing] = useState(false);
  const [touchControls, setTouchControls] = useState(false), [notice, setNotice] = useState('');
  const [compactView, setCompactView] = useState(false);
  const [available, setAvailable] = useState<boolean[]>([]);
  const onLayout = useCallback((layout: boolean[], map: RideMapLayout) => { setAvailable(layout); setMapLayout(map); }, []);
  const paused = selected !== null || adding || listing;
  const [command, setCommand] = useState<LogoWorldProps['command']>({ serial: 0, station: null });
  const station = selected === null ? null : stations[selected];
  useEffect(() => {
    audio.current = createRideAudio();
    return () => { audio.current?.dispose(); audio.current = null; };
  }, []);
  useEffect(() => { if (paused || failed || mode === 'overview') audio.current?.quiet(); }, [paused, failed, mode]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const pointer = window.matchMedia('(pointer: coarse)');
    const compact = window.matchMedia('(max-width: 768px), (max-height: 500px)');
    const update = () => {
      setTouchControls(shouldShowJoystick('ontouchstart' in window || navigator.maxTouchPoints > 0, pointer.matches, window.innerWidth));
      setCompactView(compact.matches);
    };
    update(); pointer.addEventListener('change', update); window.addEventListener('resize', update, { passive: true });
    return () => { pointer.removeEventListener('change', update); window.removeEventListener('resize', update); };
  }, []);
  const focusWorld = () => wrapper.current?.querySelector<HTMLElement>('.nx-world')?.focus({ preventScroll: true });
  const selectStation = (index: number) => { input.current = { x: 0, y: 0 }; setSelected(index); };
  const toggleMap = () => { input.current = { x: 0, y: 0 }; setSelected(null); setMode(value => value === 'explore' ? 'overview' : 'explore'); };
  const boardStation = (index: number) => {
    if (available[index] === false) { selectStation(index); return; }
    setCommand(value => ({ serial: value.serial + 1, station: index, board: true })); setMode('explore'); setSelected(null);
  };
  const travelToStation = (index: number) => {
    if (available[index] === false) { selectStation(index); return; }
    input.current = { x: 0, y: 0 }; setSelected(null); setMode('explore');
    setCommand(value => ({ serial: value.serial + 1, station: index, travel: true }));
  };
  const continueRide = useCallback((driveKey?: string) => {
    if (!failed && (selected === null || available[selected] !== false)) {
      if (mode === 'overview') { setCommand(value => ({ serial: value.serial + 1, station: selected, driveKey })); setMode('explore'); }
      else setCommand(value => ({ serial: value.serial + 1, station: null, resume: true, driveKey }));
    }
    setSelected(null);
  }, [failed, mode, selected, available]);
  useEffect(() => {
    if (selected === null) return;
    const resume = (event: KeyboardEvent) => {
      if (!event.defaultPrevented && ['KeyW', 'KeyD', 'KeyS', 'KeyA'].includes(event.code) && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey) { event.preventDefault(); continueRide(event.code); }
    };
    window.addEventListener('keydown', resume);
    return () => window.removeEventListener('keydown', resume);
  }, [selected, continueRide]);
  return <section className={`nx-experience nx-${mode}`} ref={wrapper} aria-label="Nucleus roller coaster" data-reduced-motion={reduced} data-touch-controls={touchControls}>
    <h1 className="nx-sr-only">Inside Nucleus</h1>
    <p id="nx-control-summary" className="nx-sr-only">Hold W or D to accelerate. S or A brakes and reverses. Hold Shift or the Boost button to speed up; release to return to cruising speed. Drag the scene to look around. Use the joystick on touchscreens. The track loops back to the start. The cart automatically stops at event stations, including while boosting. Close the event or press a drive key to continue. {!compactView && 'Click a checkpoint in the top-right route map to travel to that station automatically; a drive control takes over. '}Open Map to select a station. On the full map, drag to orbit, right-drag or use two fingers to pan, and scroll or pinch to zoom.</p>
    {!failed && <WorldBoundary onError={() => setFailed(true)}><Suspense fallback={null}>
      <LogoWorld stations={stations} mode={mode} paused={paused} reduced={reduced} input={input} boostInput={boostInput} audio={audio} glimpses={glimpses} minimap={minimap} onTravelChange={setTraveling} onBoostChange={setBoosting} command={command} onLayout={onLayout}
        onReady={() => { setReady(true); setRecovering(false); }} onRecovering={setRecovering} onError={() => { setRecovering(false); setFailed(true); }} onArrive={selectStation} onBoard={boardStation} />
    </Suspense></WorldBoundary>}
    <div className="nx-vignette" aria-hidden="true" />
    <div className="nx-boost-focus" aria-hidden="true"><svg viewBox="0 0 1000 700" preserveAspectRatio="none"><path d="M-80 10 280 240 M60-40 330 220 M-70 220 250 290 M-60 540 280 420 M70 740 330 450 M250 760 400 480 M1080 10 720 240 M940-40 670 220 M1070 220 750 290 M1060 540 720 420 M930 740 670 450 M750 760 600 480" /></svg></div>
    {!compactView && <RideGlimpses ref={glimpses} />}
    <div className="nx-topbar"><div className="nx-ride-caption"><span>THE LOGO LOOP</span><small>Six passages. One endless journey.</small></div>
    <div className="nx-event-actions"><button onClick={() => { input.current = { x: 0, y: 0 }; setListing(true); }}>Events <span>{stations.length}</span></button><button onClick={() => { input.current = { x: 0, y: 0 }; setAdding(true); }}><Plus size={15} />Add Event</button>
      {!failed && <SoundToggle className="nx-sound-button" label />}
    </div>
    </div>
    {!failed && !compactView && <RideMap ref={minimap} layout={mapLayout} stations={stations} ready={ready} traveling={traveling} onTravel={travelToStation} />}

    {notice && <p className="nx-publish-notice" role="status">{notice}<button aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={14} /></button></p>}
    {!ready && !failed && <div className="nx-loading" role="status"><span /><span className="nx-sr-only">Loading the ride</span></div>}
    {recovering && <div className="nx-loading" role="status"><span /><span className="nx-sr-only">Reconnecting the ride. Your place is saved.</span></div>}
    {!failed && <div className="nx-controls" aria-label="Ride controls">
      {touchControls && mode === 'explore' && <Joystick input={input} disabled={!ready || paused} onFocus={focusWorld} />}
      {!touchControls && <p className="nx-keyboard-hint">{mode === 'overview' ? 'Your journey starts at any checkpoint' : 'W / D forward · S / A reverse'}<br /><span>{mode === 'overview' ? 'Select a station, then drive at your own pace' : 'Drag to look · Release to coast'}</span></p>}
      <div className="nx-ride-actions">{mode === 'explore' && <BoostControl input={boostInput} active={boosting} disabled={!ready || paused} touch={touchControls} onFocus={focusWorld} />}
      <button className="nx-map-button" onClick={toggleMap} disabled={!ready} aria-pressed={mode === 'overview'} aria-label={mode === 'overview' ? 'Return to ride' : 'Open holographic map'}>
        {mode === 'overview' ? <Route size={17} /> : <Layers3 size={17} />}<span>{mode === 'overview' ? 'Ride' : 'Map'}</span>
      </button>
      </div>
    </div>}
    {failed && <div className="nx-fallback" role="status"><Layers3 size={32} /><h2>The ride is unavailable.</h2><p>You can still explore the events.</p>
      <div>{stations.map(item => <button key={item.id} onClick={() => selectStation(item.index)}><span>{item.number}</span>{item.name}<ArrowRight size={16} /></button>)}</div>
      <a href="/">Back to Nucleus</a>
    </div>}
    {adding && <EventDialog label="Add Event" busy={publishing} onClose={() => setAdding(false)}><Suspense fallback={<p role="status">Opening event form…</p>}><AddEventForm stationNumber={String(stations.length + 1).padStart(2, '0')} onBusy={setPublishing} onPublished={event => { const added = createEventStations([...events.filter(item => item.id !== event.id), event]).find(item => item.id === event.id)!; onPublished(event); setAdding(false); setNotice(`“${event.title}” is published as Station ${added.number}. Find it on the map.`); }} /></Suspense></EventDialog>}
    {listing && <EventDialog label="Event stations" onClose={() => setListing(false)}><span className="nx-event-category">Explore every connection</span><h2>Event stations</h2><div className="nx-station-list">{stations.map(item => <button key={item.id} onClick={() => { setListing(false); if (failed) selectStation(item.index); else boardStation(item.index); }}><span>{item.number}</span><span>{item.name}{!item.event && <small>Preview station</small>}{available[item.index] === false && <small>Gallery only · track at capacity</small>}</span><ArrowRight size={16} /></button>)}</div></EventDialog>}
    {station && <Book key={station.id} workshopFolder={station.workshop ?? station.id} imageList={station.event?.photos ?? []}
      title={station.name} stationNumber={station.number} event={station.event} onClose={() => continueRide()} galleryOnly={available[selected!] === false}
      continueLabel={failed ? 'Back to events' : mode === 'overview' && available[selected!] !== false ? 'Ride from here' : 'Continue ride'} />}
  </section>;
}
