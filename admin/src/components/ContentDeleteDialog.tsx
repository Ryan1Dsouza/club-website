import { Modal } from './Modal'

export function ContentDeleteDialog({
  title,
  kind,
  busy,
  error,
  onClose,
  onConfirm,
}: {
  title: string
  kind: 'news item' | 'achievement'
  busy: boolean
  error: string
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Modal title={`Delete ${kind}?`} onClose={onClose} busy={busy} compact>
      <div className="delete-content">
        <p>
          <strong>{title}</strong> will be removed from the website. This cannot be undone.
        </p>
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="form-actions">
        <button className="button secondary" data-autofocus disabled={busy} onClick={onClose}>
          Cancel
        </button>
        <button className="button danger" disabled={busy} onClick={onConfirm}>
          {busy ? 'Deleting…' : `Delete ${kind}`}
        </button>
      </div>
    </Modal>
  )
}
