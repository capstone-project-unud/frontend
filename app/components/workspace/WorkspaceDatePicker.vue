<script setup lang="ts">
import WorkspaceSelect from './WorkspaceSelect.vue'
import { useWorkspacePopover } from '~/composables/useWorkspacePopover'
import { calendarToday, calendarWeeks, moveCalendarDate, moveCalendarMonth, parseCalendarDate } from '~/utils/calendar'
const props = defineProps<{ id: string; label: string; required?: boolean; disabled?: boolean; min?: string; max?: string }>()
const model = defineModel<string>({ required: true })
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const panel = useTemplateRef<HTMLDivElement>('panel')
const { open, placement, show, close, sync } = useWorkspacePopover(trigger, panel, 340, 480)
const today = calendarToday()
const focused = shallowRef(parseCalendarDate(model.value) ? model.value : today)
const year = shallowRef(Number(focused.value.slice(0, 4)))
const month = shallowRef(Number(focused.value.slice(5, 7)))
const invalid = shallowRef(false)
const longDate = new Intl.DateTimeFormat('id-ID', { timeZone: 'UTC', dateStyle: 'full' })
const shortDate = new Intl.DateTimeFormat('id-ID', { timeZone: 'UTC', dateStyle: 'long' })
const months = Array.from({ length: 12 }, (_, index) => ({ value: index + 1, label: new Intl.DateTimeFormat('id-ID', { timeZone: 'UTC', month: 'long' }).format(new Date(Date.UTC(2024, index, 1))) }))
const years = computed(() => {
  const lower = props.min ? Number(props.min.slice(0, 4)) : 1900
  const upper = props.max ? Number(props.max.slice(0, 4)) : Math.max(2100, year.value)
  return Array.from({ length: Math.max(0, upper - lower + 1) }, (_, index) => ({ value: lower + index, label: String(lower + index) }))
})
const weeks = computed(() => calendarWeeks(year.value, month.value))
const monthOptions = computed(() => months.map(option => ({ ...option, disabled: !!(props.min && year.value === Number(props.min.slice(0, 4)) && option.value < Number(props.min.slice(5, 7))) || !!(props.max && year.value === Number(props.max.slice(0, 4)) && option.value > Number(props.max.slice(5, 7))) })))
const display = computed(() => { const date = parseCalendarDate(model.value); return date ? shortDate.format(date) : 'Pilih tanggal' })
const validValue = computed(() => parseCalendarDate(model.value) && allowed(model.value) ? model.value : '')
function allowed(date: string) { return (!props.min || date >= props.min) && (!props.max || date <= props.max) }
function focusDay(date: string) {
  if (!parseCalendarDate(date) || !allowed(date)) return
  focused.value = date
  year.value = Number(date.slice(0, 4)); month.value = Number(date.slice(5, 7))
  nextTick(() => panel.value?.querySelector<HTMLButtonElement>(`[data-date="${date}"]`)?.focus())
}
async function reveal() {
  const date = parseCalendarDate(model.value) ? model.value : today
  const bounded = props.min && date < props.min ? props.min : props.max && date > props.max ? props.max : date
  if (await show()) focusDay(bounded)
}
function select(date: string) {
  if (!allowed(date)) return
  model.value = date; invalid.value = false
  close(true)
}
function changeMonth(step: number) {
  const current = `${year.value}-${String(month.value).padStart(2, '0')}-01`
  const next = moveCalendarMonth(current, step)
  year.value = Number(next.slice(0, 4)); month.value = Number(next.slice(5, 7))
}
function keydown(event: KeyboardEvent, date: string) {
  const shifts: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
  let next = ''
  if (event.key in shifts) next = moveCalendarDate(date, shifts[event.key]!)
  else if (event.key === 'PageUp' || event.key === 'PageDown') next = moveCalendarMonth(date, (event.key === 'PageUp' ? -1 : 1) * (event.shiftKey ? 12 : 1))
  else if (event.key === 'Home' || event.key === 'End') {
    const weekday = (parseCalendarDate(date)!.getUTCDay() + 6) % 7
    next = moveCalendarDate(date, event.key === 'Home' ? -weekday : 6 - weekday)
  }
  if (next) { event.preventDefault(); focusDay(next) }
}
function escape(event: KeyboardEvent) {
  if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true) }
}
watch(model, () => { invalid.value = false })
watch(() => props.disabled, disabled => { if (disabled) close() })
watch([year, month], () => {
  if (props.min && year.value === Number(props.min.slice(0, 4)) && month.value < Number(props.min.slice(5, 7))) month.value = Number(props.min.slice(5, 7))
  if (props.max && year.value === Number(props.max.slice(0, 4)) && month.value > Number(props.max.slice(5, 7))) month.value = Number(props.max.slice(5, 7))
  if (Number(focused.value.slice(0, 4)) !== year.value || Number(focused.value.slice(5, 7)) !== month.value) focused.value = `${year.value}-${String(month.value).padStart(2, '0')}-01`
})
</script>

<template>
  <div class="workspace-date-picker">
    <button :id="id" ref="trigger" type="button" class="workspace-select-trigger" :disabled="disabled" :aria-label="label + ': ' + display" :aria-expanded="open" :aria-controls="id + '-calendar'" aria-haspopup="dialog" :aria-invalid="invalid || undefined" :aria-describedby="invalid ? id + '-error' : undefined" @click="open ? close() : reveal()" @keydown.down.prevent="reveal">
      <span>{{ display }}</span><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></svg>
    </button>
    <input class="visually-hidden" type="text" :value="validValue" :required="required" :disabled="disabled" tabindex="-1" aria-hidden="true" @invalid.prevent="invalid = true; trigger?.focus()">
    <div :id="id + '-calendar'" ref="panel" popover="auto" class="workspace-popover workspace-calendar" :style="placement" role="dialog" :aria-label="'Pilih ' + label.toLowerCase()" @toggle="sync" @keydown="escape">
      <div class="workspace-calendar-heading">
        <button type="button" class="workspace-calendar-nav" aria-label="Bulan sebelumnya" :disabled="!!min && year <= Number(min.slice(0, 4)) && month <= Number(min.slice(5, 7))" @click="changeMonth(-1)"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6" /></svg></button>
        <WorkspaceSelect :id="id + '-month'" v-model="month" label="Bulan" :options="monthOptions" />
        <WorkspaceSelect :id="id + '-year'" v-model="year" label="Tahun" :options="years" />
        <button type="button" class="workspace-calendar-nav" aria-label="Bulan berikutnya" :disabled="!!max && year >= Number(max.slice(0, 4)) && month >= Number(max.slice(5, 7))" @click="changeMonth(1)"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6" /></svg></button>
      </div>
      <div class="workspace-calendar-grid" role="grid" :aria-label="months[month - 1]?.label + ' ' + year">
        <div class="workspace-calendar-week" role="row"><span v-for="day in ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']" :key="day" role="columnheader">{{ day }}</span></div>
        <div v-for="(week, index) in weeks" :key="index" class="workspace-calendar-week" role="row">
          <div v-for="date in week" :key="date" role="gridcell" :aria-selected="date === model"><button type="button" class="workspace-calendar-day" :class="{ 'is-selected': date === model, 'is-today': date === today, 'is-outside': Number(date.slice(5, 7)) !== month }" :data-date="date" :aria-label="longDate.format(parseCalendarDate(date)!)" :aria-current="date === today ? 'date' : undefined" :disabled="!allowed(date)" :tabindex="date === focused ? 0 : -1" @focus="focused = date" @click="select(date)" @keydown="keydown($event, date)">{{ Number(date.slice(8, 10)) }}</button></div>
        </div>
      </div>
      <div class="workspace-calendar-footer"><button type="button" class="workspace-text-action" :disabled="!allowed(today)" @click="select(today)">Hari ini</button><button v-if="!required" type="button" class="workspace-text-action secondary" @click="model = ''; close(true)">Kosongkan</button><button type="button" class="workspace-text-action secondary" @click="close(true)">Tutup</button></div>
    </div>
    <p v-if="invalid" :id="id + '-error'" class="workspace-control-error" role="alert">Pilih {{ label.toLowerCase() }} yang valid.</p>
  </div>
</template>
