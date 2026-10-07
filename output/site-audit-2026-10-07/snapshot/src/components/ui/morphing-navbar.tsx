import { useCallback, useEffect, useId, useRef, type CSSProperties, type MouseEvent } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import type { SiteSettings } from '../../types';
import { preloadPage } from '../../route-pages';
import { useLightweightGraphics } from '../../lib/graphics-preference';
import './morphing-navbar.css';

type NavigationItem = { title: string; href: string };
type Props = {
  items: NavigationItem[];
  settings: SiteSettings;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: () => void;
};

const sweepEase = [.16, 1, .3, 1] as const;
const reverseSweepEase = [.7, 0, .84, 0] as const;
const CLOSE_SECONDS = 1.2;
const sweepVariants = { open: { x: '0%' }, closed: { x: '100%' } };
// Keep the bands on the same frame clock as the wrapper's onUpdate callback.
const followSweepFrame = () => {};

export function MorphingNavbar({ items, settings, open, onOpenChange, onApply }: Props) {
  const navigate = useNavigate();
  const root = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const pendingNavigation = useRef<string | null>(null);
  const closing = useRef(false);
  const reopening = useRef(false);
  const contentId = useId();
  const reducedMotion = useReducedMotion();
  const sweepControls = useAnimationControls();
  useEffect(() => { void sweepControls.start(open ? 'open' : 'closed'); }, [open, sweepControls]);
  const socials = [
    { title: 'Instagram', href: settings.instagramUrl },
    { title: 'LinkedIn', href: settings.linkedinUrl },
    { title: 'GitHub', href: settings.githubUrl },
    { title: 'Email', href: 'mailto:' + settings.contactEmail },
  ];

  const closeMenu = useCallback(() => {
    closing.current = !reducedMotion && (open || closing.current);
    onOpenChange(false);
    toggle.current?.focus({ preventScroll: true });
  }, [open, onOpenChange, reducedMotion]);

  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
      }
      if (event.key !== 'Tab') return;
      const controls = Array.from(root.current?.querySelectorAll<HTMLElement>('a[href], button') ?? [])
        .filter(element => !element.closest('[inert]') && element.getClientRects().length > 0);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    };
    document.addEventListener('keydown', keyboard);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', keyboard);
    };
  }, [open, closeMenu]);

  // Reopening or unmounting cancels navigation from an interrupted close.
  useEffect(() => { if (open) { pendingNavigation.current = null; closing.current = false; } }, [open]);
  useEffect(() => () => { pendingNavigation.current = null; }, []);

  const warmPage = (targetHref: string) => {
    void preloadPage(targetHref).catch(() => {});
    if (reducedMotion || useLightweightGraphics()) return;
    if (targetHref === '/team') void import('../../lib/people-tower').catch(() => {});
    if (targetHref === '/') void import('../../lib/logo-scene').catch(() => {});
  };

  const closeForNavigation = (event: MouseEvent<HTMLAnchorElement>, targetHref: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    warmPage(targetHref);
    pendingNavigation.current = null;
    if (reducedMotion || (!open && !closing.current)) { closeMenu(); navigate(targetHref); return; }
    pendingNavigation.current = targetHref;
    closeMenu();
  };
  const finishClose = () => {
    if (open) return;
    closing.current = false;
    const targetHref = pendingNavigation.current;
    pendingNavigation.current = null;
    if (targetHref !== null) navigate(targetHref);
  };
  const sequenceDuration = 1 + Math.max(.9, .5 + Math.max(0, items.length - 1) * .1, .75 + (socials.length - 1) * .1);
  const closeScale = CLOSE_SECONDS / sequenceDuration;
  // Mirror the opening timeline and easing, playing the same poses back faster.
  const sequenceTransition = (delay = 0) => ({
    duration: reducedMotion ? 0 : open ? 1 : closeScale,
    // An interrupted exit must reverse immediately. Reapplying the opening
    // delays lets the old exit keep moving before the new animation starts.
    delay: reducedMotion ? 0 : open ? (reopening.current ? 0 : delay) : Math.max(0, sequenceDuration - delay - 1) * closeScale,
    ease: open ? sweepEase : reverseSweepEase,
  });

  return <nav ref={root} className="morph-nav" aria-label="Main navigation" data-open={open}>
    <div className="morph-nav__dialog" role={open ? 'dialog' : undefined} aria-modal={open ? true : undefined} aria-label={open ? 'Navigation menu' : undefined}>
      <div className="morph-nav__pill">
        <Link className="morph-nav__brand" to="/" aria-label="Nucleus home" onClick={event => closeForNavigation(event, '/')}>Nucleus</Link>
        <button
          type="button"
          className="morph-nav__toggle"
          ref={toggle}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-controls={contentId}
          aria-expanded={open}
          onClick={() => {
            pendingNavigation.current = null;
            if (open) closeMenu();
            else {
              reopening.current = closing.current;
              // Freeze the exit before the parent rerenders; a delayed frame
              // must not advance it before the new opening pose is committed.
              if (closing.current) sweepControls.stop();
              closing.current = false; onOpenChange(true);
            }
          }}
        >
          <span className="morph-nav__glyph" aria-hidden="true">
            <motion.span initial={false} animate={{ y: open ? 0 : -3, rotate: open ? 45 : 0 }} transition={{ duration: reducedMotion ? 0 : .3 }} />
            <motion.span initial={false} animate={{ y: open ? 0 : 3, rotate: open ? -45 : 0 }} transition={{ duration: reducedMotion ? 0 : .3 }} />
          </span>
        </button>
      </div>

      <motion.div
        id={contentId}
        className="morph-nav__overlay"
        data-lenis-prevent
        aria-hidden={!open}
        inert={!open}
        initial="closed"
        variants={sweepVariants}
        animate={sweepControls}
        transition={sequenceTransition()}
        onUpdate={latest => {
          // The wrapper and last visible (top) band share the same translation.
          // At 50% each, that band is already a full viewport offscreen.
          if (!open && closing.current && Number.parseFloat(String(latest.x)) >= 50) finishClose();
        }}
        onAnimationComplete={definition => { if (definition === 'closed') finishClose(); }}
      >
        <div className="morph-nav__bands" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => <motion.div
            key={index}
            className="morph-nav__band"
            initial="closed"
            variants={sweepVariants}
            animate={sweepControls}
            onUpdate={followSweepFrame}
            transition={sequenceTransition(index * .075)}
          />)}
        </div>
        <div className="morph-nav__content">
          <div className="morph-nav__main">
            <ul className="morph-nav__links">
              {items.map((item, index) => <motion.li
                key={item.href}
                initial={false}
                animate={{ opacity: open ? 1 : 0, x: open ? 0 : 160 }}
                transition={sequenceTransition(.5 + index * .1)}
              >
                <NavLink className="morph-nav__link" to={item.href} end aria-label={item.title} onPointerEnter={() => { if (open && !useLightweightGraphics()) warmPage(item.href); }} onFocus={() => { if (open) void preloadPage(item.href).catch(() => {}); }} onClick={event => closeForNavigation(event, item.href)}>
                  <span className="morph-nav__active-dot" aria-hidden="true" />
                  <span className="morph-nav__title" aria-hidden="true">
                    {Array.from(item.title).map((letter, letterIndex) => <span
                      key={letterIndex}
                      className="morph-nav__letter"
                      style={{ '--letter-index': letterIndex } as CSSProperties}
                    >{letter === ' ' ? '\u00a0' : letter}</span>)}
                  </span>
                </NavLink>
              </motion.li>)}
            </ul>
            <ul className="morph-nav__socials" aria-label="Social links">
              {socials.map((item, index) => <motion.li
                key={item.title}
                initial={false}
                animate={{ opacity: open ? 1 : 0, x: open ? 0 : 160 }}
                transition={sequenceTransition(.75 + index * .1)}
              >
                <a href={item.href} target={item.title === 'Email' ? undefined : '_blank'} rel={item.title === 'Email' ? undefined : 'noreferrer'}>{item.title}<ArrowUpRight size={14} aria-hidden="true" /></a>
              </motion.li>)}
            </ul>
          </div>
          <div className="morph-nav__footer">
            <motion.div initial={false} animate={{ opacity: open ? 1 : 0, y: open ? 0 : 100 }} transition={sequenceTransition(.75)}>
              <span className="morph-nav__caption">Made of many minds</span>
              <span>© {new Date().getFullYear()} Nucleus SJEC</span>
            </motion.div>
            <motion.div initial={false} animate={{ opacity: open ? 1 : 0, y: open ? 0 : 100 }} transition={sequenceTransition(.9)}>
              <span className="morph-nav__caption">The community</span>
              <button className="morph-nav__join" onClick={() => { pendingNavigation.current = null; closeMenu(); onApply(); }}>
                {settings.recruitmentOpen ? 'Join Nucleus' : 'Stay connected'}<ArrowUpRight size={16} aria-hidden="true" />
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  </nav>;
}
