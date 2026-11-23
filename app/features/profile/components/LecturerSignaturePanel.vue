<script setup lang="ts">
import WorkspaceFilePicker from '~/components/workspace/WorkspaceFilePicker.vue'
import WorkspaceSkeleton from '~/components/workspace/WorkspaceSkeleton.vue'
import { capstoneAPI } from '~/features/capstone/composables/useCapstone'
import { apiMessage, dateTime } from '~/utils/format'
const fetcher = useRequestFetch()
const { data, status, error: loadError, refresh } = await useLazyAsyncData('lecturer-signature', () => fetcher<{ signature: { version: number; updated_at: string } | null }>(capstoneAPI + '/signature'))
const busy = shallowRef(false)
const error = shallowRef('')
const message = shallowRef('')
async function upload(file: File) {
 if (busy.value) return
 busy.value = true; error.value = ''; message.value = ''
 try { const body = new FormData(); body.append('file', file); body.append('version', String(data.value?.signature?.version || 0)); await $fetch(capstoneAPI + '/signature', { method: 'POST', body }); await refresh(); message.value = 'Template tanda tangan disimpan.' }
 catch (e) { error.value = apiMessage(e) }
 finally { busy.value = false }
}
</script>
<template>
 <section class="panel cap-section" aria-labelledby="signature-title"><h2 id="signature-title">Template tanda tangan dosen</h2><p class="muted">Unggah gambar tanda tangan Anda. Penggunaannya pada presensi dan penilaian dikonfirmasi secara terpisah di halaman ujian proposal.</p>
  <WorkspaceSkeleton v-if="status === 'pending'" variant="spinner" label="Memuat template tanda tangan…" />
  <p v-else-if="loadError" class="notice error" role="alert">Template belum dapat dimuat. <button class="button secondary" @click="refresh()">Coba lagi</button></p>
  <template v-else><figure v-if="data?.signature"><img class="signature-preview" :src="capstoneAPI + '/signature/preview?v=' + data.signature.version" alt="Template tanda tangan Anda"><figcaption class="muted">Diperbarui {{ dateTime(data.signature.updated_at) }}</figcaption></figure><div class="field"><label for="lecturer-signature">Template tanda tangan</label><WorkspaceFilePicker id="lecturer-signature" accept=".png,.jpg,.jpeg" :max-bytes="2 * 1024 * 1024" :busy="busy" :disabled="busy || !data" :file-name="data?.signature ? 'Template tersimpan' : ''" @select="upload" /></div></template>
  <p v-if="error" class="notice error" role="alert">{{ error }}</p><p v-if="message" class="notice success" role="status">{{ message }}</p>
 </section>
</template>
<style scoped>
.signature-preview { display: block; max-width: min(100%, 20rem); max-height: 10rem; object-fit: contain; background: var(--canvas); border: 1px solid var(--border); padding: 1rem; }
</style>
