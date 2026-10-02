import { useId } from 'react';

/** Lightweight, transparent sculptures: the foreground stays outside the panel. */
export default function EventArtwork({ variant = 0, className = '' }: { variant?: number; className?: string }) {
  const id = useId().replaceAll(':', '');
  const metal = `${id}-metal`, edge = `${id}-edge`, core = `${id}-core`;
  return <svg className={`event-sculpture ${className}`} viewBox="0 0 600 700" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={metal} x1="-230" y1="-250" x2="230" y2="240" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f2fff4" /><stop offset=".19" stopColor="#70978a" /><stop offset=".34" stopColor="#ddf8e6" />
        <stop offset=".5" stopColor="#233d36" /><stop offset=".64" stopColor="#b5d9c4" /><stop offset=".82" stopColor="#42695c" /><stop offset="1" stopColor="#d6f6dd" />
      </linearGradient>
      <linearGradient id={edge} x1="-170" y1="-240" x2="210" y2="250" gradientUnits="userSpaceOnUse">
        <stop stopColor="white" /><stop offset=".5" stopColor="#c3e5c8" stopOpacity=".12" /><stop offset="1" stopColor="#d7ffe3" />
      </linearGradient>
      <radialGradient id={core} cx=".32" cy=".23" r=".8">
        <stop stopColor="#effff1" /><stop offset=".32" stopColor="#a1cbb1" /><stop offset=".72" stopColor="#3a6651" /><stop offset="1" stopColor="#0b231b" />
      </radialGradient>
    </defs>
    {variant === 0 ? <g transform="translate(300 350) rotate(-28)">
      {[0, 60, 120].map(angle => <g key={angle} transform={`rotate(${angle})`}>
        <ellipse rx="213" ry="86" stroke="#061811" strokeWidth="37" transform="translate(5 8)" />
        <ellipse rx="213" ry="86" stroke={`url(#${metal})`} strokeWidth="30" />
        <ellipse rx="213" ry="86" stroke={`url(#${edge})`} strokeWidth="1.6" transform="translate(-8 -10)" />
      </g>)}
      <circle r="68" fill={`url(#${core})`} stroke="#dbffe180" />
      <circle cx="-23" cy="-25" r="8" fill="#ecfff1" opacity=".7" />
      <circle cx="201" cy="-60" r="19" fill={`url(#${core})`} />
    </g> : variant === 1 ? <g transform="translate(300 350) rotate(-15)">
      {Array.from({ length: 12 }, (_, index) => <g key={index} transform={`rotate(${index * 30})`}>
        <path d="M-29-24 -44-204 Q-43-236-13-246 L9-253 32-38 0 22Z" fill={`url(#${metal})`} stroke={`url(#${edge})`} strokeWidth="1.5" />
        <path d="M-13-246 9-253 32-38 12-24Z" fill="#f0fff2" opacity=".2" />
      </g>)}
      <circle r="58" fill={`url(#${core})`} stroke="#d6ffe290" />
      <circle r="23" fill="#0c2018" stroke="#accbb7" strokeWidth="4" />
    </g> : <g transform="translate(300 350) rotate(-24)">
      {[105, 40, -25, -90].map((y, index) => <g key={y} transform={`translate(0 ${y}) rotate(${index * 12 - 18})`}>
        <path d="M-183-67Q0-177 183-67L183-23Q0 91-183-23Z" fill={`url(#${metal})`} stroke={`url(#${edge})`} strokeWidth="1.5" />
        <ellipse rx="183" ry="85" cy="-67" fill={`url(#${core})`} stroke={`url(#${edge})`} strokeWidth="2" />
        <ellipse rx="115" ry="49" cy="-67" fill="#0c221a" stroke="#bddfce90" strokeWidth="2" />
        <path d="M-174-45Q0 60 174-45" stroke="#e7ffec" strokeOpacity=".45" />
      </g>)}
    </g>}
  </svg>;
}
