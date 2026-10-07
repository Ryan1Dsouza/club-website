import { getSupabase } from './supabase'
import type { Event, EventInput, EventPhoto } from './database.types'

const BUCKET = 'event-photos'
const eventColumns = 'id,title,description,starts_at,ends_at,location,category,registration_url,album_url,published,created_at,updated_at'
const photoColumns = 'id,event_id,name,photo_url,photo_path,position,created_at'

export function describeError(error: unknown) {
  const code = (error as { code?: string } | null)?.code
  if (code === '42501')
    return 'Your account cannot make this change. Ask the portal owner to check your admin access.'
  if (code === 'PGRST205' || code === '42P01')
    return 'The events table is not ready. Complete the Supabase setup.'
  if (error instanceof Error && error.name === 'Error') return error.message
  return 'We couldn’t complete that request. Check your connection and try again.'
}

export async function listEvents(signal?: AbortSignal): Promise<Event[]> {
  const { data, error } = await getSupabase()
    .from('events')
    .select(eventColumns)
    .order('starts_at', { ascending: false })
    .order('id')
    .abortSignal(signal ?? new AbortController().signal)
  if (error) throw error
  return data
}

export async function saveEvent({
  previous,
  input
}: {
  previous: Event | null
  input: EventInput
}) {
  const client = getSupabase()
  let event: Event
  
  if (previous) {
    const { data, error } = await client
      .from('events')
      .update(input)
      .eq('id', previous.id)
      .eq('updated_at', previous.updated_at)
      .select(eventColumns)
      .maybeSingle()
    if (error) throw error
    if (!data)
      throw new Error('This event changed or was deleted by another admin. Refresh the list and try again.')
    event = data
  } else {
    const { data, error } = await client
      .from('events')
      .insert(input)
      .select(eventColumns)
      .maybeSingle()
    if (error) throw error
    if (!data) throw new Error('Could not create the event.')
    event = data
  }
  
  return {
    event,
    warning: ''
  }
}

export async function deleteEvent(event: Event) {
  const { data, error } = await getSupabase()
    .from('events')
    .delete()
    .eq('id', event.id)
    .eq('updated_at', event.updated_at)
    .select('id')
    .maybeSingle()
  if (error) throw error
  if (!data)
    throw new Error('This event changed or was already deleted. Refresh the list and try again.')
  return ''
}

export async function listEventPhotos(eventId: string, signal?: AbortSignal): Promise<EventPhoto[]> {
  const { data, error } = await getSupabase()
    .from('event_photos')
    .select(photoColumns)
    .eq('event_id', eventId)
    .order('position', { ascending: true })
    .abortSignal(signal ?? new AbortController().signal)
  if (error) throw error
  return data
}

export async function uploadEventPhoto(eventId: string, file: Blob, filename: string, position: number, userId: string): Promise<EventPhoto> {
  const client = getSupabase()
  const extension = file.type === 'image/webp' ? 'webp' : file.type === 'image/avif' ? 'avif' : 'png'
  const path = `${userId}/${crypto.randomUUID()}.${extension}`
  
  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: '31536000', upsert: false })
    
  if (uploadError) throw new Error('The photo could not be uploaded.')
  
  const photo_url = client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  
  const { data, error } = await client
    .from('event_photos')
    .insert({
      event_id: eventId,
      name: filename,
      photo_url,
      photo_path: path,
      position
    })
    .select(photoColumns)
    .single()
    
  if (error) {
    await client.storage.from(BUCKET).remove([path])
    throw error
  }
  return data
}

export async function deleteEventPhoto(photo: EventPhoto) {
  const client = getSupabase()
  const { error } = await client
    .from('event_photos')
    .delete()
    .eq('id', photo.id)
  if (error) throw error
  await client.storage.from(BUCKET).remove([photo.photo_path])
}
