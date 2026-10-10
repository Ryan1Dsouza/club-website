import { useCallback, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowUpRight, Code2, Github, Globe, Instagram, Linkedin, X } from 'lucide-react';
import gsap from 'gsap';
import { sfx } from '../../lib/sound-effects';
import type { TeamProfile, SocialPlatform } from '../../lib/team-profiles';
import './team-profile-overlay.css';

const icons = { linkedin: Linkedin, github: Github, leetcode: Code2, instagram: Instagram, website: Globe } satisfies Record<SocialPlatform, typeof Linkedin>;

export default function TeamProfileOverlay({ person, onClose }: { person: TeamProfile; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closing = useRef(false);
  const opened = useRef(false);
  const animation = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null);
  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    sfx.bookClose();
    animation.current?.kill();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { onClose(); return; }
    animation.current = gsap.to(dialog.current, { opacity: 0, duration: .2, ease: 'power2.in', onComplete: onClose });
  }, [onClose]);

  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    closing.current = false;
    element.showModal();
    if (!opened.current) { opened.current = true; sfx.bookOpen(); }
    element.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animation.current = gsap.timeline()
        .fromTo(element, { opacity: 0 }, { opacity: 1, duration: .3 })
        .fromTo(element.querySelector('.team-profile__copy'), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: 'power2.out' }, .08)
        .fromTo(element.querySelector('.team-profile__photo'), { opacity: 0 }, { opacity: 1, duration: .5 }, .08);
    }
    return () => {
      animation.current?.kill();
      element.close();
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(<dialog ref={dialog} className="team-profile" aria-labelledby="team-profile-name" aria-describedby="team-profile-tagline" data-lenis-prevent
    onCancel={event => { event.preventDefault(); close(); }}
    onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]');
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    }}>
    <button type="button" className="team-profile__back" data-sound="none" onClick={close}><ArrowLeft size={16} /><span>Back to the team</span><X size={16} /></button>
    <div className="team-profile__layout">
      <div className="team-profile__details">
        <div className="team-profile__copy">
          <p className="team-profile__role">{person.role}</p>
          <h2 id="team-profile-name">{person.name}</h2>
          <p id="team-profile-tagline" className="team-profile__tagline">{person.tagline}</p>
          <nav className="team-profile__socials" aria-label={`${person.name}'s social profiles`}>
            {person.socials.map(social => {
              const Icon = icons[social.platform];
              return <a key={social.platform} href={social.url} target={social.url === '#' ? undefined : '_blank'} rel="noopener noreferrer"
                onClick={event => { if (social.url === '#') event.preventDefault(); }}>
                <Icon size={17} /><span>{social.label}</span><ArrowUpRight size={13} />
              </a>;
            })}
          </nav>
        </div>
        <p className="team-profile__signature"><span>NUCLEUS / SJEC</span><span>Made of many minds.</span></p>
      </div>
      <div className="team-profile__photo" style={person.previewImage ? { backgroundImage: `url("${person.previewImage}")` } : undefined}>
        {!person.previewImage && <span className="team-profile__initials" aria-hidden="true">{person.initials}</span>}
        {person.cardImage && <img className="team-profile__preview" src={person.cardImage} alt="" aria-hidden="true" loading="eager" decoding="async" fetchPriority="high" onError={event => { event.currentTarget.style.visibility = 'hidden'; }} />}
        {/* person.profileImage intentionally removed to show only environment */}
      </div>
    </div>
  </dialog>, document.body);
}
