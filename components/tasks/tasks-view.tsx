'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, isPast, isToday } from 'date-fns'
import { toast } from 'sonner'
import { Plus, Trash2, CheckCircle2, Circle, BookOpen, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database'

type Task = Database['public']['Tables']['tasks']['Row']

const PRIORITY_CONFIG: Record<number, { label: string; color: string; dot: string }> = {
  1: { label: 'Low',      color: 'bg-slate-50 text-slate-500 border-slate-200',  dot: 'bg-slate-400' },
  2: { label: 'Low-Med',  color: 'bg-blue-50 text-blue-600 border-blue-200',     dot: 'bg-blue-400' },
  3: { label: 'Medium',   color: 'bg-amber-50 text-amber-600 border-amber-200',  dot: 'bg-amber-400' },
  4: { label: 'High',     color: 'bg-orange-50 text-orange-600 border-orange-200', dot: 'bg-orange-400' },
  5: { label: 'Critical', color: 'bg-red-50 text-red-600 border-red-200',        dot: 'bg-red-500' },
}

export function TasksView({ initialTasks }: { initialTasks: Task[] }) {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: '',
    subject: '',
    description: '',
    estimated_hours: '1',
    deadline: '',
    priority_level: '3',
  })

  const filtered = tasks.filter((t) =>
    filter === 'all' ? true : filter === 'pending'
      ? t.status !== 'completed'
      : t.status === 'completed'
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          estimated_hours: parseFloat(form.estimated_hours),
          priority_level: parseInt(form.priority_level) as 1 | 2 | 3 | 4 | 5,
          deadline: new Date(form.deadline).toISOString(),
        }),
      })
      if (!res.ok) throw new Error()
      const { task } = await res.json()
      setTasks((prev) => [...prev, task])
      setForm({ title: '', subject: '', description: '', estimated_hours: '1', deadline: '', priority_level: '3' })
      setShowForm(false)
      toast.success('Task added!')
      router.refresh()
    } catch {
      toast.error('Could not add task')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: newStatus } : t))
    } catch {
      toast.error('Could not update task')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setTasks((prev) => prev.filter((t) => t.id !== id))
      toast.success('Task removed')
    } catch {
      toast.error('Could not delete task')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b] dark:text-[#f1f5f9]">Tasks</h1>
          <p className="text-[#64748b] dark:text-[#94a3b8] text-sm mt-1">
            {tasks.filter((t) => t.status !== 'completed').length} pending
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Add task form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] rounded-2xl p-5 space-y-4"
        >
          <h3 className="font-semibold text-[#1e293b] dark:text-[#f1f5f9]">New Task</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#64748b] mb-1">Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Study for Chemistry midterm"
                className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] dark:border-[#334155] bg-transparent text-sm text-[#1e293b] dark:text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">Subject</label>
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. CHEM 101"
                className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] dark:border-[#334155] bg-transparent text-sm text-[#1e293b] dark:text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">Est. Hours *</label>
              <input
                required
                type="number"
                min="0.25"
                max="24"
                step="0.25"
                value={form.estimated_hours}
                onChange={(e) => setForm({ ...form, estimated_hours: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] dark:border-[#334155] bg-transparent text-sm text-[#1e293b] dark:text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">Deadline *</label>
              <input
                required
                type="datetime-local"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] dark:border-[#334155] bg-transparent text-sm text-[#1e293b] dark:text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">Priority</label>
              <select
                value={form.priority_level}
                onChange={(e) => setForm({ ...form, priority_level: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] dark:border-[#334155] bg-transparent text-sm text-[#1e293b] dark:text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1">1 - Low</option>
                <option value="2">2 - Low-Med</option>
                <option value="3">3 - Medium</option>
                <option value="4">4 - High</option>
                <option value="5">5 - Critical</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-[#64748b] hover:text-[#1e293b] px-4 py-2 rounded-full border border-[#e2e8f0] dark:border-[#334155] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-full transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'text-sm px-4 py-1.5 rounded-full font-medium capitalize transition-colors',
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'text-[#64748b] hover:text-[#1e293b] dark:hover:text-[#f1f5f9] border border-[#e2e8f0] dark:border-[#334155]'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#94a3b8]">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No tasks here yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => {
            const overdue = isPast(new Date(task.deadline)) && task.status !== 'completed'
            const dueToday = isToday(new Date(task.deadline))
            const cfg = PRIORITY_CONFIG[task.priority_level]
            return (
              <div
                key={task.id}
                className={cn(
                  'flex items-start gap-4 bg-white dark:bg-[#1e293b] border rounded-xl px-4 py-4 transition-colors',
                  task.status === 'completed'
                    ? 'border-[#e2e8f0] dark:border-[#334155] opacity-50'
                    : overdue
                    ? 'border-red-200 dark:border-red-900'
                    : 'border-[#e2e8f0] dark:border-[#334155]'
                )}
              >
                <button
                  onClick={() => handleToggleComplete(task)}
                  className="mt-0.5 shrink-0 text-[#94a3b8] hover:text-emerald-500 transition-colors"
                >
                  {task.status === 'completed'
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    : <Circle className="w-5 h-5" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'font-medium text-[#1e293b] dark:text-[#f1f5f9]',
                    task.status === 'completed' && 'line-through'
                  )}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#94a3b8]">
                    {task.subject && <span>{task.subject}</span>}
                    <span>{task.estimated_hours}h est.</span>
                    <span className={cn(overdue && 'text-red-500', dueToday && 'text-amber-500')}>
                      {overdue && <AlertCircle className="inline w-3 h-3 mr-0.5" />}
                      Due {format(new Date(task.deadline), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', cfg.color)}>
                    {cfg.label}
                  </span>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-[#e2e8f0] hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
