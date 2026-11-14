<script setup lang="ts">
const props = withDefaults(defineProps<{ id: string; accept: string; fileName?: string; disabled?: boolean; busy?: boolean; maxBytes?: number }>(), { fileName: '' })
const emit = defineEmits<{ select: [file: File] }>()
const input = useTemplateRef<HTMLInputElement>('input')
const button = useTemplateRef<HTMLButtonElement>('button')
const dragging = shallowRef(false)
const error = shallowRef('')
function enabled() { return !props.disabled && !props.busy && !button.value?.matches(':disabled') }
function receive(file?: File) {
  dragging.value = false
  if (!file || !enabled()) return
  error.value = ''
  const accepted = props.accept.split(',').map(type => type.trim().toLowerCase()).filter(Boolean)
  if (!accepted.some(type => type.startsWith('.') ? file.name.toLowerCase().endsWith(type) : type.endsWith('/*') ? file.type.startsWith(type.slice(0, -1)) : file.type === type)) {
    error.value = 'Format berkas tidak didukung. Gunakan ' + accepted.join(', ') + '.'
    return
  }
  if (props.maxBytes && file.size > props.maxBytes) { error.value = `Ukuran berkas maksimal ${Math.round(props.maxBytes / 1024 / 1024)} MB.`; return }
  emit('select', file)
}
function change(event: Event) {
  const target = event.target as HTMLInputElement
  receive(target.files?.[0]); target.value = ''
}
function leave(event: DragEvent) {
  if (event.currentTarget instanceof HTMLElement && event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return
  dragging.value = false
}
</script>

<template>
  <div class="workspace-file-control">
    <div class="workspace-file-picker" :class="{ 'is-dragging': dragging, 'is-disabled': disabled || busy }" @dragover.prevent="dragging = enabled()" @dragleave="leave" @drop.prevent="receive($event.dataTransfer?.files[0])">
      <input ref="input" type="file" :accept="accept" :disabled="disabled || busy" hidden @change="change">
      <button :id="id" ref="button" type="button" class="button secondary" :disabled="disabled || busy" :aria-describedby="id + '-file-hint'" @click="input?.click()">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
        {{ busy ? 'Mengunggah…' : fileName ? 'Ganti berkas' : 'Pilih berkas' }}
      </button>
      <div class="workspace-file-description"><span v-if="fileName" class="workspace-file-name">{{ fileName }}</span><span v-else class="muted">Pilih atau seret berkas ke sini.</span><small :id="id + '-file-hint'">{{ accept.split(',').map(type => type.trim().replace('.', '').toUpperCase()).join(', ') }}{{ maxBytes ? ' · Maksimal ' + Math.round(maxBytes / 1024 / 1024) + ' MB' : '' }}</small></div>
    </div>
    <p v-if="error" class="workspace-control-error" role="alert">{{ error }}</p>
  </div>
</template>
