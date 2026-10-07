export type TeamMember = {
  id: string
  name: string
  role: string
  photo_url: string | null
  photo_path: string | null
  created_at: string
  updated_at: string
}
export type MemberInput = Pick<TeamMember, 'name' | 'role' | 'photo_url' | 'photo_path'>
export type Event = {
  id: string
  title: string
  description: string
  starts_at: string
  ends_at: string
  location: string
  category: string
  registration_url: string | null
  album_url: string | null
  published: boolean
  created_at: string
  updated_at: string
}
export type EventInput = Pick<Event, 'title' | 'description' | 'starts_at' | 'ends_at' | 'location' | 'category' | 'registration_url' | 'album_url' | 'published'>

export type EventPhoto = {
  id: string
  event_id: string
  name: string
  photo_url: string
  photo_path: string
  position: number
  created_at: string
}
export type EventPhotoInput = Pick<EventPhoto, 'event_id' | 'name' | 'photo_url' | 'photo_path' | 'position'>

export type Database = {
  public: {
    Tables: {
      team_members: {
        Row: TeamMember
        Insert: MemberInput & { id?: string }
        Update: Partial<MemberInput>
        Relationships: []
      }
      events: {
        Row: Event
        Insert: EventInput & { id?: string }
        Update: Partial<EventInput>
        Relationships: []
      }
      event_photos: {
        Row: EventPhoto
        Insert: EventPhotoInput & { id?: string }
        Update: Partial<EventPhotoInput>
        Relationships: [
          {
            foreignKeyName: "event_photos_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: { is_admin: { Args: Record<string, never>; Returns: boolean } }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
