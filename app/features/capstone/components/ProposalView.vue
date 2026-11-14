<script setup lang="ts">
import WorkspaceFilter from '~/components/workspace/WorkspaceFilter.vue'
import type { Proposal, Project } from '../types'
import { capstoneAPI, useCapstone } from '../composables/useCapstone'
import { dateTime } from '~/utils/format'
import ProposalForm from './ProposalForm.vue'
import StatusLabel from './StatusLabel.vue'
const api = useCapstone()
const { student, busy, error, message } = api
const fetcher = useRequestFetch()
const { data, status, error: loadError, refresh } = await useAsyncData('proposal-applications', () => fetcher<{ items: Proposal[] }>(capstoneAPI + '/proposals'))
const { data: projects } = await useAsyncData('proposal-projects', () => fetcher<{ items: Project[] }>(capstoneAPI + '/projects', { query: { status: 'FINALIZED' } }))
const notes = reactive<Record<string, string>>({})
const kinds = [{ id: 'simak', title: 'Screenshot SIMAK berstatus diterima' }, { id: 'approval', title: 'Surat persetujuan pembimbing' }] as const
const filter = shallowRef('')
const statusOptions = [{ value: '', label: 'Semua pendaftaran' }, { value: 'pending', label: 'Belum lengkap' }, { value: 'ready', label: 'Kedua berkas valid' }]
const items = computed(() => data.value?.items.filter(a => !filter.value || (filter.value === 'ready' ? a.ready : !a.ready)) || [])
async function review(a: Proposal, kind: 'simak' | 'approval', decision: 'VALID' | 'REVISION') { if (await api.mutate('/proposals/' + a.id + '/review', { version: a.version, kind, status: decision, note: notes[a.id + kind] || '' }, 'PUT')) await refresh() }
</script>
<template>
 <section><header class="page-heading"><div><h1>{{ student ? 'Persyaratan ujian proposal' : 'Verifikasi berkas UP' }}</h1><p>{{ student ? 'Pantau pemeriksaan kedua berkas oleh tata usaha.' : 'Periksa bukti SIMAK dan surat persetujuan pembimbing secara terpisah.' }}</p></div></header>
 <ProposalForm v-if="student && projects?.items.length" :key="data?.items[0]?.version || 0" :projects="projects.items" :application="data?.items[0]" @saved="refresh()" /><p v-else-if="student" class="notice">Judul perlu ditetapkan dan dua pembimbing perlu ditugaskan sebelum mendaftar UP.</p>
 <div class="panel workspace-panel"><div class="workspace-panel-header"><div class="workspace-panel-title"><h2>Daftar pemeriksaan</h2><span>{{ items.length }} pendaftaran</span></div></div><div v-if="!student" class="workspace-toolbar"><WorkspaceFilter id="proposal-filter" v-model="filter" label="Status pemeriksaan" :options="statusOptions" /></div></div>
 <p v-if="error" class="notice error cap-feedback" role="alert">{{ error }}</p><p v-if="message" class="notice success cap-feedback" role="status">{{ message }}</p><p v-if="status === 'pending'" role="status" class="cap-loading">Memuat pendaftaran…</p><div v-else-if="loadError" class="notice error" role="alert">Pendaftaran belum dapat dimuat. <button class="button secondary" @click="refresh()">Coba lagi</button></div><div v-else-if="!items.length" class="panel empty-state"><h2>Belum ada pendaftaran yang ditampilkan</h2><p>Kedua berkas akan muncul setelah mahasiswa mengajukan verifikasi.</p></div>
 <div v-else class="cap-stack"><article v-for="a in items" :key="a.id" class="panel cap-section"><div class="cap-section-heading"><div><h2>{{ a.student_name }} · {{ a.nim }}</h2><p class="muted">{{ a.title }}</p></div><strong :class="{ 'cap-success': a.ready }">{{ a.ready ? 'Kedua berkas valid' : 'Menunggu kelengkapan' }}</strong></div>
 <section v-for="kind in kinds" :key="kind.id" class="member-row"><div class="cap-section-heading"><h3>{{ kind.title }}</h3><StatusLabel :value="a[kind.id === 'simak' ? 'simak_status' : 'approval_status']" /></div><div><a class="button secondary" :href="capstoneAPI + '/files/' + a[kind.id === 'simak' ? 'simak_file_id' : 'approval_file_id']">Unduh berkas untuk diperiksa</a></div><p v-if="a[kind.id === 'simak' ? 'simak_note' : 'approval_note']" class="notice">{{ a[kind.id === 'simak' ? 'simak_note' : 'approval_note'] }}</p><small v-if="a[kind.id === 'simak' ? 'simak_reviewed_at' : 'approval_reviewed_at']" class="muted">Diperiksa {{ dateTime(a[kind.id === 'simak' ? 'simak_reviewed_at' : 'approval_reviewed_at']!) }}</small>
 <form v-if="api.user.value?.roles.includes('TU')" class="cap-review" @submit.prevent="review(a, kind.id, 'VALID')"><div class="field"><label :for="'proposal-note-' + a.id + kind.id">Catatan pemeriksaan (wajib untuk revisi)</label><textarea :id="'proposal-note-' + a.id + kind.id" v-model="notes[a.id + kind.id]" maxlength="2000" rows="2" /></div><div class="cap-actions"><button class="button primary" :disabled="busy">Validasi berkas</button><button type="button" class="button secondary" :disabled="busy" @click="review(a, kind.id, 'REVISION')">Minta perbaikan</button></div></form></section>
 <p v-if="a.ready" class="notice success">Persyaratan berkas UP telah divalidasi TU. Penjadwalan ujian mengikuti proses program studi.</p></article></div></section>
</template>
