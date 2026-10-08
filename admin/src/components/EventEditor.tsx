import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Check, X, UploadCloud } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import type { Event, EventInput, EventPhoto } from '../lib/database.types'
import {
  describeError,
  saveEvent,
  listEventPhotos,
  uploadEventPhoto,
  deleteEventPhoto,
} from '../lib/events'
import { Modal } from './Modal'

export function EventEditor({
  event,
  onClose,
  onSaved,
}: {
  event: Event | null
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const { user } = useAuth()
  const [title, setTitle] = useState(event?.title ?? '')
  const [description, setDescription] = useState(event?.description ?? '')

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }

  const [startsAt, setStartsAt] = useState(
    formatDate(event?.starts_at) || formatDate(new Date().toISOString()),
  )
  const [endsAt, setEndsAt] = useState(
    formatDate(event?.ends_at) || formatDate(new Date(Date.now() + 3600000).toISOString()),
  )
  const [location, setLocation] = useState(event?.location ?? '')
  const [category, setCategory] = useState(event?.category ?? 'Workshop')
  const [registrationUrl, setRegistrationUrl] = useState(event?.registration_url ?? '')
  const [albumUrl, setAlbumUrl] = useState(event?.album_url ?? '')
  const [published, setPublished] = useState(event?.published ?? false)

  const [existingPhotos, setExistingPhotos] = useState<EventPhoto[]>([])
  const [newPhotos, setNewPhotos] = useState<{ file: File; preview: string }[]>([])
  const [photosToDelete, setPhotosToDelete] = useState<EventPhoto[]>([])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (event) {
      listEventPhotos(event.id).then(setExistingPhotos).catch(console.error)
    }
  }, [event])

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const mapped = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }))
      setNewPhotos((prev) => [...prev, ...mapped])
    }
    e.target.value = ''
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (saving || !user) return
    setSaving(true)
    setError('')
    try {
      const input: EventInput = {
        title: title.trim(),
        description: description.trim(),
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
        location: location.trim(),
        category: category.trim(),
        registration_url: registrationUrl.trim() || null,
        album_url: albumUrl.trim() || null,
        published,
      }

      const { event: savedEvent, warning } = await saveEvent({ previous: event, input })

      // Delete photos
      for (const photo of photosToDelete) {
        await deleteEventPhoto(photo).catch(console.error)
      }

      // Upload new photos
      let position = existingPhotos.length - photosToDelete.length
      for (const { file } of newPhotos) {
        await uploadEventPhoto(savedEvent.id, file, file.name, position++, user.id)
      }

      onSaved(warning || `${input.title} ${event ? 'updated' : 'created'} successfully.`)
    } catch (err) {
      setError(describeError(err))
      setSaving(false)
    }
  }

  return (
    <Modal
      title={event ? 'Edit event details' : 'Add event'}
      subtitle={
        event ? 'Update scheduling and descriptions.' : 'Set the schedule and event details.'
      }
      onClose={onClose}
      busy={saving}
    >
      <form onSubmit={submit}>
        <div className="editor-body event-editor-body">
          <div className="editor-fields">
            <label className="field">
              Event title <span className="required-mark">*</span>
              <input
                name="title"
                data-autofocus
                required
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={saving}
              />
            </label>
            <label className="field">
              Description <span className="required-mark">*</span>
              <textarea
                name="description"
                required
                rows={4}
                maxLength={1600}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
              />
            </label>
            <div className="form-grid equal-columns">
              <label className="field">
                Start date and time <span className="required-mark">*</span>
                <input
                  type="datetime-local"
                  required
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  disabled={saving}
                />
              </label>
              <label className="field">
                End date and time <span className="required-mark">*</span>
                <input
                  type="datetime-local"
                  required
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  disabled={saving}
                />
              </label>
            </div>
            <div className="form-grid equal-columns">
              <label className="field">
                Location <span className="required-mark">*</span>
                <input
                  required
                  maxLength={200}
                  placeholder="e.g. Auditorium"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={saving}
                />
              </label>
              <label className="field">
                Category <span className="required-mark">*</span>
                <input
                  required
                  maxLength={60}
                  placeholder="e.g. Workshop"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={saving}
                />
              </label>
            </div>
            <div className="form-grid equal-columns">
              <label className="field">
                Registration URL <span className="optional">Optional</span>
                <input
                  type="url"
                  placeholder="https://..."
                  value={registrationUrl}
                  onChange={(e) => setRegistrationUrl(e.target.value)}
                  disabled={saving}
                />
              </label>
              <label className="field">
                Photo album URL <span className="optional">Optional</span>
                <input
                  type="url"
                  placeholder="https://..."
                  value={albumUrl}
                  onChange={(e) => setAlbumUrl(e.target.value)}
                  disabled={saving}
                />
              </label>
            </div>

            <fieldset className="event-photo-field">
              <legend>
                Event photos <span className="optional">Optional</span>
              </legend>
              <div className="event-photo-grid">
                {existingPhotos
                  .filter((p) => !photosToDelete.includes(p))
                  .map((photo) => (
                    <div key={photo.id} className="event-photo">
                      <img src={photo.photo_url} alt="" />
                      <button
                        type="button"
                        onClick={() => setPhotosToDelete((prev) => [...prev, photo])}
                        className="icon-button danger-hover"
                        aria-label="Remove event photo"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                {newPhotos.map((photo, i) => (
                  <div key={i} className="event-photo">
                    <img src={photo.preview} alt="" />
                    <button
                      type="button"
                      onClick={() => setNewPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                      className="icon-button danger-hover"
                      aria-label="Remove event photo"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                <label className="upload-zone event-photo-upload">
                  <input
                    type="file"
                    multiple
                    accept="image/png, image/webp, image/avif"
                    onChange={handlePhotoSelect}
                    aria-label="Upload event photos"
                    disabled={saving}
                  />
                  <UploadCloud size={24} />
                  <span>Upload photos</span>
                </label>
              </div>
            </fieldset>

            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                disabled={saving}
              />
              Publish to website
            </label>
          </div>
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
            <button className="button secondary" type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button
              className="button primary"
              type="submit"
              disabled={saving || !title.trim() || !description.trim()}
            >
              {saving ? <span className="spinner small" /> : <Check size={16} />}
              {saving ? 'Saving…' : event ? 'Save changes' : 'Create event'}
            </button>
          </div>
        </footer>
      </form>
    </Modal>
  )
}
