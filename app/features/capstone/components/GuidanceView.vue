<script setup lang="ts">
import WorkspaceFilter from '~/components/workspace/WorkspaceFilter.vue'
import WorkspaceSkeleton from '~/components/workspace/WorkspaceSkeleton.vue'
import type { Guidance, Project } from '../types'
import { capstoneAPI, useCapstone } from '../composables/useCapstone'
import GuidanceForm from './GuidanceForm.vue'
import StatusLabel from './StatusLabel.vue'
const api = useCapstone()
const { student, busy, error, message } = api
const fetcher = useRequestFetch()
const studentFilter = shallowRef('')
const { data, status, error: loadError, refresh } = await useLazyAsyncData('guidance-list', () => fetcher<{ items: Guidance[] }>(capstoneAPI + '/guidance', { query: { student_id: studentFilter.value } }), { watch: [studentFilter] })
const { data: projects } = await useLazyAsyncData('guidance-projects', () => fetcher<{ items: Project[] }>(capstoneAPI + '/projects', { query: { status: 'FINALIZED' } }))
const showingForm = shallowRef(false), selected = shallowRef<Guidance | null>(null)
const notes = reactive<Record<string, string>>({})
const allStudents = shallowRef<{ id: string; name: string }[]>([])
watch(data, (value) => { if (studentFilter.value || !value) return; allStudents.value = Array.from(new Map(value.items.map(l => [l.student_id, { id: l.student_id, name: l.student_name }])).values()) }, { immediate: true })
const studentOptions = computed(() => [{ value: '', label: 'Semua mahasiswa bimbingan' }, ...allStudents.value.map(s => ({ value: s.id, label: s.name }))])
async function saved() { showingForm.value = false; selected.value = null; await refresh() }
function edit(log?: Guidance) { selected.value = log || null; showingForm.value = true }
async function review(log: Guidance, decision: string) { if (await api.mutate('/guidance/' + log.id + '/review', { version: log.version, status: decision, note: notes[log.id] || '' }, 'PUT')) await refresh() }
function print(id?: string) { return api.download('/guidance/export?' + new URLSearchParams({ student_id: studentFilter.value, ...(id ? { id } : {}) }), id ? 'Log_Bimbingan.pdf' : 'Seluruh_Log_Bimbingan.pdf') }
</script>
<template>
 <section>
  <GuidanceForm v-if="showingForm" :key="selected?.id || 'new'" :projects="projects?.items || []" :log="selected" @saved="saved" @cancel="showingForm = false" />
  <div class="panel workspace-panel cap-list-panel">
   <div class="workspace-panel-header">
    <div class="workspace-panel-title"><h2>Daftar bimbingan</h2><span>{{ data ? `${data.items.length} log` : '—' }}</span></div>
    <div class="workspace-panel-actions">
     <button v-if="student" class="button primary" :disabled="!projects?.items.length" @click="edit()">Catat bimbingan</button>
     <button class="button secondary" :disabled="busy || !data?.items.length" @click="print()">Cetak seluruh log</button>
    </div>
   </div>
   <div v-if="!student" class="workspace-toolbar"><WorkspaceFilter id="guidance-student" v-model="studentFilter" label="Mahasiswa bimbingan" :options="studentOptions" /></div>
   <p v-if="student && !projects?.items.length" class="notice cap-panel-feedback">Log dapat dicatat setelah judul dan pembimbing ditetapkan.</p>
   <p v-if="error" class="notice error cap-panel-feedback" role="alert">{{ error }}</p>
   <p v-if="message" class="notice success cap-panel-feedback" role="status">{{ message }}</p>
   <WorkspaceSkeleton v-if="status === 'pending'" variant="cards" :rows="3" label="Memuat log bimbingan…" />
   <div v-else-if="loadError" class="empty-state"><h2>Log belum dapat dimuat</h2><p>Periksa koneksi lalu coba kembali.</p><button class="button secondary" @click="refresh()">Coba lagi</button></div>
   <div v-else-if="!data?.items.length" class="empty-state"><h2>Belum ada log bimbingan</h2><p>Catatan pertemuan dan hasil pemeriksaan akan ditampilkan di sini.</p></div>
   <div v-else class="cap-panel-items">
    <article v-for="log in data.items" :key="log.id" class="cap-panel-item">
     <div class="cap-section-heading"><div><h2>{{ log.topic }}</h2><p class="muted">{{ log.meeting_date.slice(0, 10) }} · {{ log.student_name }}</p></div><StatusLabel :value="log.status" /></div>
     <p class="muted">{{ log.title }}<br>Pembimbing: {{ log.supervisor_name }}</p>
     <dl class="cap-description"><dt>Kemajuan</dt><dd>{{ log.progress }}</dd><template v-if="log.obstacles"><dt>Kendala</dt><dd>{{ log.obstacles }}</dd></template><template v-if="log.next_plan"><dt>Rencana berikutnya</dt><dd>{{ log.next_plan }}</dd></template></dl>
     <p v-if="log.review_note" class="notice">Catatan pembimbing: {{ log.review_note }}</p>
     <div class="cap-actions"><button class="button secondary" :disabled="busy" @click="print(log.id)">Cetak log ini</button><button v-if="student && log.status !== 'APPROVED'" class="button secondary" @click="edit(log)">Ubah log</button></div>
     <form v-if="log.supervisor_id === api.user.value?.id && log.status === 'PENDING'" class="cap-review" @submit.prevent="review(log, 'APPROVED')">
      <div class="field"><label :for="'log-note-' + log.id">Catatan pemeriksaan</label><textarea :id="'log-note-' + log.id" v-model="notes[log.id]" maxlength="2000" rows="2" /></div>
      <div class="cap-actions"><button class="button primary" :disabled="busy">Setujui log</button><button type="button" class="button secondary" :disabled="busy" @click="review(log, 'REVISION')">Minta perbaikan</button></div>
     </form>
    </article>
   </div>
  </div>
 </section>
</template>
