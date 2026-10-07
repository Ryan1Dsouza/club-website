export function Orbit({ className = '' }: { className?: string }) {
  return (
    <div className={`orbit-art ${className}`} aria-hidden="true">
      <svg viewBox="0 0 500 500" fill="none">
        <circle cx="250" cy="250" r="208" className="orbit-boundary" />
        <circle cx="250" cy="250" r="158" className="orbit-boundary" />
        <path d="M250 12v476M12 250h476" className="orbit-guide" />
        <g className="orbit-ellipses">
          <ellipse cx="250" cy="250" rx="202" ry="76" transform="rotate(-35 250 250)" />
          <ellipse cx="250" cy="250" rx="202" ry="76" transform="rotate(35 250 250)" />
          <ellipse cx="250" cy="250" rx="202" ry="76" transform="rotate(90 250 250)" />
        </g>
        <circle cx="250" cy="250" r="47" fill="#101610" stroke="#c3e5c8" strokeOpacity=".32" />
        <circle cx="250" cy="250" r="31" fill="#c3e5c8" fillOpacity=".07" />
        <path d="M237 262v-24l26 24v-24" stroke="#c3e5c8" strokeWidth="2.5" />
        <circle cx="88" cy="139" r="6" fill="#c3e5c8" />
        <circle cx="402" cy="151" r="4" fill="#93ac97" />
        <circle cx="253" cy="453" r="5" fill="#c3e5c8" />
        <path d="M37 34h12m-6-6v12M451 466h12m-6-6v12" stroke="#93ac97" />
      </svg>
    </div>
  )
}
