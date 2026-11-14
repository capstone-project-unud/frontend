<script setup lang="ts">
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
const statusOpen = shallowRef(false)
const yearOpen = shallowRef(false)
const dropdownRef = useTemplateRef<HTMLElement>('dropdownRef')
const yearDropdownRef = useTemplateRef<HTMLElement>('yearDropdownRef')

watch(() => props.query.q, (val) => {
  search.value = val
})

const tabs: { value: Role; label: string }[] = [
  { value: 'MAHASISWA', label: 'Mahasiswa' },
  { value: 'DOSEN', label: 'Dosen' },
  { value: 'ADMIN', label: 'Admin' },
]

const statusOptions = [
  { value: '', label: 'Semua status' },
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Nonaktif' },
]

const currentStatusLabel = computed(() => {
  const found = statusOptions.find(opt => opt.value === props.query.status)
  return found ? found.label : 'Semua status'
})

const currentYear = new Date().getFullYear()
const yearOptions = computed(() => {
  const years: { value: number | ''; label: string }[] = [{ value: '', label: 'Semua angkatan' }]
  for (let y = currentYear; y >= currentYear - 7; y--) {
    years.push({ value: y, label: `Angkatan ${y}` })
  }
  return years
})

const currentYearLabel = computed(() => {
  if (!props.query.admission_year) return 'Semua angkatan'
  return `Angkatan ${props.query.admission_year}`
})

function changeRole(role: Role) {
  emit('change', {
    ...props.query,
    role,
    admission_year: role === 'MAHASISWA' ? (props.query.admission_year ? Number(props.query.admission_year) : '') : '',
  })
}

function selectStatus(status: string) {
  statusOpen.value = false
  emit('change', {
    ...props.query,
    status,
    admission_year: props.query.admission_year ? Number(props.query.admission_year) : '',
  })
}

function selectYear(year: number | '') {
  yearOpen.value = false
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
  statusOpen.value = false
  yearOpen.value = false
  emit('change', { q: '', role: 'MAHASISWA', status: '', admission_year: '' })
}

function onWindowClick(event: MouseEvent) {
  const target = event.target as Node
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
    statusOpen.value = false
  }
  if (yearDropdownRef.value && !yearDropdownRef.value.contains(target)) {
    yearOpen.value = false
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    statusOpen.value = false
    yearOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', onWindowClick)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', onWindowClick)
  window.removeEventListener('keydown', onKeydown)
})
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
      <!-- Modern Soft Search Textbox -->
      <div class="search-input-wrapper">
        <svg class="search-icon" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>

        <label class="visually-hidden" for="search-users">Cari nama, email, atau NIM</label>
        <input
          id="search-users"
          v-model="search"
          type="search"
          placeholder="Cari nama, email, atau NIM…"
          maxlength="150"
          autocomplete="off"
        >

        <button
          v-if="search"
          type="button"
          class="clear-button"
          aria-label="Hapus teks pencarian"
          @click="clearSearch"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <button type="submit" class="search-submit">Cari</button>
      </div>

      <!-- Modern Soft Custom Dropdown -->
      <div ref="dropdownRef" class="custom-dropdown">
        <label class="visually-hidden" id="status-filter-label">Filter status akun</label>
        <button
          type="button"
          class="dropdown-trigger"
          :class="{ active: statusOpen, 'has-filter': query.status !== '' }"
          aria-haspopup="listbox"
          :aria-expanded="statusOpen"
          aria-labelledby="status-filter-label"
          @click.stop="statusOpen = !statusOpen"
        >
          <span class="trigger-label">
            <span v-if="query.status" class="status-indicator" :class="query.status"></span>
            {{ currentStatusLabel }}
          </span>
          <svg
            class="chevron-icon"
            :class="{ rotated: statusOpen }"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <transition name="dropdown-pop">
          <div v-if="statusOpen" class="dropdown-menu" role="listbox" tabindex="-1">
            <button
              v-for="opt in statusOptions"
              :key="opt.value"
              type="button"
              role="option"
              :aria-selected="query.status === opt.value"
              class="dropdown-item"
              :class="{ selected: query.status === opt.value }"
              @click="selectStatus(opt.value)"
            >
              <span class="item-content">
                <span v-if="opt.value" class="status-indicator" :class="opt.value"></span>
                <span>{{ opt.label }}</span>
              </span>
              <svg
                v-if="query.status === opt.value"
                class="check-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
          </div>
        </transition>
      </div>

      <!-- Modern Soft Custom Dropdown for Angkatan (Mahasiswa only) -->
      <div v-if="query.role === 'MAHASISWA'" ref="yearDropdownRef" class="custom-dropdown">
        <label id="year-filter-label" class="visually-hidden">Filter tahun angkatan</label>
        <button
          type="button"
          class="dropdown-trigger"
          :class="{ active: yearOpen, 'has-filter': Boolean(query.admission_year) }"
          aria-haspopup="listbox"
          :aria-expanded="yearOpen"
          aria-labelledby="year-filter-label"
          @click.stop="yearOpen = !yearOpen"
        >
          <span class="trigger-label">
            {{ currentYearLabel }}
          </span>
          <svg
            class="chevron-icon"
            :class="{ rotated: yearOpen }"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <transition name="dropdown-pop">
          <div v-if="yearOpen" class="dropdown-menu" role="listbox" tabindex="-1">
            <button
              v-for="opt in yearOptions"
              :key="String(opt.value)"
              type="button"
              role="option"
              :aria-selected="String(query.admission_year || '') === String(opt.value)"
              class="dropdown-item"
              :class="{ selected: String(query.admission_year || '') === String(opt.value) }"
              @click="selectYear(opt.value)"
            >
              <span class="item-content">
                <span>{{ opt.label }}</span>
              </span>
              <svg
                v-if="String(query.admission_year || '') === String(opt.value)"
                class="check-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
          </div>
        </transition>
      </div>

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

/* Modern Soft Search Input Wrapper */
.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: .625rem;
  min-width: 260px;
  max-width: 440px;
  min-height: 44px;
  padding: .25rem .375rem .25rem .875rem;
  background: var(--canvas);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

.search-input-wrapper:hover {
  border-color: var(--border-hover);
  background: var(--panel);
}

.search-input-wrapper:focus-within {
  border-color: var(--accent);
  background: var(--panel);
  box-shadow: 0 0 0 3px rgba(103, 65, 207, 0.12), 0 1px 2px rgba(0, 0, 0, 0.04);
}

.search-icon {
  color: var(--muted);
  flex-shrink: 0;
  transition: color 150ms ease;
}

.search-input-wrapper:focus-within .search-icon {
  color: var(--accent);
}

.search-input-wrapper input {
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  padding: 0;
  min-height: auto;
  font-size: .9375rem;
  color: var(--ink);
  box-shadow: none;
}

.search-input-wrapper input::placeholder {
  color: var(--muted);
  font-size: .9375rem;
}

.search-input-wrapper input::-webkit-search-cancel-button {
  display: none;
}

.clear-button {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: color 150ms ease;
}

.clear-button:hover {
  background: transparent;
  color: var(--ink);
}

.search-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--accent);
  border-radius: 8px;
  min-height: 32px;
  padding: 0 .85rem;
  background: var(--accent);
  color: #ffffff;
  font-weight: 600;
  font-size: .875rem;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 150ms ease, border-color 150ms ease, transform 100ms ease;
}

.search-submit:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}

.search-submit:active {
  transform: scale(0.96);
}

/* Modern Soft Custom Dropdown */
.custom-dropdown {
  position: relative;
  width: 175px;
  user-select: none;
}

.dropdown-trigger {
  width: 100%;
  min-height: 44px;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  background: var(--canvas);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  font-size: .9375rem;
  font-weight: 500;
  color: var(--ink);
  cursor: pointer;
  transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

.dropdown-trigger:hover {
  border-color: var(--border-hover);
  background: var(--panel);
}

.dropdown-trigger.active,
.dropdown-trigger:focus-visible {
  outline: none;
  border-color: var(--accent);
  background: var(--panel);
  box-shadow: 0 0 0 3px rgba(103, 65, 207, 0.12), 0 1px 2px rgba(0, 0, 0, 0.04);
}

.dropdown-trigger.has-filter {
  font-weight: 600;
  color: var(--ink);
}

.trigger-label {
  display: flex;
  align-items: center;
  gap: .5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron-icon {
  color: var(--muted);
  flex-shrink: 0;
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), color 150ms ease;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
  color: var(--accent);
}

/* Floating Dropdown Menu Popover */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 100%;
  width: max-content;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.08);
  padding: .375rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: .55rem .75rem;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--ink);
  font-size: .9125rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background-color 120ms ease, color 120ms ease;
}

.dropdown-item:hover,
.dropdown-item:focus-visible {
  outline: none;
  background: var(--panel-hover);
  color: var(--accent);
}

.dropdown-item.selected {
  background: var(--panel-hover);
  color: var(--accent);
  font-weight: 600;
}

.item-content {
  display: flex;
  align-items: center;
  gap: .5rem;
}

.check-icon {
  color: var(--accent);
  flex-shrink: 0;
}

/* Status Indicator Dots */
.status-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.status-indicator.active {
  background: #16a34a;
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.2);
}

.status-indicator.inactive {
  background: #9ca3af;
}

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

/* Dropdown Animation */
.dropdown-pop-enter-active,
.dropdown-pop-leave-active {
  transition: opacity 140ms ease, transform 140ms cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-pop-enter-from,
.dropdown-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (max-width: 767px) {
  .filters { padding: 0 1rem; }
  .role-tabs { gap: 1rem; }
  .role-tabs button { font-size: .875rem; min-height: 48px; }
  .search-row { gap: .625rem; }
  .search-input-wrapper { max-width: none; flex-basis: 100%; }
  .custom-dropdown { flex: 1; width: auto; }
}
</style>
