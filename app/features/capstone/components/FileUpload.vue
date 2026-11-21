<script setup lang="ts">
import { capstoneAPI } from '../composables/useCapstone'
import { apiMessage } from '~/utils/format'
import WorkspaceFilePicker from '~/components/workspace/WorkspaceFilePicker.vue'
const props = withDefaults(defineProps<{ label: string; accept?: string; disabled?: boolean }>(), { accept: '.pdf' })
const model = defineModel<string | null>({ default: null })
const emit = defineEmits<{ uploading: [value: boolean] }>()
const busy = shallowRef(false)
const error = shallowRef('')
const name = shallowRef('')
const id = useId()
async function upload(file: File) {
 error.value = ''; if (file.size > 10 * 1024 * 1024) { error.value = 'Ukuran berkas maksimal 10 MB.'; return }
 busy.value = true; emit('uploading', true)
 try { const body = new FormData(); body.append('file', file); const data = await $fetch<{ file: { id: string; name: string } }>(capstoneAPI + '/files', { method: 'POST', body }); model.value = data.file.id; name.value = data.file.name }
 catch (e) { error.value = apiMessage(e) }
 finally { busy.value = false; emit('uploading', false) }
}
</script>
<template>
 <div class="field file-field">
  <label :for="id">{{ label }}</label><WorkspaceFilePicker :id="id" :accept="accept" :disabled="disabled" :busy="busy" :file-name="name || (model ? 'Berkas tersimpan' : '')" :max-bytes="10 * 1024 * 1024" @select="upload" />
  <small :id="id + '-hint'" role="status">{{ busy ? 'Mengunggah berkas…' : name || (model ? 'Berkas tersimpan. Pilih berkas baru untuk mengganti.' : 'Maksimal 10 MB per berkas.') }}</small>
  <a v-if="model" class="file-link" :href="capstoneAPI + '/files/' + model">Unduh berkas tersimpan</a>
  <p v-if="error" class="notice error" role="alert">{{ error }}</p>
 </div>
</template>
<style scoped>.file-link { color: var(--accent); text-decoration: underline; font-size: .9375rem; }</style>
