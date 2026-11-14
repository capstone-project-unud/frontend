<script setup lang="ts">
import WorkspaceFilter from '~/components/workspace/WorkspaceFilter.vue'
import WorkspaceSearch from '~/components/workspace/WorkspaceSearch.vue'
import type { Role } from '~/types/user'

const props = defineProps<{
  query: {
    q: string
    role: Role | ''
    status: string
    admission_year?: string | number
  }
}>()

const emit = defineEmits<{
  change: [value: {
    q: string
    role: Role | ''
    status: string
    admission_year?: number | ''
  }]
}>()

const search = shallowRef(props.query.q)
watch(() => props.query.q, (val) => {
  search.value = val
})

const tabs: { value: Role; label: string }[] = [
  { value: 'MAHASISWA', label: 'Mahasiswa' },
  { value: 'DOSEN', label: 'Dosen' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'KOORDINATOR_TA', label: 'Koordinator TA' },
  { value: 'TU', label: 'Tata usaha' },
]

const statusOptions = [
  { value: '', label: 'Semua status' },
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Nonaktif' },
]

const currentYear = new Date().getFullYear()
const yearOptions = computed(() => {
  const years: { value: number | ''; label: string }[] = [{ value: '', label: 'Semua angkatan' }]
  for (let y = currentYear; y >= currentYear - 7; y--) {
    years.push({ value: y, label: `Angkatan ${y}` })
  }
  return years
})

function changeRole(role: Role) {
  emit('change', {
    ...props.query,
    role,
    admission_year: role === 'MAHASISWA' ? (props.query.admission_year ? Number(props.query.admission_year) : '') : '',
  })
}

function selectStatus(status: string) {
  emit('change', {
    ...props.query,
    status,
    admission_year: props.query.admission_year ? Number(props.query.admission_year) : '',
  })
}

function selectYear(year: number | '') {
  emit('change', {
    ...props.query,
    admission_year: year,
  })
}

function handleSearchSubmit() {
  emit('change', {
    ...props.query,
    q: search.value,
    admission_year: props.query.admission_year ? Number(props.query.admission_year) : '',
  })
}

function clearSearch() {
  search.value = ''
  emit('change', {
    ...props.query,
    q: '',
    admission_year: props.query.admission_year ? Number(props.query.admission_year) : '',
  })
}

function resetAll() {
  search.value = ''
  emit('change', { q: '', role: 'MAHASISWA', status: '', admission_year: '' })
}

const selectedStatus = computed({ get: () => props.query.status, set: selectStatus })
const selectedYear = computed({ get: () => String(props.query.admission_year || ''), set: (value: string) => selectYear(value ? Number(value) : '') })
const yearFilterOptions = computed(() => yearOptions.value.map(option => ({ value: String(option.value), label: option.label })))
</script>

<template>
  <div class="filters">
    <div class="role-tabs" aria-label="Filter peran">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        :aria-pressed="query.role === tab.value"
        :class="{ selected: query.role === tab.value }"
        @click="changeRole(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <form class="search-row" role="search" @submit.prevent="handleSearchSubmit">
      <WorkspaceSearch id="search-users" v-model="search" label="Cari nama, email, atau NIM" placeholder="Cari nama, email, atau NIM…" @search="handleSearchSubmit" @clear="clearSearch" />

      <WorkspaceFilter id="status-filter" v-model="selectedStatus" label="Filter status akun" :options="statusOptions" />
      <WorkspaceFilter v-if="query.role === 'MAHASISWA'" id="year-filter" v-model="selectedYear" label="Filter tahun angkatan" :options="yearFilterOptions" />

      <!-- Reset Filter Button -->
      <button
        v-if="query.q || query.status || query.role !== 'MAHASISWA' || query.admission_year"
        class="reset-button"
        type="button"
        @click="resetAll"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
          <path d="M3 3v5h5"></path>
        </svg>
        Reset filter
      </button>
    </form>
  </div>
</template>

<style scoped>
.filters { padding: 0 1.5rem; }

.role-tabs {
  display: flex;
  gap: 1.75rem;
  border-bottom: 1px solid var(--line);
  flex-wrap: wrap;
}

.role-tabs button {
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  min-height: 52px;
  padding: .7rem 0;
  font-size: .9375rem;
  font-weight: 600;
  color: var(--muted);
  transition: color 150ms ease, border-color 150ms ease;
}

.role-tabs button:hover {
  color: var(--ink);
}

.role-tabs button.selected {
  color: var(--accent);
  border-bottom-color: var(--accent);
  font-weight: 650;
}

.search-row {
  display: flex;
  align-items: center;
  gap: .875rem;
  padding: 1.25rem 0;
  flex-wrap: wrap;
}

.search-row :deep(.workspace-filter) { width: 175px; }

/* Reset Filter Pill Button */
.reset-button {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  min-height: 38px;
  padding: .4rem .75rem;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--muted);
  font-size: .875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
}

.reset-button:hover {
  background: transparent;
  color: var(--error);
  text-decoration: underline;
}

@media (max-width: 767px) {
  .filters { padding: 0 1rem; }
  .role-tabs { gap: 1rem; }
  .role-tabs button { font-size: .875rem; min-height: 48px; }
  .search-row { gap: .625rem; }
  .search-row :deep(.workspace-filter) { flex: 1; width: auto; }
}
</style>
