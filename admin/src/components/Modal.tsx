import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
export function Modal({
  title,
  subtitle,
  children,
  onClose,
  busy = false,
  compact = false,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  onClose: () => void
  busy?: boolean
  compact?: boolean
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current!
    const previous = document.activeElement as HTMLElement | null
    element.showModal()
    element.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [])
  return (
    <dialog
      ref={dialog}
      className={`modal${compact ? ' modal-compact' : ''}`}
      aria-labelledby="dialog-title"
      aria-describedby={subtitle ? 'dialog-subtitle' : undefined}
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onClose()
      }}
    >
      <header className="modal-heading">
        <div>
          <h2 id="dialog-title">{title}</h2>
          {subtitle && <p id="dialog-subtitle">{subtitle}</p>}
        </div>
        <button className="icon-button" aria-label="Close dialog" disabled={busy} onClick={onClose}>
          <X size={19} />
        </button>
      </header>
      {children}
    </dialog>
  )
}
