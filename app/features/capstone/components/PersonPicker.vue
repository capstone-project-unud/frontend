<script setup lang="ts">
import WorkspaceSelect from '~/components/workspace/WorkspaceSelect.vue'

import WorkspaceSearch from '~/components/workspace/WorkspaceSearch.vue'
import type { DirectoryUser } from '../types'
import { capstoneAPI } from '../composables/useCapstone'
import { apiMessage } from '~/utils/format'
const props = defineProps<{ role: 'MAHASISWA' | 'DOSEN'; label: string; disabled?: boolean; currentName?: string }>()
const model = defineModel<string | null>({ default: null })
const q = shallowRef('')
const users = shallowRef<DirectoryUser[]>([])
const busy = shallowRef(false)
const error = shallowRef('')
const id = useId()
let request = 0
async function search() {
 const number = ++request; busy.value = true; error.value = ''
 try { const data = await $fetch<{ items: DirectoryUser[] }>(capstoneAPI + '/directory', { query: { role: props.role, q: q.value } }); if (number === request) users.value = data.items }
 catch (e) { if (number === request) error.value = apiMessage(e) }
 finally { if (number === request) busy.value = false }
}
onMounted(search)
const missingSelection = computed(() => model.value && !users.value.some(u => u.id === model.value))
const options = computed(() => [
 { value: null, label: 'Belum dipilih' },
 ...(missingSelection.value ? [{ value: model.value, label: props.currentName || 'Pilihan tersimpan' }] : []),
 ...users.value.map(u => ({ value: u.id, label: u.full_name + (u.nim ? ' · ' + u.nim : '') })),
])
</script>
<template>
 <div class="field person-picker">
  <label :for="id">{{ label }}</label>
  <WorkspaceSearch :id="id + '-search'" v-model="q" :label="'Cari ' + label.toLowerCase()" :placeholder="role === 'MAHASISWA' ? 'Cari nama atau NIM…' : 'Cari nama dosen…'" :disabled="disabled" :busy="busy" @search="search" @clear="search" />
  <WorkspaceSelect :id="id" v-model="model" :label="label" :options="options" :disabled="disabled || busy" />
  <small v-if="!busy && !users.length">Tidak ada hasil. Coba kata kunci lain.</small><p v-if="error" class="notice error" role="alert">{{ error }}</p>
 </div>
</template>
<style scoped>.person-picker .workspace-search { max-width: none; width: 100%; }</style>
