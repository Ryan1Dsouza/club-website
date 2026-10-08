import { useCallback, useEffect, useId, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, Github, X } from 'lucide-react';
import type { Project } from '../../types';
import './laundroid-project.css';

/** Shared, lightweight vector artwork. Only the drum moves on interaction. */
function WashDrum({ id }: { id: string }) {
  return <g>
    <defs>
      <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#ffffff" /><stop offset=".42" stopColor="#c3d0c9" /><stop offset=".7" stopColor="#f3f7f3" /><stop offset="1" stopColor="#9bada4" />
      </linearGradient>
      <radialGradient id={`${id}-glass`} cx=".35" cy=".25" r=".8">
        <stop stopColor="#31574e" /><stop offset="1" stopColor="#102b25" />
      </radialGradient>
      <clipPath id={`${id}-clip`}><circle cx="150" cy="150" r="108" /></clipPath>
    </defs>
    <circle cx="150" cy="153" r="143" fill="#719486" opacity=".16" />
    <circle cx="150" cy="150" r="139" fill={`url(#${id}-rim)`} stroke="#a4b8ac" />
    <circle cx="150" cy="150" r="122" fill="#769187" />
    <circle cx="150" cy="150" r="116" fill={`url(#${id}-glass)`} stroke="#213d34" strokeWidth="5" />
    <g clipPath={`url(#${id}-clip)`}>
      <g className="laundroid-drum__load">
        <path d="M65 176 Q62 147 83 139 L119 127 L144 146 L134 193 L95 216 Z" fill="#b1d5b5" />
        <path d="M83 142 Q105 151 119 130 M82 161 L112 188" fill="none" stroke="#719c81" strokeWidth="3" />
        <path d="M151 167 L165 122 Q169 111 184 114 L216 135 L225 188 L199 218 L164 207 Z" fill="#e4eee2" />
        <path d="M180 120 L178 165 L205 184" fill="none" stroke="#b0cbb9" strokeWidth="3" />
        <path d="M95 208 Q131 168 155 186 Q178 202 210 213 L208 244 L100 245 Z" fill="#73a994" />
        <path d="M121 212 Q155 196 169 215" fill="none" stroke="#487e69" strokeWidth="3" />
      </g>
      <path d="M35 199 Q85 185 139 201 T267 199 V271 H35 Z" fill="#8dcdb8" opacity=".23" />
      <g className="laundroid-drum__bubbles" fill="none" stroke="#d5eee0" strokeWidth="1.5" opacity=".6">
        <circle cx="82" cy="186" r="5" /><circle cx="215" cy="162" r="7" /><circle cx="194" cy="210" r="4" /><circle cx="103" cy="222" r="3" />
      </g>
      <path d="M66 121 A91 91 0 0 1 152 61" fill="none" stroke="#e5fff2" strokeWidth="12" strokeLinecap="round" opacity=".12" />
      <path d="M68 130 A89 89 0 0 1 75 109" fill="none" stroke="#e5fff2" strokeWidth="4" strokeLinecap="round" opacity=".32" />
    </g>
    <path d="M271 121 Q281 150 271 179" fill="none" stroke="#f6faf6" strokeWidth="9" strokeLinecap="round" />
  </g>;
}

function WashingMachine() {
  const id = useId();
  return <svg className="laundroid-machine" viewBox="0 0 400 460" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-body`} x1=".1" y1="0" x2=".9" y2="1">
        <stop stopColor="#fafcf8" /><stop offset=".55" stopColor="#e8eee5" /><stop offset="1" stopColor="#c7d6cb" />
      </linearGradient>
      <linearGradient id={`${id}-side`} x1="0" y1="0" x2="1" y2="0">
        <stop stopColor="#b4c7bb" /><stop offset="1" stopColor="#9fb7a8" />
      </linearGradient>
      <radialGradient id={`${id}-shadow`}><stop stopColor="#173a2b" stopOpacity=".23" /><stop offset="1" stopColor="#173a2b" stopOpacity="0" /></radialGradient>
    </defs>
    <ellipse cx="201" cy="429" rx="185" ry="27" fill={`url(#${id}-shadow)`} />
    <rect x="75" y="399" width="34" height="21" rx="6" fill="#4c6a58" />
    <rect x="296" y="399" width="34" height="21" rx="6" fill="#4c6a58" />
    <path d="M316 36 L349 53 Q360 59 360 76 V386 Q360 404 341 410 L316 412 Z" fill={`url(#${id}-side)`} stroke="#9ab09f" />
    <rect x="48" y="35" width="286" height="377" rx="25" fill={`url(#${id}-body)`} stroke="#a6bca9" strokeWidth="1.5" />
    <rect x="54" y="41" width="274" height="363" rx="21" stroke="#fff" strokeOpacity=".65" />
    <path d="M49 119 H333" stroke="#b9cbbb" /><path d="M49 121 H333" stroke="#fff" strokeOpacity=".7" />
    <rect x="67" y="59" width="88" height="40" rx="7" fill="#e2e9df" stroke="#b5c6b7" />
    <path d="M83 89 H138" stroke="#9caf9f" strokeWidth="3" strokeLinecap="round" />
    <text x="81" y="77" fill="#496454" fontSize="8" fontFamily="sans-serif" fontWeight="600" letterSpacing="1">iLAUNDROID</text>
    <circle cx="195" cy="80" r="23" fill="#b5c6b8" />
    <circle cx="195" cy="78" r="21" fill="#f7f9f2" stroke="#c2cec0" />
    <path d="M195 61 V69" stroke="#315b43" strokeWidth="3" strokeLinecap="round" />
    <rect x="239" y="59" width="75" height="41" rx="6" fill="#203d30" />
    <circle cx="251" cy="72" r="2" fill="#c1efad" />
    <text x="260" y="75" fill="#c3e5c8" fontSize="7" fontFamily="monospace" letterSpacing="1">READY</text>
    <path d="M250 87 H269 M276 87 H281 M288 87 H302" stroke="#92b49b" strokeWidth="2" strokeLinecap="round" />
    <g transform="translate(62 131) scale(.86)"><WashDrum id={id} /></g>
    <path d="M68 386 H238" stroke="#b2c5b5" />
    <path d="M69 391 H223" stroke="#fff" strokeOpacity=".7" />
    <rect x="286" y="375" width="26" height="18" rx="5" stroke="#a7bdac" />
  </svg>;
}

function LaundroidDetails({ project, trigger, onClose }: {
  project: Project; trigger: RefObject<HTMLButtonElement | null>; onClose: () => void;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const exitAnimation = useRef<Animation | null>(null);
  const closing = useRef(false);
  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    if (!dialog.current || matchMedia('(prefers-reduced-motion: reduce)').matches) { onClose(); return; }
    exitAnimation.current = dialog.current.animate([
      { opacity: 1, transform: 'translateY(0) scale(1)' },
      { opacity: 0, transform: 'translateY(12px) scale(.985)' },
    ], { duration: 180, easing: 'ease-in', fill: 'forwards' });
    void exitAnimation.current.finished.then(onClose, () => {});
  }, [onClose]);

  useEffect(() => {
    const element = dialog.current!;
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    closing.current = false;
    element.showModal();
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    element.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    const opener = trigger.current;
    return () => {
      exitAnimation.current?.cancel();
      element.close();
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [trigger]);

  return createPortal(<dialog ref={dialog} className="laundroid-details" aria-labelledby={`${id}-title`} data-lenis-prevent
    onCancel={event => { event.preventDefault(); close(); }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
    }}
    onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const controls = event.currentTarget.querySelectorAll<HTMLElement>('button, a[href]');
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}>
    <header className="laundroid-details__controls">
      <div className="laundroid-details__drawer"><span>NUCLEUS</span></div>
      <div className="laundroid-details__dial" aria-hidden="true"><span /></div>
      <button className="laundroid-details__close" type="button" onClick={close} aria-label="Close project details"><X size={20} /></button>
    </header>
    <div className="laundroid-details__body">
      <div className="laundroid-details__porthole">
        <svg className="laundroid-details__drum" viewBox="0 0 300 300" aria-hidden="true"><WashDrum id={id} /></svg>
      </div>
      <div className="laundroid-details__copy">
        <span className="laundroid-details__category">{project.domain} / {project.status}</span>
        <h2 id={`${id}-title`}>{project.title}</h2>
        <p>A centralized platform engineered to modernize campus laundry operations. Laundroid streamlines booking, tracking, and delivery logistics, creating a seamless experience for students and administrators alike.</p>
        {(project.url || project.repositoryUrl) && <div className="laundroid-details__links">
          {project.url && <a href={project.url} target="_blank" rel="noreferrer">Explore project <ArrowUpRight size={16} /></a>}
          {project.repositoryUrl && <a href={project.repositoryUrl} target="_blank" rel="noreferrer">Source code <Github size={16} /></a>}
        </div>}
      </div>
    </div>
    <div className="laundroid-details__base" aria-hidden="true"><span className="laundroid-details__vent" /></div>
  </dialog>, document.body);
}

export default function LaundroidProject({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return <>
    <article className="work-feature laundroid-card" aria-labelledby={`project-${project.id}`}>
      <div className="laundroid-card__scene" aria-hidden="true">
        <span className="laundroid-card__orbit laundroid-card__orbit--one" /><span className="laundroid-card__orbit laundroid-card__orbit--two" />
        <span className="laundroid-card__bubble laundroid-card__bubble--one" /><span className="laundroid-card__bubble laundroid-card__bubble--two" /><span className="laundroid-card__bubble laundroid-card__bubble--three" />
        <WashingMachine />
      </div>
      <div className="laundroid-card__copy">
        <h2 id={`project-${project.id}`}>{project.title}</h2>
        <p>A centralized platform engineered to modernize campus laundry operations. Laundroid streamlines booking, tracking, and delivery logistics, creating a seamless experience for students and administrators alike.</p>
      </div>
      <div className="laundroid-card__footer"><span>{project.domain}<i />{project.status}</span></div>
      <button ref={trigger} type="button" className="laundroid-card__open" aria-label={`Explore ${project.title}`} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
        <span className="laundroid-card__cta">View project <span><ArrowUpRight size={20} /></span></span>
      </button>
    </article>
    {open && <LaundroidDetails project={project} trigger={trigger} onClose={() => setOpen(false)} />}
  </>;
}
