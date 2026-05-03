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

  const { data: studyBlocks } = await supabase
    .from('study_blocks')
    .select('*, tasks(id, title, subject, priority_level, estimated_hours)')
    .eq('user_id', user.id)
    .gte('start_time', dayStart)
    .lte('end_time', dayEnd)
    .order('start_time', { ascending: true })

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['pending', 'in_progress'])
    .order('deadline', { ascending: true })
    .limit(5)

  return (
    <DashboardHome
      userName={profile?.full_name ?? 'Student'}
      studyBlocks={studyBlocks ?? []}
      upcomingTasks={tasks ?? []}
    />
  )
}
