import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ScheduleView } from '@/components/schedule/schedule-view'

export const metadata = { title: 'Schedule' }

export default async function SchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const { data: studyBlocks } = await supabase
    .from('study_blocks')
    .select('*, tasks(id, title, subject, priority_level)')
    .eq('user_id', user.id)
    .gte('start_time', weekStart.toISOString())
    .lte('end_time', weekEnd.toISOString())
    .order('start_time', { ascending: true })

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .gte('start_time', weekStart.toISOString())
    .lte('end_time', weekEnd.toISOString())
    .order('start_time', { ascending: true })

  return (
    <ScheduleView
      studyBlocks={studyBlocks ?? []}
      events={events ?? []}
    />
  )
}
