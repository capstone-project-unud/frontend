<script setup lang="ts">
import WorkspaceSearch from '~/components/workspace/WorkspaceSearch.vue'
import WorkspaceFilter from '~/components/workspace/WorkspaceFilter.vue'
import type { Project, Interest, DirectoryUser } from '../types'
import { capstoneAPI, useCapstone } from '../composables/useCapstone'
import { apiMessage } from '~/utils/format'
import FinalizationRow from './FinalizationRow.vue'
import StatusLabel from './StatusLabel.vue'
const api = useCapstone()
const { busy, error, message } = api
const fetcher = useRequestFetch()
const interest = shallowRef(''), state = shallowRef('SUBMITTED'), page = shallowRef(1), lecturerQuery = shallowRef('')
const query = computed(() => ({ interest_id: interest.value, status: state.value, page: page.value }))
watch([interest, state], () => { page.value = 1 })
const { data, status, error: loadError, refresh } = await useAsyncData('finalization-projects', () => fetcher<{ items: Project[]; total: number }>(capstoneAPI + '/projects', { query: query.value }), { watch: [query] })
const { data: interests } = await useAsyncData('capstone-interests', () => fetcher<{ items: Interest[] }>(capstoneAPI + '/interests'))
const { data: directory } = await useAsyncData('finalization-lecturers', () => fetcher<{ items: DirectoryUser[] }>(capstoneAPI + '/directory', { query: { role: 'DOSEN' } }))
const lecturers = shallowRef<DirectoryUser[]>(directory.value?.items || [])
const selected = shallowRef<Project | null>(null)
const dialog = useTemplateRef<HTMLDialogElement>('confirm')
async function searchLecturers() { try { const result = await $fetch<{ items: DirectoryUser[] }>(capstoneAPI + '/directory', { query: { role: 'DOSEN', q: lecturerQuery.value } }); lecturers.value = result.items } catch (e) { error.value = apiMessage(e) } }
async function change(p: Project, path: string, body: Record<string, unknown>) { if (await api.mutate('/projects/' + p.id + path, { version: p.version, ...body }, 'PUT')) await refresh() }
async function open(p: Project) { selected.value = p; await nextTick(); dialog.value?.showModal() }
async function finalize() { if (!selected.value) return; if (await api.mutate('/projects/' + selected.value.id + '/finalize', { version: selected.value.version })) { dialog.value?.close(); selected.value = null; await refresh() } }
const pages = computed(() => Math.max(1, Math.ceil((data.value?.total || 0) / 20)))
const interestOptions = computed(() => [{ value: '', label: 'Semua bidang minat' }, ...(interests.value?.items || []).map(i => ({ value: i.id, label: i.name }))])
const statusOptions = [{ value: 'SUBMITTED', label: 'Menunggu finalisasi' }, { value: 'FINALIZED', label: 'Sudah ditetapkan' }]
function exportList() { return api.download('/projects/export?' + new URLSearchParams({ interest_id: interest.value, status: state.value }), 'Finalisasi_Judul.xlsx') }
function close() { if (!busy.value) { dialog.value?.close(); selected.value = null } }
</script>
<template>
 <section><header class="page-heading"><div><h1>Finalisasi judul</h1><p>Tetapkan pembimbing per mahasiswa dan catat dua keputusan rapat secara terpisah.</p></div></header>
 <div class="panel workspace-panel"><div class="workspace-panel-header"><div class="workspace-panel-title"><h2>Daftar finalisasi</h2><span>{{ data?.total ?? '—' }} judul</span></div><div class="workspace-panel-actions"><button class="button secondary" :disabled="busy || !data?.total" @click="exportList">Unduh Excel</button></div></div><div class="workspace-toolbar"><WorkspaceFilter id="final-interest" v-model="interest" label="Bidang minat" :options="interestOptions" /><WorkspaceFilter id="final-status" v-model="state" label="Status finalisasi" :options="statusOptions" /></div><form class="workspace-toolbar" role="search" aria-label="Cari dosen untuk penetapan" @submit.prevent="searchLecturers"><WorkspaceSearch id="lecturer-query" v-model="lecturerQuery" label="Cari dosen untuk penetapan" placeholder="Cari nama dosen…" @search="searchLecturers" @clear="searchLecturers" /><span class="muted cap-toolbar-hint">Hasil pencarian menjadi pilihan dosen pada tabel.</span></form></div>
 <p v-if="error" role="alert" class="notice error cap-feedback">{{ error }}</p><p v-if="message" role="status" class="notice success cap-feedback">{{ message }}</p>
 <p v-if="status === 'pending'" role="status" class="cap-loading">Memuat judul…</p><div v-else-if="loadError" class="notice error" role="alert">Daftar belum dapat dimuat. <button class="button secondary" @click="refresh()">Coba lagi</button></div><div v-else-if="!data?.items.length" class="panel empty-state"><h2>Tidak ada judul untuk ditampilkan</h2><p>Judul yang diajukan mahasiswa akan tersedia untuk rapat finalisasi.</p></div>
 <div v-else class="cap-stack"><section v-for="p in data.items" :key="p.id" class="panel cap-list-panel"><div class="workspace-panel-header"><div class="cap-project-heading"><h2>{{ p.title }}</h2><p class="muted">{{ p.interest_name }}</p></div><StatusLabel :value="p.status" /></div><div class="workspace-table cap-table-wrap" tabindex="0" :aria-label="'Penetapan pembimbing: ' + p.title"><table class="workspace-table cap-table finalization-table"><caption class="visually-hidden">Penetapan pembimbing per mahasiswa</caption><thead><tr><th scope="col">Mahasiswa</th><th scope="col">Calon pembimbing</th><th scope="col">Pembimbing ditetapkan</th><th scope="col">Persetujuan judul</th><th scope="col">Kesediaan membimbing</th></tr></thead><tbody><FinalizationRow v-for="r in p.students" :key="r.student_id + r.slot + ':' + p.version" :row="r" :lecturers="lecturers" :busy="busy" :editable="p.status === 'SUBMITTED'" @assign="(student, slot, supervisor) => change(p, '/assignment', { student_id: student, slot, supervisor_id: supervisor })" @decide="(student, slot, kind) => change(p, '/decision', { student_id: student, slot, kind, status: 'APPROVED' })" /></tbody></table></div><div class="cap-panel-footer cap-actions"><NuxtLink class="button secondary" :to="'/capstone/' + p.id">Detail dan deskripsi</NuxtLink><button v-if="p.status === 'SUBMITTED'" class="button primary" :disabled="busy" @click="open(p)">Finalisasi judul</button><button v-else class="button secondary" :disabled="busy" @click="api.download('/projects/' + p.id + '/letter', 'Penetapan_Judul_Capstone.pdf')">Unduh penetapan (PDF)</button></div></section></div>
 <div class="workspace-pagination cap-pagination-panel panel"><span>Halaman {{ page }} dari {{ pages }}</span><div class="cap-actions"><button class="button workspace-pager" :disabled="page <= 1" @click="page--">Sebelumnya</button><button class="button workspace-pager" :disabled="page >= pages" @click="page++">Berikutnya</button></div></div>
 <dialog ref="confirm" class="cap-dialog" aria-labelledby="final-confirm-title" @cancel.prevent="close"><form @submit.prevent="finalize"><h2 id="final-confirm-title">Tetapkan judul ini?</h2><p>{{ selected?.title }}</p><p>Judul dan pembimbing akan dikunci. Pastikan penetapan setiap mahasiswa sesuai hasil rapat.</p><p v-if="error" class="notice error" role="alert">{{ error }}</p><div class="cap-dialog-actions"><button type="button" class="button secondary" :disabled="busy" @click="close">Batal</button><button class="button primary" :disabled="busy">{{ busy ? 'Memfinalisasi…' : 'Tetapkan judul' }}</button></div></form></dialog>
 </section>
</template>
