import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { sfx } from '../../lib/sound-effects';

export default function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const close = () => { sfx.bookClose(); onClose(); };
  const dialog = useRef<HTMLDialogElement>(null), opened = useRef(false);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current!;
    const overflow = document.body.style.overflow;
    element.showModal(); document.body.style.overflow = 'hidden';
    if (!opened.current) { opened.current = true; sfx.bookOpen(); }
    const keepFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const controls = Array.from(element.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'))
        .filter(control => !control.matches(':disabled, [hidden]') && control.getClientRects().length > 0);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    element.addEventListener('keydown', keepFocus);
    return () => { element.removeEventListener('keydown', keepFocus); element.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return createPortal(<dialog ref={dialog} className="modal" data-lenis-prevent aria-labelledby="modal-title" onCancel={close} onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close(); } }}>
    <button className="icon-button modal-close" data-sound="none" onClick={close} aria-label="Close dialog"><X size={20} /></button>
    <h2 id="modal-title">{title}</h2>{children}
  </dialog>, document.body);
}
