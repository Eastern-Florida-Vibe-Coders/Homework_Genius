import { DateTime, Interval } from 'luxon'
import type { Database } from '@/types/database'

type Event = Database['public']['Tables']['events']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
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

/** How many days ahead to place study blocks when generating a schedule */
export const SCHEDULE_HORIZON_DAYS = 21

/**
 * Finds free time inside the preferred study window, not blocked by events.
 * Events are clipped to the calendar day so multi-day commitments behave correctly.
 */
export function findAvailableSlots(
  events: Event[],
  date: DateTime,
  preferences: Preferences
): TimeSlot[] {
  const zone = date.zoneName ?? 'local'

  const studyStart = DateTime.fromFormat(
    preferences.preferred_study_hours_start,
    'HH:mm',
    { zone }
  ).set({ year: date.year, month: date.month, day: date.day })

  const studyEnd = DateTime.fromFormat(
    preferences.preferred_study_hours_end,
    'HH:mm',
    { zone }
  ).set({ year: date.year, month: date.month, day: date.day })

  const calStart = date.startOf('day')
  const calEnd = date.endOf('day')

  const clipped = events
    .map((e) => {
      const es = DateTime.fromISO(e.start_time)
      const ee = DateTime.fromISO(e.end_time)
      const clipStart = es > calStart ? es : calStart
      const clipEnd = ee < calEnd ? ee : calEnd
      if (clipStart >= clipEnd) return null
      return { clipStart, clipEnd }
    })
    .filter((x): x is { clipStart: DateTime; clipEnd: DateTime } => x !== null)
    .sort(
      (a, b) => a.clipStart.toMillis() - b.clipStart.toMillis()
    )

  const slots: TimeSlot[] = []
  let cursor = studyStart

  for (const { clipStart, clipEnd } of clipped) {
    if (cursor < clipStart) {
      const gap = Interval.fromDateTimes(cursor, clipStart)
      const minutes = gap.length('minutes')
      if (minutes >= 30) {
        slots.push({ start: cursor, end: clipStart, durationMinutes: minutes })
      }
    }
    if (clipEnd > cursor) cursor = clipEnd
  }

  if (cursor < studyEnd) {
    const gap = Interval.fromDateTimes(cursor, studyEnd)
    const minutes = gap.length('minutes')
    if (minutes >= 30) {
      slots.push({ start: cursor, end: studyEnd, durationMinutes: minutes })
    }
  }

  return slots
}

/**
 * Assigns tasks to slots. If `sharedRemainingMinutes` is passed, it is mutated across days
 * so leftover time rolls to later dates.
 */
export function assignTasksToSlots(
  tasks: Task[],
  slots: TimeSlot[],
  preferences: Preferences,
  sharedRemainingMinutes?: Map<string, number>
): ScheduledBlock[] {
  if (tasks.length === 0) {
    return []
  }

  const BUFFER_MINUTES = 15
  const maxContinuous = preferences.max_continuous_study_minutes
  const breakInterval = preferences.break_interval_minutes

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

  if (sortedTasks.length === 0) {
    return []
  }

  const remaining =
    sharedRemainingMinutes ??
    new Map(sortedTasks.map((t) => [t.id, t.estimated_hours * 60]))

  const blocks: ScheduledBlock[] = []

  for (const slot of slots) {
    let slotCursor = slot.start
    let continuousMinutes = 0

    // Repeat passes over tasks by priority until nothing fits in the remainder of this slot.
    // (Single pass missed scheduling the rest of the same task in one large gap.)
    while (true) {
      const slotLeftNow = Interval.fromDateTimes(slotCursor, slot.end).length('minutes')
      if (slotLeftNow < 25) break

      let placed = false

      for (const task of sortedTasks) {
        const rem = remaining.get(task.id) ?? 0
        if (rem <= 0) continue

        const deadline = DateTime.fromISO(task.deadline)
        if (slotCursor >= deadline) continue

        const roomUntilDeadline = deadline.diff(slotCursor, 'minutes').minutes
        if (roomUntilDeadline < 25) continue

        if (continuousMinutes >= maxContinuous) {
          slotCursor = slotCursor.plus({ minutes: breakInterval })
          continuousMinutes = 0
        }

        const slotLeft = Interval.fromDateTimes(slotCursor, slot.end).length('minutes')
        if (slotLeft < 30) break

        const sessionMinutes = Math.min(
          rem,
          maxContinuous - continuousMinutes,
          slotLeft - BUFFER_MINUTES,
          roomUntilDeadline
        )
        if (sessionMinutes < 25) continue

        const blockEnd = slotCursor.plus({ minutes: sessionMinutes })
        const intensityScore = calculateIntensity(task, slotCursor)

        blocks.push({
          task,
          start: slotCursor,
          end: blockEnd,
          intensityScore,
        })

        remaining.set(task.id, rem - sessionMinutes)
        slotCursor = blockEnd.plus({ minutes: BUFFER_MINUTES })
        continuousMinutes += sessionMinutes
        placed = true
        break
      }

      if (!placed) break
    }
  }

  return blocks
}

/**
 * Fill available study time day by day until each task's estimated minutes are placed or the horizon ends.
 */
export function scheduleAcrossDays(
  allEvents: Event[],
  tasks: Task[],
  preferences: Preferences,
  startDate: DateTime,
  horizonDays: number = SCHEDULE_HORIZON_DAYS
): ScheduledBlock[] {
  const schedulable = tasks.filter(
    (t) => t.status !== 'completed' && Number(t.estimated_hours) > 0
  )
  if (schedulable.length === 0) {
    return []
  }

  const sortedTasks = [...schedulable].sort((a, b) => {
    if (b.priority_level !== a.priority_level)
      return b.priority_level - a.priority_level
    return (
      DateTime.fromISO(a.deadline).toMillis() -
      DateTime.fromISO(b.deadline).toMillis()
    )
  })

  const remainingByTask = new Map(
    sortedTasks.map((t) => [t.id, t.estimated_hours * 60])
  )

  const allBlocks: ScheduledBlock[] = []

  for (let i = 0; i < horizonDays; i++) {
    const done = sortedTasks.every((t) => (remainingByTask.get(t.id) ?? 0) <= 0)
    if (done) break

    const date = startDate.plus({ days: i })
    const slots = findAvailableSlots(allEvents, date, preferences)
    const dayBlocks = assignTasksToSlots(
      sortedTasks,
      slots,
      preferences,
      remainingByTask
    )
    allBlocks.push(...dayBlocks)
  }

  return allBlocks
}

function calculateIntensity(task: Task, time: DateTime): number {
  const hour = time.hour
  const energyScore =
    (hour >= 9 && hour <= 11) || (hour >= 15 && hour <= 17) ? 1.2 : 1.0
  return Math.round((task.priority_level / 5) * energyScore * 100)
}

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
