import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Check, X, Calendar, Image as ImageIcon, MapPin, Link2, Trash2, UploadCloud } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import type { Event, EventInput, EventPhoto } from '../lib/database.types'
import { describeError, saveEvent, listEventPhotos, uploadEventPhoto, deleteEventPhoto } from '../lib/events'
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
  
  const [startsAt, setStartsAt] = useState(formatDate(event?.starts_at) || formatDate(new Date().toISOString()))
  const [endsAt, setEndsAt] = useState(formatDate(event?.ends_at) || formatDate(new Date(Date.now() + 3600000).toISOString()))
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
      const mapped = files.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }))
      setNewPhotos(prev => [...prev, ...mapped])
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
      title={event ? 'Edit event details' : 'Plan a new event.'}
      subtitle={event ? 'Update scheduling and descriptions.' : 'Get everything ready for the big day.'}
      onClose={onClose}
      busy={saving}
    >
      <form onSubmit={submit}>
        <div className="editor-body">
          <div className="editor-fields" style={{ width: '100%', maxWidth: 'none', paddingRight: 0, border: 'none' }}>
            
            <label className="field">
              Event Title <span className="required-mark">*</span>
              <input
                name="title"
                data-autofocus
                required
                maxLength={120}
                placeholder="e.g. Beyond the baseline"
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
                placeholder="Event details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
                style={{ resize: 'vertical' }}
              />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <label className="field">
                  Start Date & Time <span className="required-mark">*</span>
                  <input type="datetime-local" required value={startsAt} onChange={(e) => setStartsAt(e.target.value)} disabled={saving} />
                </label>
                <label className="field">
                  End Date & Time <span className="required-mark">*</span>
                  <input type="datetime-local" required value={endsAt} onChange={(e) => setEndsAt(e.target.value)} disabled={saving} />
                </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <label className="field">
                  Location <span className="required-mark">*</span>
                  <input required maxLength={200} placeholder="e.g. Auditorium" value={location} onChange={(e) => setLocation(e.target.value)} disabled={saving} />
                </label>
                <label className="field">
                  Category <span className="required-mark">*</span>
                  <input required maxLength={60} placeholder="e.g. Workshop" value={category} onChange={(e) => setCategory(e.target.value)} disabled={saving} />
                </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <label className="field">
                  Registration URL <span className="optional">Optional</span>
                  <input type="url" placeholder="https://..." value={registrationUrl} onChange={(e) => setRegistrationUrl(e.target.value)} disabled={saving} />
                </label>
                <label className="field">
                  External Album URL <span className="optional">Optional</span>
                  <input type="url" placeholder="https://..." value={albumUrl} onChange={(e) => setAlbumUrl(e.target.value)} disabled={saving} />
                </label>
            </div>
            
            <label className="field">
              Event Photos <span className="optional">Optional</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                {existingPhotos.filter(p => !photosToDelete.includes(p)).map((photo) => (
                  <div key={photo.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#111' }}>
                    <img src={photo.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => setPhotosToDelete(prev => [...prev, photo])} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {newPhotos.map((photo, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#111' }}>
                    <img src={photo.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => setNewPhotos(prev => prev.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', aspectRatio: '1', borderRadius: '8px', border: '2px dashed #333', cursor: 'pointer', backgroundColor: '#0a0a0a', color: '#888' }}>
                  <input type="file" multiple accept="image/png, image/webp, image/avif" onChange={handlePhotoSelect} style={{ display: 'none' }} disabled={saving} />
                  <UploadCloud size={24} style={{ marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Upload</span>
                </label>
              </div>
            </label>

            <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} disabled={saving} />
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
          <span><span className="required-mark">*</span> Required fields</span>
          <div className="button-row">
            <button className="button secondary" type="button" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="button primary" type="submit" disabled={saving || !title.trim() || !description.trim()}>
              {saving ? <span className="spinner small" /> : <Check size={16} />}
              {saving ? 'Saving…' : event ? 'Save changes' : 'Create event'}
            </button>
          </div>
        </footer>
      </form>
    </Modal>
  )
}
