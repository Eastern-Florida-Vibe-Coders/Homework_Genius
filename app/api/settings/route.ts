import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const settingsSchema = z.object({
  profile: z.object({
    full_name: z.string().optional(),
    time_zone: z.string().optional(),
    daily_study_threshold: z.number().min(1).max(16).optional(),
  }).optional(),
  preferences: z.object({
    preferred_study_hours_start: z.string().optional(),
    preferred_study_hours_end: z.string().optional(),
    max_continuous_study_minutes: z.number().min(25).max(240).optional(),
    break_interval_minutes: z.number().min(5).max(60).optional(),
    focus_mode_enabled: z.boolean().optional(),
    pomodoro_enabled: z.boolean().optional(),
  }).optional(),
})

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = settingsSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const results: Record<string, unknown> = {}

  if (parsed.data.profile) {
    const { data, error } = await supabase
      .from('profiles')
      .update(parsed.data.profile)
      .eq('id', user.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    results.profile = data
  }

  if (parsed.data.preferences) {
    const { data, error } = await supabase
      .from('preferences')
      .update(parsed.data.preferences)
      .eq('user_id', user.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    results.preferences = data
  }

  return NextResponse.json(results)
}
