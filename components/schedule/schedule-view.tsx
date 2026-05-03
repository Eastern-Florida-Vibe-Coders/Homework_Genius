'use client'

import { useEffect, useLayoutEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  format,
  startOfWeek,
  addDays,
  isToday,
  startOfDay,
  endOfDay,
} from 'date-fns'
import { ChevronLeft, ChevronRight, RefreshCw, X } from 'lucide-react'
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

/** Item overlaps this calendar day (handles overnight events). */
function overlapsCalendarDay(day: Date, rangeStartIso: string, rangeEndIso: string): boolean {
  const rs = new Date(rangeStartIso).getTime()
  const re = new Date(rangeEndIso).getTime()
  const ds = startOfDay(day).getTime()
  const de = endOfDay(day).getTime()
  return rs < de && re > ds
}

interface Props {
  studyBlocks: StudyBlock[]
  events: Event[]
  /** yyyy-MM-dd (Monday of the week the server fetched) */
  weekMonday: string
}

export function ScheduleView({ studyBlocks, events, weekMonday }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [regenerating, setRegenerating] = useState(false)
  const [detailDay, setDetailDay] = useState<Date | null>(null)

  // Align URL with the user's local Monday so the server fetches the same calendar week as the grid
  const weekFromUrl = searchParams.get('week')
  useLayoutEffect(() => {
    if (weekFromUrl) return
    const localMonday = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    router.replace(`/schedule?week=${localMonday}`, { scroll: false })
  }, [weekFromUrl, router])

  const [wy, wm, wd] = weekMonday.split('-').map(Number)
  const baseDate = new Date(wy, wm - 1, wd)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(baseDate, i))

  const goToWeek = (mondayYmd: string) => {
    router.push(`/schedule?week=${mondayYmd}`)
  }

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
      if (!res.ok) throw new Error(data.error)
      if (data.reason === 'no_tasks') {
        toast.info(
          'Add at least one open task (with study time left) before generating study blocks.'
        )
      } else {
        toast.success(
          'Study plan updated for today and upcoming days. Refresh if the grid looks stale.'
        )
      }
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
            type="button"
            onClick={() =>
              goToWeek(format(addDays(baseDate, -7), 'yyyy-MM-dd'))
            }
            className="p-2 rounded-full border border-[#e2e8f0] dark:border-[#334155] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              goToWeek(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'))
            }
            className="text-sm px-3 py-1.5 rounded-full border border-[#e2e8f0] dark:border-[#334155] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() =>
              goToWeek(format(addDays(baseDate, 7), 'yyyy-MM-dd'))
            }
            className="p-2 rounded-full border border-[#e2e8f0] dark:border-[#334155] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">
        Tap a day to see fixed commitments and study blocks in full.
      </p>

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
            overlapsCalendarDay(day, b.start_time, b.end_time)
          )
          const dayEvents = events.filter((e) =>
            overlapsCalendarDay(day, e.start_time, e.end_time)
          )
          const allItems = [
            ...dayEvents.map((e) => ({ type: 'event' as const, data: e, start: new Date(e.start_time) })),
            ...dayBlocks.map((b) => ({ type: 'block' as const, data: b, start: new Date(b.start_time) })),
          ].sort((a, b) => a.start.getTime() - b.start.getTime())

          return (
            <button
              type="button"
              key={day.toISOString()}
              onClick={() => setDetailDay(day)}
              className={cn(
                'text-left bg-white dark:bg-[#1e293b] rounded-xl border p-3 min-h-32 w-full transition-colors',
                'hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-[#fafafa] dark:hover:bg-[#252f42]',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
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
                        title={
                          b.tasks?.title
                            ? `${b.tasks.title} · ${format(new Date(b.start_time), 'h:mma')}`
                            : format(new Date(b.start_time), 'h:mma')
                        }
                      >
                        {format(new Date(b.start_time), 'h:mma')}
                        {b.tasks?.title ? ` ${b.tasks.title}` : ''}
                      </div>
                    )
                  })}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {detailDay && (
        <DayDetailModal
          day={detailDay}
          studyBlocks={studyBlocks.filter((b) =>
            overlapsCalendarDay(detailDay, b.start_time, b.end_time)
          )}
          events={events.filter((e) =>
            overlapsCalendarDay(detailDay, e.start_time, e.end_time)
          )}
          onClose={() => setDetailDay(null)}
        />
      )}
    </div>
  )
}

function DayDetailModal({
  day,
  studyBlocks,
  events,
  onClose,
}: {
  day: Date
  studyBlocks: StudyBlock[]
  events: Event[]
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const items = [
    ...events.map((e) => ({
      kind: 'event' as const,
      title: e.title,
      sub: e.event_type.replace('_', ' '),
      start: new Date(e.start_time),
      end: new Date(e.end_time),
      color: EVENT_TYPE_COLOR[e.event_type] ?? EVENT_TYPE_COLOR.other,
    })),
    ...studyBlocks.map((b) => ({
      kind: 'block' as const,
      title: b.tasks?.title ?? 'Study block',
      sub: b.tasks?.subject ? `${b.tasks.subject} · ${b.status}` : b.status,
      start: new Date(b.start_time),
      end: new Date(b.end_time),
      color: BLOCK_STATUS_COLOR[b.status] ?? BLOCK_STATUS_COLOR.planned,
    })),
  ].sort((a, b) => a.start.getTime() - b.start.getTime())

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-detail-title"
        className="bg-white dark:bg-[#1e293b] rounded-2xl border border-[#e2e8f0] dark:border-[#334155] shadow-xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-4 border-b border-[#e2e8f0] dark:border-[#334155] shrink-0">
          <div>
            <h2 id="day-detail-title" className="text-lg font-bold text-[#1e293b] dark:text-[#f1f5f9]">
              {format(day, 'EEEE, MMMM d')}
            </h2>
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-0.5">
              {items.length === 0 ? 'Nothing on this day' : `${items.length} scheduled`}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-[#64748b]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-[#64748b] dark:text-[#94a3b8] text-center py-8">
              No classes, commitments, or study blocks. Tap Regenerate after adding tasks.
            </p>
          ) : (
            items.map((item, i) => (
              <div
                key={`${item.kind}-${item.start.toISOString()}-${i}`}
                className={cn(
                  'rounded-xl border px-4 py-3 text-sm',
                  item.color
                )}
              >
                <div className="font-semibold">{item.title}</div>
                <div className="text-xs opacity-90 mt-0.5 capitalize">{item.sub}</div>
                <div className="text-xs font-mono mt-2 text-[#475569] dark:text-[#cbd5e1]">
                  {format(item.start, 'h:mm a')} – {format(item.end, 'h:mm a')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
