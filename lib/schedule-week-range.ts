import { startOfWeek } from 'date-fns'

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Week grid is Monday–Sunday. `week` query param is yyyy-MM-dd for that Monday (from the client).
 * Range is [Monday 00:00 UTC, following Monday 00:00 UTC) for the given civil date, plus ±1 day
 * padding so timezones near boundaries still return rows (columns still use isSameDay in the UI).
 */
export function getMondayWeekRange(weekParam: string | undefined): {
  rangeStart: Date
  rangeEndExclusive: Date
  /** yyyy-MM-dd (Monday civil date, echoed for the grid) */
  weekMonday: string
  /** Padded bounds for Supabase overlap query */
  queryRangeStart: Date
  queryRangeEndExclusive: Date
} {
  let y: number
  let mo: number
  let d: number

  if (weekParam && /^\d{4}-\d{2}-\d{2}$/.test(weekParam)) {
    const parts = weekParam.split('-').map(Number)
    y = parts[0]
    mo = parts[1]
    d = parts[2]
  } else {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 })
    y = monday.getFullYear()
    mo = monday.getMonth() + 1
    d = monday.getDate()
  }

  const weekMonday = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const rangeStart = new Date(Date.UTC(y, mo - 1, d, 0, 0, 0, 0))
  const rangeEndExclusive = new Date(rangeStart.getTime() + 7 * DAY_MS)

  return {
    rangeStart,
    rangeEndExclusive,
    weekMonday,
    queryRangeStart: new Date(rangeStart.getTime() - DAY_MS),
    queryRangeEndExclusive: new Date(rangeEndExclusive.getTime() + DAY_MS),
  }
}
