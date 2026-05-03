import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { findAvailableSlots, assignTasksToSlots, blocksToInserts } from '@/lib/scheduler/engine'
import { DateTime } from 'luxon'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const targetDate = body.date
      ? DateTime.fromISO(body.date)
      : DateTime.now()

    // Fetch user preferences
    const { data: preferences } = await supabase
      .from('preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!preferences) {
      return NextResponse.json({ error: 'Preferences not found' }, { status: 404 })
    }

    // Fetch events for the target day
    const dayStart = targetDate.startOf('day').toISO()
    const dayEnd = targetDate.endOf('day').toISO()

    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', dayStart!)
      .lte('end_time', dayEnd!)

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

    // Delete existing planned blocks for today before regenerating
    await supabase
      .from('study_blocks')
      .delete()
      .eq('user_id', user.id)
      .eq('status', 'planned')
      .gte('start_time', dayStart!)
      .lte('end_time', dayEnd!)

    // Run scheduling engine
    const slots = findAvailableSlots(events, targetDate, preferences)
    const scheduledBlocks = assignTasksToSlots(tasks, slots, preferences)
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
