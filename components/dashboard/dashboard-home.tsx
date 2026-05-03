'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Play, RefreshCw, Plus, Clock, CheckCircle2, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database'

type StudyBlock = Database['public']['Tables']['study_blocks']['Row'] & {
  tasks: Pick<
    Database['public']['Tables']['tasks']['Row'],
    'id' | 'title' | 'subject' | 'priority_level' | 'estimated_hours' | 'status'
  > | null
}
type Task = Database['public']['Tables']['tasks']['Row']

const PRIORITY_LABELS: Record<number, string> = {
  1: 'Low', 2: 'Low-Med', 3: 'Medium', 4: 'High', 5: 'Critical',
}
const PRIORITY_COLORS: Record<number, string> = {
  1: 'bg-slate-100 text-slate-600',
  2: 'bg-blue-50 text-blue-600',
  3: 'bg-amber-50 text-amber-600',
  4: 'bg-orange-50 text-orange-600',
  5: 'bg-red-50 text-red-600',
}

interface Props {
  userName: string
  studyBlocks: StudyBlock[]
  upcomingTasks: Task[]
}

export function DashboardHome({ userName, studyBlocks, upcomingTasks }: Props) {
  const router = useRouter()
  const [regenerating, setRegenerating] = useState(false)
  const [focusBlock, setFocusBlock] = useState<StudyBlock | null>(null)

  const completedCount = studyBlocks.filter((b) => b.status === 'completed').length
  const totalCount = studyBlocks.length
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const nextBlock = studyBlocks.find((b) => b.status === 'planned')

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = (await res.json()) as {
        error?: string
        reason?: string
      }
      if (!res.ok) throw new Error(data.error ?? 'Failed to regenerate')
      if (data.reason === 'no_tasks') {
        toast.info(
          'Add at least one open task (with study time left) before generating study blocks.'
        )
      } else {
        toast.success('Schedule regenerated!')
      }
      router.refresh()
    } catch {
      toast.error('Could not regenerate schedule')
    } finally {
      setRegenerating(false)
    }
  }

  if (focusBlock) {
    return <FocusMode block={focusBlock} onExit={() => setFocusBlock(null)} onRefresh={() => router.refresh()} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b] dark:text-[#f1f5f9]">
            Good {getGreeting()}, {userName.split(' ')[0]} 👋
          </h1>
          <p className="text-[#64748b] dark:text-[#94a3b8] mt-1">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="flex items-center gap-2 text-sm text-[#64748b] dark:text-[#94a3b8] hover:text-indigo-600 border border-[#e2e8f0] dark:border-[#334155] rounded-full px-4 py-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4', regenerating && 'animate-spin')} />
          Regenerate
        </button>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-[#e2e8f0] dark:border-[#334155] p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-[#1e293b] dark:text-[#f1f5f9]">
              Today&apos;s Progress
            </span>
            <span className="text-sm font-semibold text-indigo-600">
              {completedCount} / {totalCount} blocks
            </span>
          </div>
          <div className="w-full bg-[#e2e8f0] dark:bg-[#334155] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-[#94a3b8] mt-2">{progressPct}% complete — you&apos;re doing great!</p>
        </div>
      )}

      {/* Focus Now CTA */}
      {nextBlock && (
        <div className="relative bg-indigo-600 rounded-2xl p-6 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_white,_transparent)]" />
          <div className="relative">
            <p className="text-indigo-200 text-sm font-medium mb-1">Up next</p>
            {nextBlock.tasks?.title ? (
              <h2 className="text-white text-xl font-bold mb-1">{nextBlock.tasks.title}</h2>
            ) : null}
            <p className="text-indigo-200 text-sm mb-4">
              {format(new Date(nextBlock.start_time), 'h:mm a')} –{' '}
              {format(new Date(nextBlock.end_time), 'h:mm a')}
              {nextBlock.tasks?.subject && ` · ${nextBlock.tasks.subject}`}
            </p>
            <button
              onClick={() => setFocusBlock(nextBlock)}
              className="flex items-center gap-2 bg-white text-indigo-600 font-semibold px-6 py-2.5 rounded-full hover:bg-indigo-50 transition-colors"
            >
              <Play className="w-4 h-4 fill-indigo-600" />
              Focus Now
            </button>
          </div>
        </div>
      )}

      {/* Study blocks timeline */}
      <div>
        <h2 className="text-sm font-semibold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wide mb-3">
          Today&apos;s Schedule
        </h2>
        {studyBlocks.length === 0 ? (
          <EmptyState onGenerate={handleRegenerate} generating={regenerating} />
        ) : (
          <div className="space-y-2">
            {studyBlocks.map((block) => (
              <BlockCard
                key={block.id}
                block={block}
                onFocus={() => setFocusBlock(block)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wide">
            Upcoming Tasks
          </h2>
          {upcomingTasks.length > 0 && (
            <a href="/tasks" className="text-sm text-indigo-600 hover:underline font-medium">
              View all
            </a>
          )}
        </div>
        {upcomingTasks.length === 0 ? (
          <div className="text-center bg-white dark:bg-[#1e293b] border border-dashed border-[#e2e8f0] dark:border-[#334155] rounded-2xl py-8 px-6">
            <BookOpen className="w-8 h-8 text-[#cbd5e1] dark:text-[#475569] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#1e293b] dark:text-[#f1f5f9] mb-1">No tasks yet</p>
            <p className="text-xs text-[#94a3b8] mb-4">
              Add homework on the Tasks page. Nothing here is filled in automatically.
            </p>
            <a
              href="/tasks"
              className="inline-flex text-sm font-semibold text-indigo-600 hover:underline"
            >
              Go to Tasks
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] rounded-xl px-4 py-3"
              >
                <BookOpen className="w-4 h-4 text-[#94a3b8] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1e293b] dark:text-[#f1f5f9] truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-[#94a3b8]">
                    Due {format(new Date(task.deadline), 'MMM d')}
                    {task.subject && ` · ${task.subject}`}
                  </p>
                </div>
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', PRIORITY_COLORS[task.priority_level])}>
                  {PRIORITY_LABELS[task.priority_level]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BlockCard({ block, onFocus }: { block: StudyBlock; onFocus: () => void }) {
  const isCompleted = block.status === 'completed'
  const isMissed = block.status === 'missed'

  return (
    <div
      className={cn(
        'flex items-center gap-4 bg-white dark:bg-[#1e293b] border rounded-xl px-4 py-3 transition-colors',
        isCompleted
          ? 'border-emerald-200 dark:border-emerald-900 opacity-60'
          : isMissed
          ? 'border-red-200 dark:border-red-900 opacity-60'
          : 'border-[#e2e8f0] dark:border-[#334155] hover:border-indigo-200 dark:hover:border-indigo-800 cursor-pointer'
      )}
      onClick={!isCompleted && !isMissed ? onFocus : undefined}
    >
      <div className="flex flex-col items-center text-xs text-[#94a3b8] font-mono w-16 shrink-0">
        <span>{format(new Date(block.start_time), 'h:mm')}</span>
        <span className="my-0.5 text-[#e2e8f0]">|</span>
        <span>{format(new Date(block.end_time), 'h:mma')}</span>
      </div>
      <div
        className={cn(
          'w-1 self-stretch rounded-full',
          isCompleted ? 'bg-emerald-400' : isMissed ? 'bg-red-400' : 'bg-indigo-400'
        )}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1e293b] dark:text-[#f1f5f9] truncate">
          {block.tasks?.title ?? ''}
        </p>
        {block.tasks?.subject && (
          <p className="text-xs text-[#94a3b8]">{block.tasks.subject}</p>
        )}
      </div>
      {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
      {!isCompleted && !isMissed && (
        <Play className="w-4 h-4 text-indigo-400 shrink-0" />
      )}
    </div>
  )
}

function EmptyState({ onGenerate, generating }: { onGenerate: () => void; generating: boolean }) {
  return (
    <div className="text-center bg-white dark:bg-[#1e293b] border border-dashed border-[#e2e8f0] dark:border-[#334155] rounded-2xl py-12 px-6">
      <Clock className="w-10 h-10 text-[#e2e8f0] dark:text-[#334155] mx-auto mb-3" />
      <p className="text-[#1e293b] dark:text-[#f1f5f9] font-medium mb-1">No study schedule yet</p>
      <p className="text-sm text-[#94a3b8] mb-4">
        Study blocks only appear after you add tasks and run Generate Schedule. This app does not insert
        sample events or homework for you.
      </p>
      <button
        onClick={onGenerate}
        disabled={generating}
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors disabled:opacity-50"
      >
        <Plus className="w-4 h-4" />
        {generating ? 'Generating...' : 'Generate Schedule'}
      </button>
    </div>
  )
}

function FocusMode({ block, onExit, onRefresh }: { block: StudyBlock; onExit: () => void; onRefresh: () => void }) {
  const [marking, setMarking] = useState(false)

  const handleComplete = async () => {
    setMarking(true)
    try {
      const res = await fetch(`/api/schedule/${block.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })
      if (!res.ok) throw new Error()
      toast.success('Block completed! Great work 🎉')
      onRefresh()
      onExit()
    } catch {
      toast.error('Could not mark as complete')
    } finally {
      setMarking(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a] flex flex-col items-center justify-center text-white px-6">
      <p className="text-indigo-400 text-sm font-medium mb-2 uppercase tracking-widest">Focus Mode</p>
      {block.tasks?.title ? (
        <h1 className="text-3xl font-bold text-center mb-2">{block.tasks.title}</h1>
      ) : null}
      {block.tasks?.subject && (
        <p className="text-slate-400 mb-8">{block.tasks.subject}</p>
      )}
      <div className="text-slate-300 text-lg font-mono mb-12">
        {format(new Date(block.start_time), 'h:mm a')} – {format(new Date(block.end_time), 'h:mm a')}
      </div>
      <p className="text-slate-500 text-sm mb-10 text-center max-w-sm">
        You&apos;re exactly on track for your goal today. Put your head down — you&apos;ve got this.
      </p>
      <div className="flex gap-4">
        <button
          onClick={handleComplete}
          disabled={marking}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-full transition-colors disabled:opacity-50"
        >
          {marking ? 'Saving...' : '✓ Mark Complete'}
        </button>
        <button
          onClick={onExit}
          className="border border-slate-600 hover:border-slate-400 text-slate-400 hover:text-white font-semibold px-6 py-3 rounded-full transition-colors"
        >
          Exit Focus
        </button>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
