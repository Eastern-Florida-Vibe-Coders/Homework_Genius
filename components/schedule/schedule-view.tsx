'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database'

type StudyBlock = Database['public']['Tables']['study_blocks']['Row'] & {
  tasks: Pick<Database['public']['Tables']['tasks']['Row'], 'id' | 'title' | 'subject' | 'priority_level'> | null
}
type Event = Database['public']['Tables']['events']['Row']

const EVENT_TYPE_COLOR: Record<string, string> = {
  class:    'bg-blue-100 text-blue-700 border-blue-200',
  work:     'bg-amber-100 text-amber-700 border-amber-200',
  sports:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  personal: 'bg-purple-100 text-purple-700 border-purple-200',
  other:    'bg-slate-100 text-slate-600 border-slate-200',
}

const BLOCK_STATUS_COLOR: Record<string, string> = {
  planned:     'bg-indigo-100 text-indigo-700 border-indigo-200',
  completed:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  missed:      'bg-red-100 text-red-600 border-red-200',
  rescheduled: 'bg-amber-100 text-amber-700 border-amber-200',
}

interface Props {
  studyBlocks: StudyBlock[]
  events: Event[]
}

export function ScheduleView({ studyBlocks, events }: Props) {
  const router = useRouter()
  const [weekOffset, setWeekOffset] = useState(0)
  const [regenerating, setRegenerating] = useState(false)

  const baseDate = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(baseDate, i))

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      const res = await fetch('/api/schedule', { method: 'POST' })
      if (!res.ok) throw new Error()
      toast.success("Today's schedule regenerated!")
      router.refresh()
    } catch {
      toast.error('Could not regenerate')
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b] dark:text-[#f1f5f9]">Schedule</h1>
          <p className="text-sm text-[#64748b] dark:text-[#94a3b8] mt-1">
            Week of {format(baseDate, 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-indigo-600 border border-[#e2e8f0] dark:border-[#334155] rounded-full px-3 py-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4', regenerating && 'animate-spin')} />
            Regenerate
          </button>
          <button
            onClick={() => setWeekOffset((v) => v - 1)}
            className="p-2 rounded-full border border-[#e2e8f0] dark:border-[#334155] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="text-sm px-3 py-1.5 rounded-full border border-[#e2e8f0] dark:border-[#334155] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setWeekOffset((v) => v + 1)}
            className="p-2 rounded-full border border-[#e2e8f0] dark:border-[#334155] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-indigo-400" /> Study Block
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-400" /> Class
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-400" /> Work
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-400" /> Completed
        </span>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dayBlocks = studyBlocks.filter((b) =>
            isSameDay(new Date(b.start_time), day)
          )
          const dayEvents = events.filter((e) =>
            isSameDay(new Date(e.start_time), day)
          )
          const allItems = [
            ...dayEvents.map((e) => ({ type: 'event' as const, data: e, start: new Date(e.start_time) })),
            ...dayBlocks.map((b) => ({ type: 'block' as const, data: b, start: new Date(b.start_time) })),
          ].sort((a, b) => a.start.getTime() - b.start.getTime())

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'bg-white dark:bg-[#1e293b] rounded-xl border p-3 min-h-32',
                isToday(day)
                  ? 'border-indigo-300 dark:border-indigo-700'
                  : 'border-[#e2e8f0] dark:border-[#334155]'
              )}
            >
              <div className="mb-2">
                <p className={cn(
                  'text-xs font-semibold uppercase tracking-wide',
                  isToday(day) ? 'text-indigo-600' : 'text-[#94a3b8]'
                )}>
                  {format(day, 'EEE')}
                </p>
                <p className={cn(
                  'text-lg font-bold',
                  isToday(day) ? 'text-indigo-600' : 'text-[#1e293b] dark:text-[#f1f5f9]'
                )}>
                  {format(day, 'd')}
                </p>
              </div>

              {allItems.length === 0 ? (
                <p className="text-xs text-[#e2e8f0] dark:text-[#334155] mt-2">Free</p>
              ) : (
                <div className="space-y-1">
                  {allItems.map((item) => {
                    if (item.type === 'event') {
                      const e = item.data
                      return (
                        <div
                          key={`evt-${e.id}`}
                          className={cn(
                            'text-xs px-2 py-1 rounded-lg border font-medium truncate',
                            EVENT_TYPE_COLOR[e.event_type] ?? EVENT_TYPE_COLOR.other
                          )}
                          title={`${e.title} · ${format(new Date(e.start_time), 'h:mma')}`}
                        >
                          {format(new Date(e.start_time), 'h:mma')} {e.title}
                        </div>
                      )
                    }
                    const b = item.data
                    return (
                      <div
                        key={`blk-${b.id}`}
                        className={cn(
                          'text-xs px-2 py-1 rounded-lg border font-medium truncate',
                          BLOCK_STATUS_COLOR[b.status] ?? BLOCK_STATUS_COLOR.planned
                        )}
                        title={`${b.tasks?.title ?? 'Study'} · ${format(new Date(b.start_time), 'h:mma')}`}
                      >
                        {format(new Date(b.start_time), 'h:mma')} {b.tasks?.title ?? 'Study'}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
