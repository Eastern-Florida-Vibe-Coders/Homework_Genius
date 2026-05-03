import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  blocksToInserts,
  scheduleAcrossDays,
  SCHEDULE_HORIZON_DAYS,
} from '@/lib/scheduler/engine'
import { DateTime } from 'luxon'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { date?: string } = {}
    try {
      const raw = await request.json()
      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        body = raw as { date?: string }
      }
    } catch {
      // Empty body or invalid JSON — default target date below
    }

    const targetDate = body.date
      ? DateTime.fromISO(body.date)
      : DateTime.now()

    if (body.date && !targetDate.isValid) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    }

    // Fetch user preferences
    const { data: preferences } = await supabase
      .from('preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!preferences) {
      return NextResponse.json({ error: 'Preferences not found' }, { status: 404 })
    }

    const horizonStart = targetDate.startOf('day')
    const horizonEnd = targetDate.plus({ days: SCHEDULE_HORIZON_DAYS }).endOf('day')
    const horizonStartIso = horizonStart.toISO()!
    const horizonEndIso = horizonEnd.toISO()!

    // Events that overlap the scheduling window (any day in the horizon)
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .gt('end_time', horizonStartIso)
      .lt('start_time', horizonEndIso)

    // Fetch pending/in-progress tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['pending', 'in_progress'])
      .order('priority_level', { ascending: false })

    if (!events || !tasks) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    const schedulableTasks = tasks.filter(
      (t) => t.status !== 'completed' && Number(t.estimated_hours) > 0
    )

    if (schedulableTasks.length === 0) {
      return NextResponse.json({
        blocks: [],
        count: 0,
        reason: 'no_tasks',
      })
    }

    // Remove planned blocks in this window so regeneration replaces the full multi-day plan
    await supabase
      .from('study_blocks')
      .delete()
      .eq('user_id', user.id)
      .eq('status', 'planned')
      .gt('end_time', horizonStartIso)
      .lt('start_time', horizonEndIso)

    const scheduledBlocks = scheduleAcrossDays(
      events,
      schedulableTasks,
      preferences,
      targetDate.startOf('day'),
      SCHEDULE_HORIZON_DAYS
    )
    const inserts = blocksToInserts(scheduledBlocks, user.id)

    if (inserts.length > 0) {
      const { data: newBlocks, error: insertError } = await supabase
        .from('study_blocks')
        .insert(inserts)
        .select()

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      return NextResponse.json({ blocks: newBlocks, count: newBlocks?.length ?? 0 })
    }

    return NextResponse.json({ blocks: [], count: 0 })
  } catch (err) {
    console.error('Schedule generation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = DateTime.now()
    const { data: blocks, error } = await supabase
      .from('study_blocks')
      .select('*, tasks(*)')
      .eq('user_id', user.id)
      .not('task_id', 'is', null)
      .gte('start_time', today.startOf('day').toISO()!)
      .lte('end_time', today.endOf('day').toISO()!)
      .order('start_time', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ blocks })
  } catch (err) {
    console.error('Fetch schedule error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
