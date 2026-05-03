import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TasksView } from '@/components/tasks/tasks-view'

export const metadata = { title: 'Tasks' }

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('deadline', { ascending: true })

  if (tasksError) {
    console.error('tasks page:', tasksError.message)
  }

  const initialTasks = tasksError || !Array.isArray(tasks) ? [] : tasks

  return <TasksView initialTasks={initialTasks} />
}
