import { getSupabase } from './supabase'
import type { MemberInput, TeamMember } from './database.types'

const BUCKET = 'team-photos'
const columns = 'id,name,role,photo_url,photo_path,created_at,updated_at'
export function describeError(error: unknown) {
  const code = (error as { code?: string } | null)?.code
  if (code === '42501')
    return 'Your account cannot make this change. Ask the portal owner to check your admin access.'
  if (code === 'PGRST205' || code === '42P01')
    return 'The team table is not ready. Complete the Supabase setup in README.md.'
  if (error instanceof Error && error.name === 'Error') return error.message
  return 'We couldn’t complete that request. Check your connection and try again.'
}
export async function listMembers(signal: AbortSignal): Promise<TeamMember[]> {
  const members: TeamMember[] = []
  // Supabase caps each response; page through the table so search covers every member.
  for (let start = 0; ; start += 500) {
    const { data, error } = await getSupabase()
      .from('team_members')
      .select(columns)
      .order('created_at', { ascending: false })
      .order('id')
      .range(start, start + 499)
      .abortSignal(signal)
    if (error) throw error
    members.push(...data)
    if (data.length < 500) return members
  }
}
async function removePhoto(path: string | null) {
  if (!path) return true
  try {
    const { error } = await getSupabase().storage.from(BUCKET).remove([path])
    return !error
  } catch {
    return false
  }
}
export async function saveMember({
  previous,
  name,
  role,
  photo,
  removeExistingPhoto,
  userId,
}: {
  previous: TeamMember | null
  name: string
  role: string
  photo: Blob | null
  removeExistingPhoto: boolean
  userId: string
}) {
  const trimmedName = name.trim(),
    trimmedRole = role.trim()
  if (!trimmedName || trimmedName.length > 100 || !trimmedRole || trimmedRole.length > 100)
    throw new Error('Name and role are required and must be 100 characters or fewer.')
  const client = getSupabase()
  let uploadedPath: string | null = null
  const input: MemberInput = {
    name: trimmedName,
    role: trimmedRole,
    photo_url: removeExistingPhoto ? null : (previous?.photo_url ?? null),
    photo_path: removeExistingPhoto ? null : (previous?.photo_path ?? null),
  }
  if (photo) {
    const extension = photo.type === 'image/webp' ? 'webp' : 'png'
    const path = `${userId}/${crypto.randomUUID()}.${extension}`
    const { error } = await client.storage
      .from(BUCKET)
      .upload(path, photo, { contentType: photo.type, cacheControl: '31536000', upsert: false })
    if (error)
      throw new Error(
        'The photo could not be uploaded. Check your connection and the team-photos bucket permissions.',
      )
    uploadedPath = path
    input.photo_path = path
    input.photo_url = client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  }
  let member: TeamMember
  try {
    const query = previous
      ? client
          .from('team_members')
          .update(input)
          .eq('id', previous.id)
          .eq('updated_at', previous.updated_at)
      : client.from('team_members').insert(input)
    const { data, error } = await query.select(columns).maybeSingle()
    if (error) throw error
    if (!data)
      throw new Error(
        'This member changed or was deleted by another admin. Close this form, refresh the list, and try again.',
      )
    member = data
  } catch (error) {
    // The storage DELETE policy refuses deletion if a row references the file, including ambiguous network failures.
    const cleaned = await removePhoto(uploadedPath)
    if (!cleaned)
      throw new Error(
        `${describeError(error)} A photo may remain in storage; check it before retrying.`,
      )
    throw error
  }
  const oldPath = previous?.photo_path ?? null
  const cleaned = oldPath && oldPath !== member.photo_path ? await removePhoto(oldPath) : true
  return {
    member,
    warning: cleaned
      ? ''
      : 'Member saved. The previous photo could not be removed from storage; it can be cleaned up later.',
  }
}
export async function deleteMember(member: TeamMember) {
  const { data, error } = await getSupabase()
    .from('team_members')
    .delete()
    .eq('id', member.id)
    .eq('updated_at', member.updated_at)
    .select('id')
    .maybeSingle()
  if (error) throw error
  if (!data)
    throw new Error(
      'This member changed or was already deleted. Close this dialog, refresh the list, and try again.',
    )
  return (await removePhoto(member.photo_path))
    ? ''
    : 'Member deleted. Their photo could not be removed from storage; it can be cleaned up later.'
}
