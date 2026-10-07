import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowUpRight, Check, ImagePlus, Upload, X } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { preparePhoto } from '../lib/photos'
import { describeError, saveMember } from '../lib/members'
import type { TeamMember } from '../lib/database.types'
import { Modal } from './Modal'
import { Avatar } from './Avatar'

export function MemberEditor({
  member,
  onClose,
  onSaved,
}: {
  member: TeamMember | null
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const { user } = useAuth()
  const [name, setName] = useState(member?.name ?? '')
  const [role, setRole] = useState(member?.role ?? '')
  const [photo, setPhoto] = useState<Blob | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [filename, setFilename] = useState('')
  const [removeExistingPhoto, setRemoveExistingPhoto] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const fileRequest = useRef(0)
  const busy = processing || saving
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview],
  )
  useEffect(
    () => () => {
      ++fileRequest.current
    },
    [],
  )
  const selectPhoto = async (file: File) => {
    const request = ++fileRequest.current
    setProcessing(true)
    setError('')
    try {
      const result = await preparePhoto(file)
      if (request === fileRequest.current) {
        setPhoto(result)
        setPreview(URL.createObjectURL(result))
        setFilename(file.name)
        setRemoveExistingPhoto(false)
      }
    } catch (e) {
      if (request === fileRequest.current) setError(describeError(e))
    } finally {
      if (request === fileRequest.current) setProcessing(false)
    }
  }
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy || !user) return
    setSaving(true)
    setError('')
    try {
      const { warning } = await saveMember({
        previous: member,
        name,
        role,
        photo,
        removeExistingPhoto,
        userId: user.id,
      })
      onSaved(warning || `${name.trim()} ${member ? 'updated' : 'added'} successfully.`)
    } catch (err) {
      setError(describeError(err))
      setSaving(false)
    }
  }
  const displayPhoto = preview || (removeExistingPhoto ? null : member?.photo_url)
  return (
    <Modal
      title={member ? 'Edit team member' : 'A new connection.'}
      subtitle={
        member ? 'Keep their profile up to date.' : 'Introduce another mind behind Nucleus.'
      }
      onClose={onClose}
      busy={busy}
    >
      <form
        onSubmit={(e) => {
          void submit(e)
        }}
      >
        <div className="editor-body">
          <div className="editor-fields">
            <label className="field">
              Full name{' '}
              <span className="required-mark" aria-hidden="true">
                *
              </span>
              <input
                name="name"
                data-autofocus
                autoComplete="name"
                required
                maxLength={100}
                placeholder="e.g. Alex D’Souza"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
            </label>
            <label className="field">
              Role{' '}
              <span className="required-mark" aria-hidden="true">
                *
              </span>
              <input
                name="role"
                required
                maxLength={100}
                placeholder="e.g. Design Lead"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={saving}
              />
            </label>
            <div className="field">
              <label htmlFor="member-photo">
                Profile photo <span className="optional">Optional</span>
              </label>
              <label
                className={`upload-zone${processing ? ' is-processing' : ''}`}
                htmlFor="member-photo"
              >
                <span className="upload-icon">
                  <Upload size={21} />
                </span>
                <strong>
                  {processing ? 'Preparing your photo…' : filename || 'Click to upload a photo'}
                </strong>
                <span>JPG, PNG, WebP or AVIF · Up to 5 MB</span>
                <input
                  ref={fileInput}
                  id="member-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  aria-label="Profile photo"
                  disabled={busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void selectPhoto(file)
                    e.target.value = ''
                  }}
                />
              </label>
              {displayPhoto && (
                <button
                  className="text-button remove-photo"
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setPhoto(null)
                    setPreview(null)
                    setFilename('')
                    setRemoveExistingPhoto(true)
                  }}
                >
                  <X size={13} /> Remove photo
                </button>
              )}
            </div>
            <p className="field-help">
              <ImagePlus size={14} /> A square portrait works best. Photos are optimized
              automatically.
            </p>
          </div>
          <aside className="profile-preview">
            <span className="eyebrow">
              PROFILE PREVIEW <ArrowUpRight size={12} />
            </span>
            <Avatar name={name || 'New member'} url={displayPhoto} large />
            <div>
              <h3>{name.trim() || 'Their name here'}</h3>
              <p>{role.trim() || 'Their role at Nucleus'}</p>
            </div>
            <span className="preview-footer">
              ONE OF MANY MINDS. <span>✳</span>
            </span>
          </aside>
        </div>
        {error && (
          <p className="notice error modal-notice" role="alert">
            {error}
          </p>
        )}
        <footer className="modal-footer">
          <span>
            <span className="required-mark">*</span> Required fields
          </span>
          <div className="button-row">
            <button className="button secondary" type="button" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button
              className="button primary"
              type="submit"
              disabled={busy || !name.trim() || !role.trim()}
            >
              {saving ? <span className="spinner small" /> : <Check size={16} />}
              {saving ? 'Saving…' : member ? 'Save changes' : 'Add member'}
            </button>
          </div>
        </footer>
      </form>
    </Modal>
  )
}
