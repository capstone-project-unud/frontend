<script setup lang="ts">
withDefaults(defineProps<{ id: string; label: string; placeholder?: string; disabled?: boolean; busy?: boolean }>(), { placeholder: 'Kata kunci pencarian' })
const model = defineModel<string>({ required: true })
const emit = defineEmits<{ search: []; clear: [] }>()
function clear() {
  model.value = ''
  emit('clear')
}
</script>

<template>
  <div class="workspace-search">
    <svg class="workspace-search-icon" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
    <label class="visually-hidden" :for="id">{{ label }}</label>
    <input :id="id" v-model="model" type="search" :placeholder="placeholder" maxlength="150" autocomplete="off" :disabled="disabled || busy" @keydown.enter.prevent="emit('search')">
    <button v-if="model" type="button" class="workspace-search-clear" aria-label="Hapus teks pencarian" :disabled="disabled || busy" @click="clear">
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
    </button>
    <button type="button" class="workspace-search-submit" :disabled="disabled || busy" @click="emit('search')">{{ busy ? 'Mencari…' : 'Cari' }}</button>
  </div>
</template>
