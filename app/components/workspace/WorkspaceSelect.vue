<script setup lang="ts" generic="T extends string | number | null">
import { useWorkspacePopover } from '~/composables/useWorkspacePopover'
const props = withDefaults(defineProps<{
  id: string
  label: string
  options: readonly { value: T; label: string; disabled?: boolean }[]
  disabled?: boolean
  required?: boolean
  placeholder?: string
}>(), { placeholder: 'Pilih salah satu' })
const model = defineModel<T>({ required: true })
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const panel = useTemplateRef<HTMLDivElement>('panel')
const { open, placement, show, close, sync } = useWorkspacePopover(trigger, panel)
const active = shallowRef(-1)
const invalid = shallowRef(false)
const chosen = computed(() => props.options.find(option => option.value === model.value))
const enabled = computed(() => props.options.flatMap((option, index) => option.disabled ? [] : [index]))
let prefix = ''
let typedAt = 0

watch(model, () => { invalid.value = false })
watch(() => props.disabled, disabled => { if (disabled) close() })
watch(() => props.options, () => {
  if (!props.options[active.value] || props.options[active.value]?.disabled) active.value = enabled.value[0] ?? -1
})

async function reveal(last = false) {
  const selected = props.options.findIndex(option => option.value === model.value && !option.disabled)
  active.value = selected >= 0 ? selected : (last ? enabled.value.at(-1) : enabled.value[0]) ?? -1
  if (await show()) { panel.value?.focus(); scrollActive() }
}
function scrollActive() {
  nextTick(() => panel.value?.querySelector(`[data-option="${active.value}"]`)?.scrollIntoView({ block: 'nearest' }))
}
function move(step: number) {
  const index = enabled.value.indexOf(active.value)
  active.value = enabled.value[(index + step + enabled.value.length) % enabled.value.length] ?? -1
  scrollActive()
}
function choose(index: number) {
  const option = props.options[index]
  if (!option || option.disabled) return
  model.value = option.value
  invalid.value = false
  close(true)
}
async function keydown(event: KeyboardEvent) {
  if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) {
    event.preventDefault()
    if (!open.value) { void reveal(event.key === 'ArrowUp' || event.key === 'End'); return }
    if (event.key === 'ArrowDown') move(1)
    else if (event.key === 'ArrowUp') move(-1)
    else if (event.key === 'Home' || event.key === 'End') { active.value = (event.key === 'Home' ? enabled.value[0] : enabled.value.at(-1)) ?? -1; scrollActive() }
    else choose(active.value)
  } else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true) }
  else if (event.key === 'Tab') close(true)
  else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    const now = Date.now()
    prefix = now - typedAt < 700 ? prefix + event.key : event.key
    typedAt = now
    event.preventDefault()
    if (!open.value) await reveal()
    const index = props.options.findIndex(option => !option.disabled && option.label.toLocaleLowerCase('id').startsWith(prefix.toLocaleLowerCase('id')))
    if (index >= 0) { active.value = index; scrollActive() }
  }
}
function validate() { invalid.value = true; trigger.value?.focus() }
</script>

<template>
  <div class="workspace-select">
    <button :id="id" ref="trigger" type="button" class="workspace-select-trigger" :class="{ 'is-open': open, 'is-placeholder': !chosen }" role="combobox" :disabled="disabled" :aria-label="label + ': ' + (chosen?.label || placeholder)" :aria-expanded="open" :aria-controls="id + '-options'" aria-haspopup="listbox" :aria-required="required || undefined" :aria-invalid="invalid || undefined" :aria-describedby="invalid ? id + '-error' : undefined" @click="open ? close() : reveal()" @keydown="keydown">
      <span>{{ chosen?.label || placeholder }}</span>
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
    </button>
    <input v-if="required" class="visually-hidden" type="text" :value="model == null ? '' : String(model)" required :disabled="disabled" tabindex="-1" aria-hidden="true" @invalid.prevent="validate">
    <div :id="id + '-options'" ref="panel" popover="auto" class="workspace-popover workspace-select-menu" :style="placement" role="listbox" :aria-label="label" :aria-activedescendant="active >= 0 ? id + '-option-' + active : undefined" tabindex="-1" @toggle="sync" @keydown="keydown">
      <div v-for="(option, index) in options" :id="id + '-option-' + index" :key="String(option.value)" :data-option="index" class="workspace-select-option" :class="{ 'is-active': index === active, 'is-selected': option.value === model, 'is-disabled': option.disabled }" role="option" :aria-selected="option.value === model" :aria-disabled="option.disabled || undefined" @pointermove="!option.disabled && (active = index)" @mousedown.prevent @click="choose(index)">
        <span>{{ option.label }}</span><svg v-if="option.value === model" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      </div>
      <p v-if="!options.length" class="workspace-select-empty">Belum ada pilihan tersedia.</p>
    </div>
    <p v-if="invalid" :id="id + '-error'" class="workspace-control-error" role="alert">Pilih {{ label.toLowerCase() }} terlebih dahulu.</p>
  </div>
</template>
