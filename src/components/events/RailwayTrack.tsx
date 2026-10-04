import './railway-track.css';

/** A top-view railcart. Its position is painted by the owning Lenis instance. */
export default function RailwayTrack({ className = '' }: { className?: string }) {
  return <span className={`railway-track ${className}`} aria-hidden="true">
    <span className="railway-track__sleepers" />
    <span className="railway-track__rails" />
    <span className="railway-track__journey">
      <svg className="railway-track__cart" viewBox="0 0 36 56" fill="none">
        <rect x="1" y="10" width="5" height="11" rx="2" fill="#101d14" stroke="#9cae91" />
        <rect x="30" y="10" width="5" height="11" rx="2" fill="#101d14" stroke="#9cae91" />
        <rect x="1" y="35" width="5" height="11" rx="2" fill="#101d14" stroke="#9cae91" />
        <rect x="30" y="35" width="5" height="11" rx="2" fill="#101d14" stroke="#9cae91" />
        <rect x="7" y="2" width="22" height="52" rx="8" fill="#b6ed8b" stroke="#15291c" strokeWidth="2" />
        <path d="M10 12h16l-2 9H12z" fill="#243e30" />
        <rect x="11" y="24" width="14" height="17" rx="3" fill="#7bac62" />
        <path d="M14 27h8m-8 4h8m-8 4h8M13 46h10" stroke="#365c3c" strokeWidth="1.5" />
        <path d="M11 7h3m8 0h3" stroke="#f6ffd9" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  </span>;
}
