import { useEffect, useRef, type RefObject } from 'react';
import { type Station, type MoveInput, type WorldMode, type WorldSnapshot } from '../../lib/event-navigation';
import { createEventWorld } from '../../lib/event-world';
import type { RideGlimpsesHandle } from './RideGlimpses';
import type { RideMapHandle } from './RideMap';
import type { RideMapLayout } from '../../lib/event-minimap';
import type { RideAudio } from '../../lib/event-audio';

export interface LogoWorldProps {
  stations: Station[];
  mode: WorldMode;
  paused: boolean;
  reduced: boolean;
  input: RefObject<MoveInput>;
  boostInput: RefObject<boolean>;
  audio: RefObject<RideAudio | null>;
  glimpses: RefObject<RideGlimpsesHandle | null>;
  minimap: RefObject<RideMapHandle | null>;
  onTravelChange: (station: number | null) => void;
  onBoostChange: (active: boolean) => void;
  command: { serial: number; station: number | null; resume?: boolean; driveKey?: string; travel?: boolean };
  onReady: () => void;
  onError: () => void;
  onRecovering?: (recovering: boolean) => void;
  onSnapshot?: (snapshot: WorldSnapshot) => void;
  onArrive: (index: number) => void;
  onBoard: (index: number) => void;
  onLayout?: (available: boolean[], map: RideMapLayout) => void;
}

export default function LogoWorld(props: LogoWorldProps) {
  const host = useRef<HTMLDivElement>(null);
  const live = useRef(props);
  live.current = props;
  useEffect(() => {
    if (!host.current) return;
    let dispose: (() => void) | undefined;
    // Let the shell paint and cancel StrictMode's discarded mount before building WebGL.
    const frame = requestAnimationFrame(() => {
      if (!host.current) return;
      try { dispose = createEventWorld(host.current, () => live.current); }
      catch (error) { console.error('Unable to create the Nucleus world:', error); live.current.onError(); }
    });
    return () => { cancelAnimationFrame(frame); dispose?.(); };
  }, []);
  return <div ref={host} className="nx-world" tabIndex={0} role="group"
    aria-label="Nucleus roller coaster. W or D to accelerate, S or A to brake and reverse. Hold Shift to boost. Drag to look. E opens a nearby station."
    aria-describedby="nx-control-summary">
    <div className="nx-world-markers" aria-label="Stations on the map" hidden={props.mode !== 'overview' || props.paused}>
      {props.stations.map(station => <button key={station.id} data-world-station={station.id} data-stop-kind="event"
        onClick={() => props.onBoard(station.index)} aria-label={`Ride from station ${station.number}: ${station.name}`}>
        <span>{station.number}</span><small>{station.name}</small>
      </button>)}
    </div>
    {!props.reduced && <div className="nx-world-cards">
      {props.stations.map(station => <aside key={station.id} className="nx-teaser" data-world-card={station.id} aria-hidden="true">
        <svg className="nx-approach-arc" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19" /><circle cx="22" cy="22" r="19" pathLength="1" strokeDasharray="1" /></svg>
        <div><span className="nx-event-category">{station.event?.category || 'Preview station'} · {station.number}</span>
          <h2>{station.name}</h2>
          {station.event?.startsAt && <p>{new Date(station.event.startsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}</p>}
          {station.event?.location && <p>{station.event.location}</p>}
          <small>Arriving at station</small>
        </div>
      </aside>)}
    </div>}
  </div>;
}
