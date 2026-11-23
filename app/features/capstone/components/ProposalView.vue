<script setup lang="ts">
import WorkspaceFilter from '~/components/workspace/WorkspaceFilter.vue'
import WorkspaceSkeleton from '~/components/workspace/WorkspaceSkeleton.vue'
import type { Proposal, Project, Interest, ProjectDocument, Guidance } from '../types'
import type { ProposalExam } from '../proposal'
import { capstoneAPI, useCachedReference, useCapstone } from '../composables/useCapstone'
import ProposalForm from './ProposalForm.vue'
import ProposalDocumentReview from './ProposalDocumentReview.vue'
const api = useCapstone()
const { student, busy, error } = api
const fetcher = useRequestFetch()
const interest = shallowRef('')
const validity = shallowRef('')
const query = computed(() => ({ interest_id: interest.value, validity: validity.value }))
const { data, status, error: loadError, refresh } = await useLazyAsyncData('proposal-applications', () => fetcher<{ items: Proposal[] }>(capstoneAPI + '/proposals', { query: query.value }), { watch: [query] })
const { data: projects, error: projectError, refresh: refreshProjects } = await useLazyAsyncData('proposal-projects', () => student.value ? fetcher<{ items: Project[] }>(capstoneAPI + '/projects', { query: { status: 'FINALIZED' } }) : Promise.resolve({ items: [] }))
const { data: exams } = await useLazyAsyncData('proposal-registration-exams', () => student.value ? fetcher<{ items: ProposalExam[] }>(capstoneAPI + '/proposal-exams') : Promise.resolve({ items: [] }))
const { data: projectDocs } = await useLazyAsyncData('proposal-prefill-docs', () => student.value ? fetcher<{ items: ProjectDocument[] }>(capstoneAPI + '/documents') : Promise.resolve({ items: [] }))
const { data: guidanceLogs } = await useLazyAsyncData('proposal-guidance-check', () => student.value ? fetcher<{ items: Guidance[] }>(capstoneAPI + '/guidance') : Promise.resolve({ items: [] }))
const { data: interests } = await useCachedReference<{ items: Interest[] }>('capstone-interests', '/interests')
const selectedId = shallowRef('')
const selected = computed(() => data.value?.items.find(a => a.id === selectedId.value) || (student.value ? data.value?.items[0] : undefined))
const own = computed(() => data.value?.items[0])
const prefillDocs = computed(() => {
 const pid = own.value?.project_id || projects.value?.items[0]?.id
 if (!pid) return {}
 const docs = (projectDocs.value?.items || []).filter(d => d.project_id === pid)
 const findFile = (code: string) => docs.find(d => (d.doc_type_code || d.series) === code)?.file_id
 return {
  proposal: findFile('PROPOSAL_USULAN'),
  b100: findFile('B-100'),
  b200: findFile('B-200'),
 }
})
const approvedGuidanceCount = computed(() => {
 const uid = api.user.value?.id
 const pid = own.value?.project_id || projects.value?.items[0]?.id
 if (!uid || !pid) return undefined
 return (guidanceLogs.value?.items || []).filter(l => l.project_id === pid && l.student_id === uid && l.status === 'APPROVED').length
})
const locked = computed(() => exams.value?.items.some(e => e.application_id === own.value?.id))
const interestOptions = computed(() => [{ value: '', label: 'Semua bidang minat' }, ...(interests.value?.items.map(i => ({ value: i.id, label: i.name })) || [])])
const validityOptions = [{ value: '', label: 'Semua status' }, { value: 'pending', label: 'Belum lengkap valid' }, { value: 'revision', label: 'Perlu perbaikan' }, { value: 'ready', label: 'Enam berkas valid' }]
function exportData() { api.download('/proposals/export?' + new URLSearchParams(query.value), 'pendaftaran-proposal.xlsx') }
</script>
<template>
 <section>
  <p v-if="student && projectError" class="notice error" role="alert">Judul belum dapat dimuat. <button class="button secondary" @click="refreshProjects()">Coba lagi</button></p>
  <ProposalForm v-if="student && projects?.items.length && status === 'success'" :key="own?.version || 0" :projects="projects.items" :application="own" :locked="locked" :prefill-docs="prefillDocs" :approved-guidance-count="approvedGuidanceCount" @saved="refresh()" />
  <div class="panel workspace-panel cap-list-panel">
   <div class="workspace-panel-header"><div class="workspace-panel-title"><h2>Daftar pendaftaran proposal</h2><span>{{ data?.items.length ?? '—' }} pendaftaran</span></div><button v-if="!student" class="button secondary" :disabled="busy || !!loadError" @click="exportData">Unduh Excel</button></div>
   <div v-if="!student" class="workspace-toolbar"><WorkspaceFilter id="proposal-interest" v-model="interest" label="Bidang minat" :options="interestOptions" /><WorkspaceFilter id="proposal-validity" v-model="validity" label="Kevalidan persyaratan" :options="validityOptions" /></div>
   <p v-if="error" class="notice error cap-panel-feedback" role="alert">{{ error }}</p>
   <WorkspaceSkeleton v-if="status === 'pending'" variant="table" :rows="4" label="Memuat pendaftaran proposal…" />
   <div v-else-if="loadError" class="empty-state"><h2>Pendaftaran belum dapat dimuat</h2><button class="button secondary" @click="refresh()">Coba lagi</button></div>
   <div v-else-if="!data?.items.length" class="empty-state"><h2>Belum ada pendaftaran</h2><p>{{ student ? 'Daftarkan proposal setelah judul dan dua pembimbing ditetapkan.' : 'Sesuaikan filter atau tunggu pengajuan mahasiswa.' }}</p></div>
   <div v-else class="cap-table-wrap"><table class="workspace-table"><caption class="sr-only">Pendaftaran proposal dan validasi enam persyaratan</caption><thead><tr><th>NIM / Nama</th><th>Judul / Bidang minat</th><th>P1</th><th>P2</th><th>Berkas valid</th><th><span class="sr-only">Tindakan</span></th></tr></thead><tbody><tr v-for="a in data.items" :key="a.id"><td>{{ a.nim }}<br>{{ a.student_name }}</td><td>{{ a.title }}<br><span class="muted">{{ a.interest_name }}</span></td><td>{{ a.supervisor_1_name || 'Belum ditetapkan' }}</td><td>{{ a.supervisor_2_name || 'Belum ditetapkan' }}</td><td>{{ a.documents.filter(d => d.status === 'VALID').length }} / 6</td><td><button class="button secondary" :aria-expanded="selected?.id === a.id" @click="selectedId = selectedId === a.id ? '' : a.id">{{ student ? 'Lihat status' : 'Periksa' }}</button></td></tr></tbody></table></div>
   <ProposalDocumentReview v-if="selected" :key="selected.id + ':' + selected.version" :application="selected" @saved="refresh()" />
  </div>
 </section>
</template>
