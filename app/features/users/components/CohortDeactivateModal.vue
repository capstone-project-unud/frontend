<script setup lang="ts">
import type { User } from '~/types/user'
import { apiMessage } from '~/utils/format'

const props = defineProps<{
  open: boolean
  initialYear?: number | ''
}>()

const emit = defineEmits<{
  close: []
  success: [message: string]
}>()

const currentYear = new Date().getFullYear()
const selectedCohort = shallowRef<number>(props.initialYear ? Number(props.initialYear) : currentYear - 4)
const availableYears = computed(() => {
  const years: number[] = []
  for (let y = currentYear; y >= currentYear - 8; y--) {
    years.push(y)
  }
  return years
})

const loading = shallowRef(false)
const students = shallowRef<User[]>([])
const searchQuery = shallowRef('')
const selectedIds = shallowRef<Set<string>>(new Set())
const isExecuting = shallowRef(false)
const errorMessage = shallowRef('')
const confirmDialogOpen = shallowRef(false)

interface StudentAcademicStatus {
  hasActiveProject: boolean
  stageLabel: string
  stageType: 'completed' | 'in_progress' | 'revision' | 'inactive'
}

function getAcademicStatus(student: User): StudentAcademicStatus {
  if (!student.is_active) {
    return {
      hasActiveProject: false,
      stageLabel: 'Sudah Nonaktif',
      stageType: 'inactive',
    }
  }

  return {
    hasActiveProject: true,
    stageLabel: 'Kelulusan belum diverifikasi',
    stageType: 'in_progress',
  }
}

function isEligibleToDeactivate(student: User): boolean {
  if (!student.is_active) return false
  const status = getAcademicStatus(student)
  return !status.hasActiveProject
}

function getDeactivationCategory(student: User) {
  if (!student.is_active) {
    return {
      label: 'Sudah Nonaktif',
      type: 'inactive',
      tooltip: 'Akun mahasiswa ini sudah dalam status nonaktif',
    }
  }
  const status = getAcademicStatus(student)
  if (status.hasActiveProject) {
    return {
      label: 'Belum Boleh Dinonaktifkan',
      type: 'protected',
      tooltip: 'Kelulusan belum tercatat. Status lulus tidak dapat disimpulkan dari NIM atau angkatan.',
    }
  }
  return {
    label: 'Siap Dinonaktifkan',
    type: 'eligible',
    tooltip: 'Memenuhi syarat: Mahasiswa telah menyelesaikan yudisium/Capstone',
  }
}

async function loadCohortStudents() {
  if (!selectedCohort.value) return
  loading.value = true
  errorMessage.value = ''
  selectedIds.value = new Set()

  try {
    const data = await $fetch<{ items: User[] }>('/api/v1/users', {
      query: {
        role: 'MAHASISWA',
        admission_year: selectedCohort.value,
        limit: 500,
      },
    })
    students.value = data.items || []
    autoSelectEligible()
  } catch (err) {
    errorMessage.value = apiMessage(err)
    students.value = []
  } finally {
    loading.value = false
  }
}

function autoSelectEligible() {
  const next = new Set<string>()
  for (const s of students.value) {
    if (isEligibleToDeactivate(s)) {
      next.add(s.id)
    }
  }
  selectedIds.value = next
}

const cohortDropdownRef = shallowRef<HTMLElement | null>(null)
const cohortDropdownOpen = shallowRef(false)

function selectCohortYear(year: number) {
  selectedCohort.value = year
  cohortDropdownOpen.value = false
}

function onWindowClick(event: MouseEvent) {
  const target = event.target as Node
  if (cohortDropdownRef.value && !cohortDropdownRef.value.contains(target)) {
    cohortDropdownOpen.value = false
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    cohortDropdownOpen.value = false
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

watch(selectedCohort, () => {
  loadCohortStudents()
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    cohortDropdownOpen.value = false
    if (props.initialYear) {
      selectedCohort.value = Number(props.initialYear)
    }
    loadCohortStudents()
  } else {
    cohortDropdownOpen.value = false
    confirmDialogOpen.value = false
  }
})

const filteredStudents = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return students.value
  return students.value.filter(s =>
    s.full_name.toLowerCase().includes(q) ||
    (s.nim && s.nim.toLowerCase().includes(q)) ||
    s.email.toLowerCase().includes(q)
  )
})

const stats = computed(() => {
  const total = students.value.length
  let active = 0
  let eligible = 0
  let protectedCount = 0

  for (const s of students.value) {
    if (!s.is_active) continue
    active++
    const st = getAcademicStatus(s)
    if (st.hasActiveProject) {
      protectedCount++
    } else {
      eligible++
    }
  }

  return { total, active, eligible, protectedCount }
})

const isAllEligibleSelected = computed(() => {
  const candidates = filteredStudents.value.filter(isEligibleToDeactivate)
  if (candidates.length === 0) return false
  return candidates.every(s => selectedIds.value.has(s.id))
})

function toggleSelectAll() {
  const next = new Set(selectedIds.value)
  if (isAllEligibleSelected.value) {
    for (const s of filteredStudents.value) {
      next.delete(s.id)
    }
  } else {
    for (const s of filteredStudents.value) {
      if (isEligibleToDeactivate(s)) {
        next.add(s.id)
      }
    }
  }
  selectedIds.value = next
}

function toggleStudent(id: string) {
  const student = students.value.find(s => s.id === id)
  if (!student || !isEligibleToDeactivate(student)) return

  const next = new Set(selectedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  selectedIds.value = next
}

function handleOpenConfirm() {
  if (selectedIds.value.size === 0) return
  confirmDialogOpen.value = true
}

async function executeDeactivation() {
  const targetIds = Array.from(selectedIds.value)
  if (targetIds.length === 0 || isExecuting.value) return

  isExecuting.value = true
  errorMessage.value = ''

  try {
    const res = await $fetch<{ updated_count: number }>('/api/v1/users/batch-status', {
      method: 'PATCH',
      body: {
        user_ids: targetIds,
        is_active: false,
      },
    })

    confirmDialogOpen.value = false
    emit('success', `Berhasil menonaktifkan ${res.updated_count} akun mahasiswa Angkatan ${selectedCohort.value}. Mahasiswa yang masih memiliki tanggungan tetap aktif.`)
    emit('close')
  } catch (err) {
    errorMessage.value = apiMessage(err)
    confirmDialogOpen.value = false
  } finally {
    isExecuting.value = false
  }
}
</script>

<template>
  <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="cohort-deactivate-title">
      <!-- Header -->
      <div class="modal-header">
        <div class="header-icon-danger">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="18" y1="8" x2="23" y2="13"></line>
            <line x1="23" y1="8" x2="18" y2="13"></line>
          </svg>
        </div>
        <div class="header-text">
          <h2 id="cohort-deactivate-title">Deaktivasi Massal Angkatan</h2>
          <p>Nonaktifkan akses akun mahasiswa yang telah lulus secara aman dengan proteksi otomatis.</p>
        </div>
        <button type="button" class="close-btn" aria-label="Tutup modal" @click="emit('close')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Error Feedback -->
        <p v-if="errorMessage" class="notice error" role="alert">{{ errorMessage }}</p>

        <!-- Cohort Selector & Stats -->
        <div class="controls-row">
          <div class="field-cohort">
            <label id="cohort-select-label">Pilih Tahun Angkatan:</label>
            <div ref="cohortDropdownRef" class="custom-dropdown">
              <button
                type="button"
                class="dropdown-trigger"
                :class="{ active: cohortDropdownOpen }"
                aria-haspopup="listbox"
                :aria-expanded="cohortDropdownOpen"
                aria-labelledby="cohort-select-label"
                @click.stop="cohortDropdownOpen = !cohortDropdownOpen"
              >
                <span class="trigger-label">
                  Angkatan {{ selectedCohort }} ({{ currentYear - selectedCohort }} tahun lalu)
                </span>
                <svg
                  class="chevron-icon"
                  :class="{ rotated: cohortDropdownOpen }"
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
                <div v-if="cohortDropdownOpen" class="dropdown-menu" role="listbox" tabindex="-1">
                  <button
                    v-for="year in availableYears"
                    :key="year"
                    type="button"
                    role="option"
                    :aria-selected="selectedCohort === year"
                    class="dropdown-item"
                    :class="{ selected: selectedCohort === year }"
                    @click="selectCohortYear(year)"
                  >
                    <span class="item-content">
                      <span>Angkatan {{ year }} ({{ currentYear - year }} tahun lalu)</span>
                    </span>
                    <svg
                      v-if="selectedCohort === year"
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
          </div>

          <div class="stats-summary">
            <div class="stat-box">
              <span class="label">Total Mahasiswa</span>
              <strong class="value">{{ stats.total }}</strong>
            </div>
            <div class="stat-box success">
              <span class="label">Siap Dinonaktifkan</span>
              <strong class="value">{{ stats.eligible }}</strong>
            </div>
            <div class="stat-box warning">
              <span class="label">Belum Boleh Dinonaktifkan</span>
              <strong class="value">{{ stats.protectedCount }}</strong>
            </div>
          </div>
        </div>

        <!-- Search Bar within Modal -->
        <div class="table-search-row">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Cari nama atau NIM di angkatan ini..."
            class="mini-search"
          >
          <span class="selection-count">
            Terpilih: <strong>{{ selectedIds.size }}</strong> dari {{ stats.eligible }} akun siap dinonaktifkan
          </span>
        </div>

        <!-- Student Audit Table -->
        <div class="table-scroll">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <span>Memuat data mahasiswa Angkatan {{ selectedCohort }}...</span>
          </div>

          <div v-else-if="filteredStudents.length === 0" class="empty-state">
            <p>Tidak ada mahasiswa ditemukan untuk Angkatan {{ selectedCohort }}.</p>
          </div>

          <table v-else class="audit-table">
            <thead>
              <tr>
                <th class="col-check">
                  <input
                    type="checkbox"
                    :checked="isAllEligibleSelected"
                    title="Pilih semua yang siap dinonaktifkan"
                    @change="toggleSelectAll"
                  >
                </th>
                <th>NIM</th>
                <th>Nama Mahasiswa</th>
                <th>Status Capstone</th>
                <th>Kategori Deaktivasi</th>
                <th>Status Akun</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="s in filteredStudents"
                :key="s.id"
                :class="{
                  selected: selectedIds.has(s.id),
                  'is-protected': !isEligibleToDeactivate(s) && s.is_active,
                  'is-inactive': !s.is_active
                }"
              >
                <td class="col-check">
                  <input
                    type="checkbox"
                    :checked="selectedIds.has(s.id)"
                    :disabled="!isEligibleToDeactivate(s)"
                    :title="!isEligibleToDeactivate(s) ? 'Belum boleh dinonaktifkan: Mahasiswa masih memiliki tanggungan Capstone aktif' : 'Pilih untuk dinonaktifkan'"
                    @change="toggleStudent(s.id)"
                  >
                </td>
                <td class="col-nim">{{ s.nim || '—' }}</td>
                <td class="col-name">
                  <strong>{{ s.full_name }}</strong>
                  <span class="sub-email">{{ s.email }}</span>
                </td>
                <td class="col-stage">
                  <span
                    class="stage-badge"
                    :class="getAcademicStatus(s).stageType"
                  >
                    {{ getAcademicStatus(s).stageLabel }}
                  </span>
                </td>
                <td class="col-category">
                  <span
                    class="category-badge"
                    :class="getDeactivationCategory(s).type"
                    :title="getDeactivationCategory(s).tooltip"
                  >
                    {{ getDeactivationCategory(s).label }}
                  </span>
                </td>
                <td class="col-status">
                  <span class="account-tag" :class="s.is_active ? 'active' : 'inactive'">
                    {{ s.is_active ? 'Aktif' : 'Nonaktif' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="modal-footer">
        <div class="footer-info">
          <span v-if="selectedIds.size > 0">
            Akan menonaktifkan <strong>{{ selectedIds.size }}</strong> mahasiswa.
            <span v-if="stats.protectedCount > 0" class="safe-note">
              ({{ stats.protectedCount }} mahasiswa tanggungan aktif aman terlindungi)
            </span>
          </span>
          <span v-else class="text-muted">
            Pilih minimal 1 mahasiswa untuk dinonaktifkan.
          </span>
        </div>
        <div class="footer-buttons">
          <button type="button" class="btn-cancel" @click="emit('close')">
            Batal
          </button>
          <button
            type="button"
            class="btn-danger-submit"
            :disabled="selectedIds.size === 0 || isExecuting"
            @click="handleOpenConfirm"
          >
            <span v-if="isExecuting">Memproses...</span>
            <span v-else>Nonaktifkan ({{ selectedIds.size }}) Mahasiswa</span>
          </button>
        </div>
      </div>

      <!-- Nested Double Confirmation Dialog -->
      <div v-if="confirmDialogOpen" class="confirm-nested-backdrop" @click.self="confirmDialogOpen = false">
        <div class="confirm-nested-card">
          <div class="confirm-icon-circle">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <h3>Konfirmasi Deaktivasi Angkatan {{ selectedCohort }}</h3>
          <p>
            Anda akan menonaktifkan akses login untuk <strong>{{ selectedIds.size }} mahasiswa</strong>.
            Sesi aktif mereka akan segera dicabut.
          </p>
          <div v-if="stats.protectedCount > 0" class="confirm-safe-box">
            Perhatian: <strong>{{ stats.protectedCount }} mahasiswa</strong> yang masih memiliki tanggungan pengerjaan atau revisi otomatis diproteksi dan <strong>tidak akan</strong> dinonaktifkan.
          </div>
          <div class="confirm-actions">
            <button type="button" class="btn-cancel" :disabled="isExecuting" @click="confirmDialogOpen = false">
              Kembali
            </button>
            <button type="button" class="btn-confirm-final" :disabled="isExecuting" @click="executeDeactivation">
              {{ isExecuting ? 'Menonaktifkan...' : 'Ya, Nonaktifkan Sekarang' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(21, 19, 31, 0.45);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1.5rem;
}

.modal-card {
  width: min(840px, 100%);
  max-height: calc(100dvh - 3rem);
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: 0 24px 64px -12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.modal-header {
  padding: 1.5rem 2rem 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  border-bottom: 1px solid var(--line);
}

.header-icon-danger {
  width: 28px;
  height: 28px;
  color: var(--error);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: .15rem;
}

.header-text {
  flex: 1;
}

.header-text h2 {
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: -.02em;
  color: var(--ink);
}

.header-text p {
  color: var(--muted);
  font-size: .875rem;
  margin-top: .25rem;
  line-height: 1.4;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 150ms ease;
}

.close-btn:hover {
  background: transparent;
  color: var(--ink);
}

.modal-body {
  padding: 1.5rem 2rem;
  overflow-y: auto;
  scrollbar-width: thin;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 10;
}

.field-cohort {
  display: flex;
  flex-direction: column;
  gap: .4rem;
}

.field-cohort label {
  font-size: .875rem;
  font-weight: 600;
  color: var(--ink);
}

/* Custom Floating Popover Dropdown */
.custom-dropdown {
  position: relative;
  width: 290px;
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
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  scrollbar-width: thin;
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
  gap: .75rem;
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

.dropdown-pop-enter-active,
.dropdown-pop-leave-active {
  transition: opacity 140ms ease, transform 140ms cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-pop-enter-from,
.dropdown-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
}

.stats-summary {
  display: flex;
  align-items: center;
  gap: .75rem;
  flex-wrap: wrap;
}

.stat-box {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: .5rem .85rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-box.success {
  background: var(--panel);
  border-color: var(--border);
}
.stat-box.success .value {
  color: var(--success);
}

.stat-box.warning {
  background: var(--panel);
  border-color: var(--border);
}
.stat-box.warning .value {
  color: var(--warning);
}

.stat-box .label {
  font-size: .75rem;
  font-weight: 600;
  color: var(--muted);
}

.stat-box .value {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--ink);
}

/* Search row */
.table-search-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.mini-search {
  max-width: 320px;
  min-height: 38px;
  padding: .45rem .85rem;
  font-size: .875rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--canvas);
  color: var(--ink);
}

.selection-count {
  font-size: .875rem;
  color: var(--muted);
}

.selection-count strong {
  color: var(--error);
}

/* Audit Table */
.table-scroll {
  border: 1px solid var(--line);
  border-radius: 14px;
  max-height: 280px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.audit-table {
  width: 100%;
  border-collapse: collapse;
  font-size: .875rem;
  text-align: left;
}

.audit-table th {
  background: var(--canvas);
  padding: .75rem 1rem;
  font-size: .75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--muted);
  position: sticky;
  top: 0;
  z-index: 2;
  border-bottom: 1px solid var(--line);
}

.audit-table td {
  padding: .75rem 1rem;
  border-bottom: 1px solid var(--line);
  vertical-align: middle;
  color: var(--ink);
}

.audit-table tr:hover {
  background: var(--panel-hover);
}

.audit-table tr.selected {
  background: var(--panel-hover);
}

.audit-table tr.is-protected {
  opacity: .75;
}

.col-check {
  width: 44px;
  text-align: center;
}

.col-nim {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--ink);
}

.col-name strong {
  display: block;
  font-weight: 600;
  color: var(--ink);
}

.sub-email {
  display: block;
  font-size: .75rem;
  color: var(--muted);
}

.stage-badge {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  padding: .2rem .55rem;
  border-radius: 6px;
  font-size: .785rem;
  font-weight: 600;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--ink);
}

.stage-badge.completed {
  border-color: var(--success);
  color: var(--success);
}

.stage-badge.in_progress {
  border-color: var(--warning);
  color: var(--warning);
}

.stage-badge.revision {
  border-color: var(--error);
  color: var(--error);
}

.stage-badge.inactive {
  border-color: var(--border);
  color: var(--muted);
}

.category-badge {
  display: inline-flex;
  align-items: center;
  padding: .2rem .55rem;
  border-radius: 6px;
  font-size: .785rem;
  font-weight: 600;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--ink);
  white-space: nowrap;
}

.category-badge.eligible {
  border-color: var(--success);
  color: var(--success);
}

.category-badge.protected {
  border-color: var(--warning);
  color: var(--warning);
}

.category-badge.inactive {
  border-color: var(--border);
  color: var(--muted);
}

.account-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: .75rem;
  font-weight: 600;
  background: transparent;
  border: 1px solid var(--border);
}

.account-tag.active {
  border-color: var(--success);
  color: var(--success);
}

.account-tag.inactive {
  border-color: var(--border);
  color: var(--muted);
}

.loading-state, .empty-state {
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .75rem;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--line);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal Footer */
.modal-footer {
  padding: 1.25rem 2rem;
  border-top: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  background: var(--canvas);
}

.footer-info {
  font-size: .875rem;
  color: var(--ink);
}

.safe-note {
  color: var(--success);
  font-weight: 600;
}

.footer-buttons {
  display: flex;
  align-items: center;
  gap: .75rem;
}

.btn-cancel {
  min-height: 44px;
  padding: .5rem 1.15rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--panel);
  color: var(--ink);
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel:hover {
  background: var(--panel-hover);
}

.btn-danger-submit {
  min-height: 44px;
  padding: .5rem 1.35rem;
  border: none;
  border-radius: 12px;
  background: var(--error);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
  box-shadow: 0 2px 6px rgba(163, 39, 50, 0.25);
}

.btn-danger-submit:hover:not(:disabled) {
  background: #8b1e28;
}

.btn-danger-submit:disabled {
  opacity: .5;
  cursor: not-allowed;
  box-shadow: none;
}

/* Nested Confirmation Dialog */
.confirm-nested-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 12, 25, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  padding: 1.5rem;
}

.confirm-nested-card {
  width: min(440px, 100%);
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
}

.confirm-icon-circle {
  width: 32px;
  height: 32px;
  margin: 0 auto 1rem;
  background: transparent;
  border: 0;
  color: var(--error);
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-nested-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ink);
}

.confirm-nested-card p {
  font-size: .9125rem;
  color: var(--muted);
  margin-top: .75rem;
  line-height: 1.5;
}

.confirm-safe-box {
  margin-top: 1rem;
  padding: .75rem 1rem;
  background: var(--panel);
  border: 1px solid var(--border);
  border-left: 3px solid var(--success);
  border-radius: 10px;
  font-size: .825rem;
  color: var(--ink);
  text-align: left;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: .75rem;
  margin-top: 1.5rem;
}

.btn-confirm-final {
  min-height: 44px;
  padding: .5rem 1.25rem;
  border: none;
  border-radius: 12px;
  background: #dc2626;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.btn-confirm-final:hover {
  background: #b91c1c;
}
</style>

