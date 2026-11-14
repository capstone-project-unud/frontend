import assert from 'node:assert/strict'
import test from 'node:test'
import { calendarISO, calendarWeeks, moveCalendarDate, moveCalendarMonth, parseCalendarDate } from '../app/utils/calendar.ts'

test('menolak tanggal yang dinormalisasi Date dan menerima tahun kabisat', () => {
  for (const value of ['2025-02-29', '2026-04-31', '2026-00-10', '2026-13-10', '2026-1-01', '0000-01-01']) assert.equal(parseCalendarDate(value), null)
  for (const value of ['2024-02-29', '2000-02-29', '0099-01-01']) assert.equal(calendarISO(parseCalendarDate(value)!), value)
  assert.equal(parseCalendarDate('1900-02-29'), null)
})
test('pergantian bulan menjepit hari akhir bulan dan melewati batas tahun', () => {
  assert.equal(moveCalendarMonth('2024-01-31', 1), '2024-02-29')
  assert.equal(moveCalendarMonth('2025-01-31', 1), '2025-02-28')
  assert.equal(moveCalendarMonth('2024-02-29', 12), '2025-02-28')
  assert.equal(moveCalendarMonth('2026-01-31', -1), '2025-12-31')
})
test('grid dimulai Senin dan tetap memiliki 42 hari berurutan', () => {
  const weeks = calendarWeeks(2026, 1)
  assert.equal(weeks.length, 6)
  assert.equal(weeks[0]?.[0], '2025-12-29')
  assert.equal(weeks[5]?.[6], '2026-02-08')
  const days = weeks.flat()
  for (let index = 1; index < days.length; index++) assert.equal(days[index], moveCalendarDate(days[index - 1]!, 1))
})
test('pergeseran tanggal memakai UTC sehingga konsisten melewati DST dan tahun', () => {
  assert.equal(moveCalendarDate('2026-03-08', 1), '2026-03-09')
  assert.equal(moveCalendarDate('2025-12-31', 1), '2026-01-01')
  assert.equal(moveCalendarDate('2026-01-01', -1), '2025-12-31')
})
