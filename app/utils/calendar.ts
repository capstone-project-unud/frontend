export function parseCalendarDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3])
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return null
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(0, 0, 0, 0)
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null
}

export function calendarISO(date: Date): string {
  return `${String(date.getUTCFullYear()).padStart(4, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

export function moveCalendarDate(value: string, days: number): string {
  const date = parseCalendarDate(value)
  if (!date) return ''
  date.setUTCDate(date.getUTCDate() + days)
  return calendarISO(date)
}

export function moveCalendarMonth(value: string, months: number): string {
  const date = parseCalendarDate(value)
  if (!date) return ''
  const day = date.getUTCDate()
  date.setUTCDate(1)
  date.setUTCMonth(date.getUTCMonth() + months)
  const last = new Date(date)
  last.setUTCMonth(last.getUTCMonth() + 1, 0)
  date.setUTCDate(Math.min(day, last.getUTCDate()))
  return calendarISO(date)
}

export function calendarWeeks(year: number, month: number): string[][] {
  const first = parseCalendarDate(`${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-01`)
  if (!first) return []
  const offset = (first.getUTCDay() + 6) % 7
  first.setUTCDate(first.getUTCDate() - offset)
  const days = Array.from({ length: 42 }, (_, index) => moveCalendarDate(calendarISO(first), index))
  return Array.from({ length: 6 }, (_, week) => days.slice(week * 7, week * 7 + 7))
}

export function calendarToday(): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Makassar', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date())
  const part = (type: string) => parts.find(item => item.type === type)?.value || ''
  return `${part('year')}-${part('month')}-${part('day')}`
}
