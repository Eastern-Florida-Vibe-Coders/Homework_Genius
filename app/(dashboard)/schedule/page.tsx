import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ScheduleView } from '@/components/schedule/schedule-view'
import { getMondayWeekRange } from '@/lib/schedule-week-range'

export const metadata = { title: 'Schedule' }

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { week } = await searchParams
  const { weekMonday, queryRangeStart, queryRangeEndExclusive } = getMondayWeekRange(week)

  const qStartIso = queryRangeStart.toISOString()
  const qEndIso = queryRangeEndExclusive.toISOString()

  // Intersects padded window; UI assigns rows to days with isSameDay (Monday-aligned week via ?week=)
  const { data: studyBlocksRaw, error: studyBlocksError } = await supabase
    .from('study_blocks')
    .select('*, tasks(id, title, subject, priority_level)')
    .eq('user_id', user.id)
    .not('task_id', 'is', null)
    .gt('end_time', qStartIso)
    .lt('start_time', qEndIso)
    .order('start_time', { ascending: true })

  const { data: eventsRaw, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .gt('end_time', qStartIso)
    .lt('start_time', qEndIso)
    .order('start_time', { ascending: true })

  if (studyBlocksError) console.error('schedule study_blocks:', studyBlocksError.message)
  if (eventsError) console.error('schedule events:', eventsError.message)

  const studyBlocks =
    studyBlocksError || !Array.isArray(studyBlocksRaw) ? [] : studyBlocksRaw
  const events = eventsError || !Array.isArray(eventsRaw) ? [] : eventsRaw

  return (
    <Suspense
      fallback={
        <div className="text-sm text-[#64748b] dark:text-[#94a3b8] py-12 text-center">Loading schedule…</div>
      }
    >
      <ScheduleView
        studyBlocks={studyBlocks}
        events={events}
        weekMonday={weekMonday}
      />
    </Suspense>
  )
}
