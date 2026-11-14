<script setup lang="ts">
import type { Project } from '../types'
import { capstoneAPI, useCapstone } from '../composables/useCapstone'
import { dateTime } from '~/utils/format'
import ProjectForm from './ProjectForm.vue'
import CandidateEditor from './CandidateEditor.vue'
import SupervisorDecisions from './SupervisorDecisions.vue'
import StatusLabel from './StatusLabel.vue'
const props = defineProps<{ id: string }>()
const api = useCapstone()
const { busy, error, message, student, coordinator } = api
const fetcher = useRequestFetch()
const { data, status, error: loadError, refresh } = await useAsyncData('capstone-project-' + props.id, () => fetcher<{ project: Project }>(capstoneAPI + '/projects/' + props.id))
const { data: history, refresh: refreshHistory } = await useAsyncData('capstone-history-' + props.id, () => fetcher<{ items: { id: number; action: string; created_at: string }[] }>(capstoneAPI + '/projects/' + props.id + '/history'))
const editing = shallowRef(false)
const note = shallowRef('')
const extraHistoryLabels: Record<string, string> = { FINALIZATION_REOPENED: 'Finalisasi dibuka kembali untuk koreksi' }
const project = computed(() => data.value?.project)
const canEdit = computed(() => !!project.value && student.value && project.value.owner_id === api.user.value?.id && ['DRAFT', 'REVISION'].includes(project.value.status))
const historyLabels: Record<string, string> = { PROJECT_SAVED: 'Draf judul disimpan', PROJECT_SUBMITTED: 'Judul diajukan', CANDIDATES_CHANGED: 'Calon pembimbing diubah', SUPERVISOR_DECISION: 'Keputusan pembimbing dicatat', SUPERVISOR_ASSIGNED: 'Pembimbing ditetapkan', PROJECT_FINALIZED: 'Judul difinalisasi', REVISION_REQUESTED: 'Revisi diminta', GUIDANCE_SUBMITTED: 'Log bimbingan diajukan', GUIDANCE_REVIEWED: 'Log bimbingan diperiksa', PROPOSAL_SUBMITTED: 'Berkas UP diajukan', PROPOSAL_FILE_REVIEWED: 'Berkas UP diperiksa' }
async function changed() { await Promise.all([refresh(), refreshHistory()]) }
async function action(path: string, body: Record<string, unknown> = {}) { if (!project.value) return; if (await api.mutate('/projects/' + props.id + path, { version: project.value.version, ...body })) await changed() }
</script>
<template>
 <section><header class="page-heading"><div><h1>Detail judul capstone</h1><p><NuxtLink to="/capstone" class="cap-link">Kembali ke daftar judul</NuxtLink></p></div></header>
 <p v-if="status === 'pending'" role="status">Memuat judul…</p><div v-else-if="loadError" class="notice error" role="alert">Judul belum dapat dimuat. <button class="button secondary" @click="refresh()">Coba lagi</button></div>
 <template v-else-if="project"><ProjectForm v-if="editing" :key="project.version" :project="project" @cancel="editing = false" @saved="editing = false; changed()" />
 <div v-else class="cap-stack">
 <article class="panel cap-section"><div class="cap-section-heading"><h2>{{ project.title }}</h2><StatusLabel :value="project.status" /></div><p class="muted">{{ project.interest_name }}</p><p class="cap-preserve">{{ project.summary }}</p><p v-if="project.revision_note" class="notice">Catatan revisi: {{ project.revision_note }}</p>
 <div class="cap-actions"><a v-if="project.description_file_id" class="button secondary" :href="capstoneAPI + '/files/' + project.description_file_id">Unduh deskripsi</a><button v-if="canEdit" class="button secondary" @click="editing = true">Ubah draf</button><button v-if="canEdit" class="button primary" :disabled="busy" @click="action('/submit')">Ajukan judul</button><NuxtLink v-if="coordinator" to="/finalization" class="button secondary">Buka finalisasi judul</NuxtLink><button v-if="project.status === 'FINALIZED'" class="button secondary" :disabled="busy" @click="api.download('/projects/' + id + '/letter', 'Penetapan_Judul_Capstone.pdf')">Unduh penetapan (PDF)</button></div>
 <p v-if="project.status === 'FINALIZED'" class="muted">Surat menggunakan format sementara hingga format resmi tersedia.</p></article>
 <p v-if="error" class="notice error" role="alert">{{ error }}</p><p v-if="message" class="notice success" role="status">{{ message }}</p>
 <CandidateEditor v-if="student" :key="project.version" :project="project" @changed="changed" />
 <SupervisorDecisions :project="project" @changed="changed" />
 <form v-if="coordinator && project.status === 'SUBMITTED'" class="panel cap-section" aria-label="Minta revisi judul" @submit.prevent="action('/revision', { note })"><h2>Permintaan revisi</h2><div class="field"><label for="revision-note">Catatan untuk pengusul</label><textarea id="revision-note" v-model="note" required minlength="5" maxlength="2000" rows="3" /></div><div><button class="button secondary" :disabled="busy">Kembalikan untuk revisi</button></div></form>
 <form v-if="coordinator && project.status === 'FINALIZED'" class="panel cap-section" aria-label="Koreksi penetapan" @submit.prevent="action('/reopen', { note })"><h2>Koreksi penetapan pembimbing</h2><p class="muted">Jika pembimbing kedua belum ditetapkan, buka kembali finalisasi dengan alasan tercatat. Koreksi tersedia sebelum pengajuan berkas UP; setelah perubahan, finalisasi kembali judul ini.</p><div class="field"><label for="reopen-note">Alasan koreksi</label><textarea id="reopen-note" v-model="note" required minlength="5" maxlength="2000" rows="3" /></div><div><button class="button secondary" :disabled="busy">Buka kembali finalisasi</button></div></form>
 <section class="panel cap-section" aria-labelledby="history-title"><h2 id="history-title">Riwayat proses</h2><ol v-if="history?.items.length" class="cap-history"><li v-for="item in history.items" :key="item.id"><span>{{ historyLabels[item.action] || extraHistoryLabels[item.action] || item.action }}</span><time :datetime="item.created_at">{{ dateTime(item.created_at) }}</time></li></ol><p v-else class="muted">Belum ada riwayat yang dapat ditampilkan.</p></section>
 </div></template></section>
</template>
