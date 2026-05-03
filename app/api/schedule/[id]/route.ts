import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const patchSchema = z.object({
  status: z.enum(['planned', 'completed', 'missed', 'rescheduled']).optional(),
  notes: z.string().optional(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const parsed = patchSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Fetch original block to log trust data
  const { data: original } = await supabase
    .from('study_blocks')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!original) {
    return NextResponse.json({ error: 'Block not found' }, { status: 404 })
  }

  // If rescheduling, log it to user_trust_logs
  if (parsed.data.start_time || parsed.data.end_time) {
    await supabase.from('user_trust_logs').insert({
      user_id: user.id,
      study_block_id: id,
      action: 'moved',
      original_start: original.start_time,
      original_end: original.end_time,
      new_start: parsed.data.start_time ?? null,
      new_end: parsed.data.end_time ?? null,
    })
  }

  if (parsed.data.status === 'missed') {
    await supabase.from('user_trust_logs').insert({
      user_id: user.id,
      study_block_id: id,
      action: 'skipped',
      original_start: original.start_time,
      original_end: original.end_time,
      new_start: null,
      new_end: null,
    })
  }

  const { data, error } = await supabase
    .from('study_blocks')
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ block: data })
}
