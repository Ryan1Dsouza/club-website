import { keyframes, styled } from 'styled-components';
import type { ClubEvent, EventPhoto } from '../../types';

const spin = keyframes`to { transform: rotateZ(360deg); }`;
const float = keyframes`0%, 100% { transform: translateY(0); } 50% { transform: translateY(10px); }`;
const Card = styled.button.withConfig({ componentId: 'event-flip-card' })`
  position:relative; width:190px; height:254px; padding:0; border:0; border-radius:5px;
  background:#151515; color:white; text-align:left; font-family:inherit; cursor:pointer;
  box-shadow:0px 0px 10px 1px #000000ee; perspective:1000px; -webkit-tap-highlight-color:transparent;
  &:focus-visible { outline:2px solid #9fffd3; outline-offset:7px; }
  .flip-card__body { position:absolute; inset:0; pointer-events:none; transform:rotateY(0deg); transform-style:preserve-3d; transition:transform 300ms ease-out; }
  @media (hover:hover) { &:hover .flip-card__body { transform:rotateY(180deg); } }
  .flip-card__face { position:absolute; inset:0; overflow:hidden; border-radius:5px; backface-visibility:hidden; -webkit-backface-visibility:hidden; background:#151515; }
  .flip-card__front { transform:rotateY(0deg); }
  .flip-card__circle { position:absolute; width:100px; height:100px; border-radius:50%; filter:blur(20px); animation:${float} 2600ms infinite ease-in-out; }
  .flip-card__circle--one { top:0; left:-20px; background:#ffbb66; animation-delay:0ms; }
  .flip-card__circle--two { top:70px; left:40px; background:#ff8866; animation-delay:-800ms; }
  .flip-card__circle--three { top:-15px; right:-35px; background:#ff2233; animation-delay:-1800ms; }
  .flip-card__photo { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .flip-card__photo[hidden] { display:none; }
  .flip-card__front::after { content:''; position:absolute; inset:0; background:linear-gradient(transparent 40%,#0006); pointer-events:none; }
  .flip-card__badge { position:absolute; z-index:1; top:10px; left:10px; max-width:calc(100% - 20px); padding:5px 9px; background-color:#00000055; backdrop-filter:blur(2px); border-radius:10px; font-size:10px; }
  .flip-card__description { position:absolute; z-index:1; bottom:10px; left:10px; right:10px; padding:10px; background-color:#00000099; backdrop-filter:blur(5px); border-radius:5px; }
  .flip-card__title { display:flex; justify-content:space-between; align-items:flex-start; gap:8px; font-size:13px; line-height:1.35; }
  .flip-card__title strong { overflow-wrap:anywhere; }.flip-card__title svg { flex:none; }
  .flip-card__footer { display:block; margin-top:7px; color:#ffffff88; font-size:9px; line-height:1.5; }
  .flip-card__back { transform:rotateY(180deg); display:grid; place-items:center; }
  .flip-card__back::before { content:''; position:absolute; width:160px; height:160%; background:linear-gradient(90deg,transparent,#ff9966,#ff9966,#ff9966,#ff9966,transparent); animation:${spin} 5000ms infinite linear; }
  .flip-card__back-content { position:absolute; inset:2px; border-radius:5px; background:#151515; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:24px; font-size:13px; }
  @media (prefers-reduced-motion:reduce) { .flip-card__body { transition:none; }.flip-card__circle,.flip-card__back::before { animation:none; } }
`;

export function eventDate(date?: string) {
  return date && Number.isFinite(Date.parse(date))
    ? new Date(date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', timeZone:'Asia/Kolkata' })
    : 'Date to be added';
}

export default function EventFlipCard({ event, photo, workshopFolder, onClick }: {
  event: ClubEvent; photo?: EventPhoto; workshopFolder: string; onClick: () => void;
}) {
  const cover = photo ?? event.photos?.[0];
  const hasDate = Boolean(event.startsAt && Number.isFinite(Date.parse(event.startsAt)));
  return <Card type="button" className="event-flip-card" data-workshop={workshopFolder} onClick={onClick} aria-label={`Open ${event.title} event book`}>
    <span className="flip-card__body" aria-hidden="true"><span className="flip-card__face flip-card__front">
      <span className="flip-card__circle flip-card__circle--one" /><span className="flip-card__circle flip-card__circle--two" /><span className="flip-card__circle flip-card__circle--three" />
      {cover && <img className="flip-card__photo" src={cover.url} alt="" width="190" height="254" loading="lazy" decoding="async" onLoad={event => { event.currentTarget.hidden = false; }} onError={event => { event.currentTarget.hidden = true; }} />}
      <span className="flip-card__badge">{event.title}</span>
      <span className="flip-card__description"><span className="flip-card__title"><strong>{event.title}</strong>
        <svg width="13" height="15" viewBox="0 0 16 20" fill="none"><path d="M3 1h10a2 2 0 0 1 2 2v16l-7-4-7 4V3a2 2 0 0 1 2-2Z" stroke="white" strokeWidth="1.5" /></svg>
      </span><span className="flip-card__footer">{hasDate && <>{eventDate(event.startsAt)} · </>}{event.category || 'Workshop'}</span></span>
    </span><span className="flip-card__face flip-card__back"><span className="flip-card__back-content">
      <svg width="62" height="62" viewBox="0 0 64 64" fill="white"><path fillRule="evenodd" d="M30 6a26 26 0 1 0 26 26h-4A22 22 0 1 1 30 10V6Zm0 10a16 16 0 1 0 16 16h-4a12 12 0 1 1-12-12v-4Zm0 10a6 6 0 1 0 6 6h-4a2 2 0 1 1-2-2v-4Z" /><path d="m47 4-9 9v10L28 33l3 3 10-10h10l9-9-10-3-3-10Z" /></svg><span>Hover Me</span>
    </span></span></span>
  </Card>;
}
