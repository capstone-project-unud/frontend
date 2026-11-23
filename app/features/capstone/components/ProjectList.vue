<script setup lang="ts">
import type { Project, Interest } from '../types'
import { capstoneAPI, useCachedReference, useCapstone } from '../composables/useCapstone'
import StatusLabel from './StatusLabel.vue'
import TopicSeminarsPanel from './TopicSeminarsPanel.vue'
import WorkspaceSearch from '~/components/workspace/WorkspaceSearch.vue'
import WorkspaceFilter from '~/components/workspace/WorkspaceFilter.vue'
import WorkspaceSkeleton from '~/components/workspace/WorkspaceSkeleton.vue'

const api = useCapstone()
const { student, staff, busy, error } = api
const fetcher = useRequestFetch()
const q = shallowRef(''), search = shallowRef(''), interest = shallowRef(''), state = shallowRef(''), page = shallowRef(1)
const query = computed(() => ({ q: q.value, interest_id: interest.value, status: state.value, page: page.value }))
watch([interest, state, q], () => { page.value = 1 })

const { data, status, error: loadError, refresh } = await useLazyAsyncData('capstone-project-list', () => fetcher<{ items: Project[]; total: number; limit: number }>(capstoneAPI + '/projects', { query: query.value }), { watch: [query] })
const { data: interests } = await useCachedReference<{ items: Interest[] }>('capstone-interests', '/interests')
const pages = computed(() => Math.max(1, Math.ceil((data.value?.total || 0) / 20)))
const interestOptions = computed(() => [{ value: '', label: 'Semua bidang minat' }, ...(interests.value?.items || []).map(i => ({ value: i.id, label: i.name }))])
const statusOptions = [
  { value: '', label: 'Semua status' },
  { value: 'DRAFT', label: 'Draf' },
  { value: 'SUBMITTED', label: 'Diajukan' },
  { value: 'REVISION', label: 'Perlu revisi' },
  { value: 'FINALIZED', label: 'Ditetapkan' },
]

function resetFilters() { q.value = ''; search.value = ''; interest.value = ''; state.value = '' }
function exportList() {
  const params = new URLSearchParams({ q: q.value, interest_id: interest.value, status: state.value })
  return api.download('/projects/export?' + params, 'Daftar_Judul_Capstone.xlsx')
}
</script>

<template>
  <section class="capstone-topics-stack">
    <div class="panel workspace-panel cap-list-panel">
      <div class="workspace-panel-header">
        <div class="workspace-panel-title">
          <h2>Daftar usulan topik &amp; judul capstone</h2>
          <span>{{ data?.total ?? '—' }} judul</span>
        </div>
        <div class="workspace-panel-actions">
          <NuxtLink v-if="student && !data?.total" class="button primary" to="/groups">Bentuk kelompok &amp; ajukan topik</NuxtLink>
          <button v-if="staff" type="button" class="button secondary" :disabled="busy || !data?.total" @click="exportList">Unduh Excel</button>
        </div>
      </div>

      <form class="workspace-toolbar" role="search" aria-label="Filter judul" @submit.prevent="q = search">
        <WorkspaceSearch id="title-search" v-model="search" label="Cari judul" placeholder="Cari judul capstone…" @search="q = search" @clear="q = ''" />
        <WorkspaceFilter id="interest-filter" v-model="interest" label="Bidang minat" :options="interestOptions" />
        <WorkspaceFilter id="status-filter" v-model="state" label="Status judul" :options="statusOptions" />
        <button v-if="q || interest || state" type="button" class="workspace-text-action secondary" @click="resetFilters">Reset filter</button>
      </form>

      <p v-if="error" role="alert" class="notice error cap-panel-feedback">{{ error }}</p>
      <WorkspaceSkeleton v-if="status === 'pending'" variant="table" :rows="5" label="Memuat daftar judul…" />
      <div v-else-if="loadError" class="empty-state">
        <h2>Daftar belum dapat dimuat</h2>
        <p>Periksa koneksi lalu coba kembali.</p>
        <button class="button secondary" @click="refresh()">Coba lagi</button>
      </div>
      <div v-else-if="!data?.items.length" class="empty-state">
        <h2>Belum ada topik / judul</h2>
        <p>{{ q || interest || state ? 'Tidak ada judul yang cocok dengan filter.' : 'Ajukan topik melalui menu Kelompok.' }}</p>
      </div>
      <div v-else class="workspace-table cap-table-wrap" tabindex="0" aria-label="Daftar judul">
        <table class="workspace-table cap-table cap-record-table">
          <caption class="visually-hidden">Daftar judul capstone</caption>
          <thead>
            <tr>
              <th scope="col">Judul &amp; bidang minat</th>
              <th scope="col">Anggota (ketua ditandai)</th>
              <th scope="col">Status</th>
              <th scope="col" class="cap-action-heading">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in data.items" :key="p.id">
              <td>
                <strong>{{ p.title }}</strong>
                <small>{{ p.interest_name }} · Administrasi topik: {{ p.topic_verify_status || 'PENDING' }}</small>
              </td>
              <td>
                <div v-for="m in p.students.filter(s => s.slot === 1)" :key="m.student_id">
                  {{ m.student_name }}<strong v-if="m.is_leader" class="leader-badge"> (Ketua)</strong>
                  <small>{{ m.nim }}<template v-if="m.responsibility"> · {{ m.responsibility }}</template></small>
                </div>
              </td>
              <td><StatusLabel :value="p.status" /></td>
              <td class="cap-row-actions"><NuxtLink class="workspace-text-action" :to="'/capstone/' + p.id">Lihat detail</NuxtLink></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="workspace-pagination">
        <span>{{ data?.total ? `Halaman ${page} dari ${pages}` : 'Tidak ada hasil' }}</span>
        <div>
          <button class="button workspace-pager" :disabled="page <= 1 || status === 'pending'" @click="page--">Sebelumnya</button>
          <button class="button workspace-pager" :disabled="page >= pages || status === 'pending'" @click="page++">Berikutnya</button>
        </div>
      </div>
    </div>

    <TopicSeminarsPanel />
  </section>
</template>

<style scoped>
.capstone-topics-stack { display: grid; gap: 1.5rem; }
.leader-badge { color: var(--accent); font-weight: 600; }
</style>
