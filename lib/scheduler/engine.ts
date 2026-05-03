import { DateTime, Interval } from 'luxon'
import type { Database } from '@/types/database'

type Event = Database['public']['Tables']['events']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
type StudyBlock = Database['public']['Tables']['study_blocks']['Row']
type Preferences = Database['public']['Tables']['preferences']['Row']

export interface TimeSlot {
  start: DateTime
  end: DateTime
  durationMinutes: number
}

export interface ScheduledBlock {
  task: Task
  start: DateTime
  end: DateTime
  intensityScore: number
}

/**
 * Finds all free time windows in the day not occupied by fixed events.
 */
export function findAvailableSlots(
  events: Event[],
  date: DateTime,
  preferences: Preferences
): TimeSlot[] {
  const dayStart = DateTime.fromFormat(
    preferences.preferred_study_hours_start,
    'HH:mm',
    { zone: date.zoneName ?? 'local' }
  ).set({ year: date.year, month: date.month, day: date.day })

  const dayEnd = DateTime.fromFormat(
    preferences.preferred_study_hours_end,
    'HH:mm',
    { zone: date.zoneName ?? 'local' }
  ).set({ year: date.year, month: date.month, day: date.day })

  // Sort events by start time
  const dayEvents = events
    .filter((e) => {
      const start = DateTime.fromISO(e.start_time)
      return start.hasSame(date, 'day')
    })
    .sort(
      (a, b) =>
        DateTime.fromISO(a.start_time).toMillis() -
        DateTime.fromISO(b.start_time).toMillis()
    )

  const slots: TimeSlot[] = []
  let cursor = dayStart

  for (const event of dayEvents) {
    const eventStart = DateTime.fromISO(event.start_time)
    const eventEnd = DateTime.fromISO(event.end_time)

    if (cursor < eventStart) {
      const gap = Interval.fromDateTimes(cursor, eventStart)
      const minutes = gap.length('minutes')
      if (minutes >= 30) {
        slots.push({ start: cursor, end: eventStart, durationMinutes: minutes })
      }
    }

    if (eventEnd > cursor) cursor = eventEnd
  }

  // Check remaining time after last event
  if (cursor < dayEnd) {
    const gap = Interval.fromDateTimes(cursor, dayEnd)
    const minutes = gap.length('minutes')
    if (minutes >= 30) {
      slots.push({ start: cursor, end: dayEnd, durationMinutes: minutes })
    }
  }

  return slots
}

/**
 * Assigns tasks to available time slots using the Gap-Fill + priority algorithm.
 * Respects max continuous study time and break intervals from preferences.
 */
export function assignTasksToSlots(
  tasks: Task[],
  slots: TimeSlot[],
  preferences: Preferences
): ScheduledBlock[] {
  const BUFFER_MINUTES = 15
  const maxContinuous = preferences.max_continuous_study_minutes
  const breakInterval = preferences.break_interval_minutes

  // Sort tasks: higher priority (5) first, then earliest deadline
  const sortedTasks = [...tasks]
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => {
      if (b.priority_level !== a.priority_level)
        return b.priority_level - a.priority_level
      return (
        DateTime.fromISO(a.deadline).toMillis() -
        DateTime.fromISO(b.deadline).toMillis()
      )
    })

  const blocks: ScheduledBlock[] = []
  const remainingByTask = new Map(
    sortedTasks.map((t) => [t.id, t.estimated_hours * 60])
  )

  for (const slot of slots) {
    let slotCursor = slot.start
    let continuousMinutes = 0

    for (const task of sortedTasks) {
      const remaining = remainingByTask.get(task.id) ?? 0
      if (remaining <= 0) continue

      const slotLeft = Interval.fromDateTimes(slotCursor, slot.end).length('minutes')
      if (slotLeft < 30) break

      // Enforce continuous study cap — insert break
      if (continuousMinutes >= maxContinuous) {
        slotCursor = slotCursor.plus({ minutes: breakInterval })
        continuousMinutes = 0
      }

      const sessionMinutes = Math.min(remaining, maxContinuous - continuousMinutes, slotLeft - BUFFER_MINUTES)
      if (sessionMinutes < 25) break

      const blockEnd = slotCursor.plus({ minutes: sessionMinutes })
      const intensityScore = calculateIntensity(task, slotCursor)

      blocks.push({
        task,
        start: slotCursor,
        end: blockEnd,
        intensityScore,
      })

      remainingByTask.set(task.id, remaining - sessionMinutes)
      slotCursor = blockEnd.plus({ minutes: BUFFER_MINUTES })
      continuousMinutes += sessionMinutes
    }
  }

  return blocks
}

/**
 * Calculates an intensity score for a study block based on task priority
 * and time-of-day energy heuristics.
 */
function calculateIntensity(task: Task, time: DateTime): number {
  const hour = time.hour
  // Energy peaks: 9–11 AM and 3–5 PM
  const energyScore =
    (hour >= 9 && hour <= 11) || (hour >= 15 && hour <= 17) ? 1.2 : 1.0
  return Math.round((task.priority_level / 5) * energyScore * 100)
}

/**
 * Converts scheduler output into Supabase-ready StudyBlock inserts.
 */
export function blocksToInserts(
  blocks: ScheduledBlock[],
  userId: string
): Database['public']['Tables']['study_blocks']['Insert'][] {
  return blocks.map((b) => ({
    user_id: userId,
    task_id: b.task.id,
    start_time: b.start.toISO()!,
    end_time: b.end.toISO()!,
    status: 'planned',
    intensity_score: b.intensityScore,
    notes: null,
  }))
}
