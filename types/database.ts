export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          time_zone: string
          daily_study_threshold: number
          onboarding_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      events: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }
      tasks: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      study_blocks: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['study_blocks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['study_blocks']['Insert']>
      }
      preferences: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['preferences']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['preferences']['Insert']>
      }
      user_trust_logs: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['user_trust_logs']['Row'], 'id' | 'created_at'>
        Update: never
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
