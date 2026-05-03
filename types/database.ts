export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type EmptyRelationships = []

// Named row types avoid circular `Database['public']['Tables'][x]` references that break inference.

export type ProfilesRow = {
  id: string
  email: string
  full_name: string | null
  time_zone: string
  daily_study_threshold: number
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}
export type ProfilesInsert = Omit<ProfilesRow, 'created_at' | 'updated_at'>
export type ProfilesUpdate = Partial<ProfilesInsert>

export type EventsRow = {
  id: string
  user_id: string
  title: string
  event_type: 'class' | 'work' | 'sports' | 'personal' | 'other'
  start_time: string
  end_time: string
  is_recurring: boolean
  recurrence_rule: string | null
  created_at: string
}
export type EventsInsert = Omit<EventsRow, 'id' | 'created_at'>
export type EventsUpdate = Partial<EventsInsert>

export type TasksRow = {
  id: string
  user_id: string
  title: string
  description: string | null
  subject: string | null
  estimated_hours: number
  deadline: string
  priority_level: 1 | 2 | 3 | 4 | 5
  status: 'pending' | 'in_progress' | 'completed'
  created_at: string
  updated_at: string
}
/** Inserts omit server timestamps; nullable columns are optional for API payloads. */
export type TasksInsert = Omit<
  TasksRow,
  'id' | 'created_at' | 'updated_at' | 'description' | 'subject'
> & {
  description?: string | null
  subject?: string | null
}
export type TasksUpdate = Partial<TasksInsert>

export type StudyBlocksRow = {
  id: string
  user_id: string
  task_id: string | null
  start_time: string
  end_time: string
  status: 'planned' | 'completed' | 'missed' | 'rescheduled'
  intensity_score: number | null
  notes: string | null
  created_at: string
  updated_at: string
}
export type StudyBlocksInsert = Omit<StudyBlocksRow, 'id' | 'created_at' | 'updated_at'>
export type StudyBlocksUpdate = Partial<StudyBlocksInsert>

export type PreferencesRow = {
  id: string
  user_id: string
  preferred_study_hours_start: string
  preferred_study_hours_end: string
  max_continuous_study_minutes: number
  break_interval_minutes: number
  focus_mode_enabled: boolean
  pomodoro_enabled: boolean
  updated_at: string
}
export type PreferencesInsert = Omit<PreferencesRow, 'id' | 'updated_at'>
export type PreferencesUpdate = Partial<PreferencesInsert>

export type UserTrustLogsRow = {
  id: string
  user_id: string
  study_block_id: string
  action: 'moved' | 'skipped' | 'completed_early' | 'extended'
  original_start: string
  original_end: string
  new_start: string | null
  new_end: string | null
  created_at: string
}
export type UserTrustLogsInsert = Omit<UserTrustLogsRow, 'id' | 'created_at'>
export type UserTrustLogsUpdate = Partial<UserTrustLogsInsert>

export interface Database {
  // Required by @supabase/supabase-js for PostgREST 12+ client inference (see generated types from `supabase gen types`)
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
  public: {
    Tables: {
      profiles: {
        Row: ProfilesRow
        Insert: ProfilesInsert
        Update: ProfilesUpdate
        Relationships: EmptyRelationships
      }
      events: {
        Row: EventsRow
        Insert: EventsInsert
        Update: EventsUpdate
        Relationships: EmptyRelationships
      }
      tasks: {
        Row: TasksRow
        Insert: TasksInsert
        Update: TasksUpdate
        Relationships: EmptyRelationships
      }
      study_blocks: {
        Row: StudyBlocksRow
        Insert: StudyBlocksInsert
        Update: StudyBlocksUpdate
        Relationships: EmptyRelationships
      }
      preferences: {
        Row: PreferencesRow
        Insert: PreferencesInsert
        Update: PreferencesUpdate
        Relationships: EmptyRelationships
      }
      user_trust_logs: {
        Row: UserTrustLogsRow
        Insert: UserTrustLogsInsert
        Update: UserTrustLogsUpdate
        Relationships: EmptyRelationships
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
