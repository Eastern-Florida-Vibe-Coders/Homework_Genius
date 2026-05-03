import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHome } from '@/components/dashboard/dashboard-home'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if onboarding is complete
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_complete, full_name')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_complete) {
    redirect('/onboarding')
  }

  // Fetch today's study blocks with joined task data
  const today = new Date()
  const dayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString()
  const dayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString()

  const { data: rawStudyBlocks, error: studyBlocksError } = await supabase
    .from('study_blocks')
    .select('*, tasks(id, title, subject, priority_level, estimated_hours, status)')
    .eq('user_id', user.id)
    .not('task_id', 'is', null)
    .gte('start_time', dayStart)
    .lte('end_time', dayEnd)
    .order('start_time', { ascending: true })

  if (studyBlocksError) {
    console.error('dashboard study_blocks:', studyBlocksError.message)
  }

  // Use DB rows only: on success `rawStudyBlocks` is [] or rows; on error, show empty (no fabricated items)
  const studyBlocks =
    studyBlocksError || !Array.isArray(rawStudyBlocks)
      ? []
      : rawStudyBlocks.filter(
          (b) =>
            b.tasks &&
            (b.tasks.status === 'pending' || b.tasks.status === 'in_progress')
        )

  const { data: upcomingTasksRaw, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['pending', 'in_progress'])
    .order('deadline', { ascending: true })
    .limit(5)

  if (tasksError) {
    console.error('dashboard tasks:', tasksError.message)
  }

  const upcomingTasks =
    tasksError || !Array.isArray(upcomingTasksRaw) ? [] : upcomingTasksRaw

  return (
    <DashboardHome
      userName={profile?.full_name ?? 'Student'}
      studyBlocks={studyBlocks}
      upcomingTasks={upcomingTasks}
    />
  )
}
