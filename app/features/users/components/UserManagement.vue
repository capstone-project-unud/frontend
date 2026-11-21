<script setup lang="ts">
import WorkspaceStatistics from '~/components/workspace/WorkspaceStatistics.vue'
import { useUsers } from '../composables/useUsers'
import UserFilters from './UserFilters.vue'
import UserTable from './UserTable.vue'
import StudentForm from './StudentForm.vue'
import LecturerForm from './LecturerForm.vue'
import AdminForm from './AdminForm.vue'
import StudentImportModal from './StudentImportModal.vue'
import LecturerImportModal from './LecturerImportModal.vue'
import CohortDeactivateModal from './CohortDeactivateModal.vue'
import type { User, UserInput } from '~/types/user'
import { apiMessage } from '~/utils/format'
import { downloadStudentTemplate, exportStudentsToCsv } from '~/utils/studentExportImport'
import { downloadLecturerTemplate, exportLecturersToExcel } from '~/utils/lecturerExportImport'

const users = useUsers()
const { data: list, status: listStatus, error: listError } = users.list
const { data: stats, error: statsError } = users.stats
const { message, mutationError, saving, page, params } = users

type AccountForm = 'MAHASISWA' | 'DOSEN' | 'ADMIN' | 'KOORDINATOR_TA' | 'TU' | 'KOPRODI'
const activeForm = shallowRef<AccountForm | null>(null)
const importModalOpen = shallowRef(false)
const lecturerImportModalOpen = shallowRef(false)
const cohortModalOpen = shallowRef(false)
const selected = shallowRef<User | null>(null)
const statusTarget = shallowRef<User | null>(null)
const confirmDialog = useTemplateRef<HTMLDialogElement>('confirmDialog')
const pages = computed(() => Math.max(1, Math.ceil((list.value?.total || 0) / 12)))

function handleCohortSuccess(msg: string) {
  message.value = msg
  users.refresh()
}

function openCreate(role: AccountForm) {
  mutationError.value = ''
  selected.value = null
  activeForm.value = role
}

function edit(user: User | null) {
  mutationError.value = ''
  selected.value = user
  if (!user) {
    activeForm.value = (params.value.role as AccountForm) || 'MAHASISWA'
    return
  }
  if (user.roles.includes('ADMIN')) activeForm.value = 'ADMIN'
  else if (user.roles.includes('DOSEN')) activeForm.value = 'DOSEN'
  else if (user.roles.includes('KOORDINATOR_TA')) activeForm.value = 'KOORDINATOR_TA'
  else if (user.roles.includes('TU')) activeForm.value = 'TU'
  else activeForm.value = 'MAHASISWA'
}

function closeForm() {
  activeForm.value = null
  selected.value = null
}

const exporting = shallowRef(false)

async function fetchFilteredUsers(expectedRole: 'MAHASISWA' | 'DOSEN') {
  const collected: User[] = []
  let currentPage = 1
  while (true) {
    const res = await $fetch<{ items: User[]; total: number }>('/api/v1/users', {
      query: {
        q: params.value.q,
        role: expectedRole,
        status: params.value.status,
        admission_year: expectedRole === 'MAHASISWA' ? params.value.admission_year : '',
        page: currentPage,
        limit: 500,
      },
    })
    collected.push(...res.items)
    if (collected.length >= res.total || res.items.length === 0) break
    currentPage++
  }
  return collected
}

async function handleExportStudents() {
  if (exporting.value) return
  exporting.value = true
  mutationError.value = ''
  try {
    const students = await fetchFilteredUsers('MAHASISWA')
    if (!students.length) {
      message.value = 'Tidak ada data mahasiswa untuk diekspor.'
      return
    }
    exportStudentsToCsv(students)
  } catch (e) {
    mutationError.value = apiMessage(e)
  } finally {
    exporting.value = false
  }
}

async function handleExportLecturers() {
  if (exporting.value) return
  exporting.value = true
  mutationError.value = ''
  try {
    const lecturers = await fetchFilteredUsers('DOSEN')
    if (!lecturers.length) {
      message.value = 'Tidak ada data dosen untuk diekspor.'
      return
    }
    exportLecturersToExcel(lecturers)
  } catch (e) {
    mutationError.value = apiMessage(e)
  } finally {
    exporting.value = false
  }
}

async function save(input: UserInput) {
  if (await users.save(input, selected.value)) closeForm()
}

async function resetPassword(password: string) {
  if (selected.value && await users.resetPassword(selected.value, password)) closeForm()
}

async function confirmStatus(user: User) {
  mutationError.value = ''
  statusTarget.value = user
  await nextTick()
  confirmDialog.value?.showModal()
}

function cancelStatus() {
  if (!saving.value) {
    confirmDialog.value?.close()
    statusTarget.value = null
  }
}

async function changeStatus() {
  if (statusTarget.value && await users.setStatus(statusTarget.value)) {
    confirmDialog.value?.close()
    statusTarget.value = null
  }
}
</script>

<template>
  <section aria-labelledby="workspace-page-title">

    <p v-if="statsError" class="notice error" role="alert">
      Ringkasan belum dapat dimuat. <button type="button" class="button secondary btn-retry" @click="users.stats.refresh()">Coba lagi</button>
    </p>

    <div class="panel workspace-statistics-panel">
      <WorkspaceStatistics label="Ringkasan pengguna" :items="[
        { label: 'Total pengguna', value: stats?.total },
        { label: 'Mahasiswa', value: stats?.students },
        { label: 'Dosen', value: stats?.lecturers },
        { label: 'Akun aktif', value: stats?.active },
      ]" />
    </div>

    <p v-if="message" class="notice success feedback" role="status">{{ message }}</p>
    <p v-if="mutationError && !activeForm && !statusTarget" class="notice error feedback" role="alert">{{ mutationError }}</p>

    <div class="panel users-panel">
      <div class="workspace-panel-header">
        <div class="workspace-panel-title">
          <h2>Daftar pengguna</h2>
          <span>{{ list?.total ?? '—' }} pengguna</span>
        </div>
        <div v-if="params.role" class="workspace-panel-actions">
          <template v-if="params.role === 'MAHASISWA'">
            <button class="button primary" type="button" @click="openCreate('MAHASISWA')">
              <span aria-hidden="true" class="plus">+</span> Tambah Mahasiswa
            </button>
            <button class="button secondary" type="button" @click="importModalOpen = true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Import
            </button>
            <button
              class="button secondary"
              type="button"
              :disabled="exporting || !list?.items.length"
              :title="!list?.items.length ? 'Belum ada data mahasiswa untuk diekspor' : 'Ekspor data mahasiswa ke Excel (.xlsx)'"
              @click="handleExportStudents"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Ekspor
            </button>
            <button class="button template" type="button" @click="downloadStudentTemplate">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Unduh Template
            </button>
            <button
              class="button danger"
              type="button"
              title="Deaktivasi akun mahasiswa dengan proteksi tanggungan aktif"
              @click="cohortModalOpen = true"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="18" y1="8" x2="23" y2="13"></line>
                <line x1="23" y1="8" x2="18" y2="13"></line>
              </svg>
              Deaktivasi Akun
            </button>
          </template>
          <template v-else-if="params.role === 'DOSEN'">
            <button class="button primary" type="button" @click="openCreate('DOSEN')">
              <span aria-hidden="true" class="plus">+</span> Tambah Dosen
            </button>
            <button class="button secondary" type="button" @click="lecturerImportModalOpen = true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Import
            </button>
            <button
              class="button secondary"
              type="button"
              :disabled="exporting || !list?.items.length"
              :title="!list?.items.length ? 'Belum ada data dosen untuk diekspor' : 'Ekspor data dosen ke Excel (.xlsx)'"
              @click="handleExportLecturers"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Ekspor
            </button>
            <button class="button template" type="button" @click="downloadLecturerTemplate">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Unduh Template
            </button>
          </template>
          <button v-else-if="params.role === 'KOPRODI' || params.role === 'ADMIN' || params.role === 'KOORDINATOR_TA' || params.role === 'TU'" class="button primary" type="button" @click="openCreate(params.role)">
            <span aria-hidden="true" class="plus">+</span> Tambah {{ params.role === 'KOPRODI' ? 'Koprodi' : params.role === 'TU' ? 'Tata usaha' : params.role === 'KOORDINATOR_TA' ? 'Koordinator Capstone' : 'Admin' }}
          </button>
        </div>
      </div>

      <UserFilters :query="params" @change="users.filters" />

      <div v-if="listStatus === 'pending'" class="empty-state" role="status">
        <p>Memuat daftar pengguna…</p>
      </div>

      <div v-else-if="listError" class="empty-state">
        <h3>Daftar belum dapat dimuat</h3>
        <p>{{ apiMessage(listError) }}</p>
        <button class="button secondary" @click="users.refresh">Coba lagi</button>
      </div>

      <UserTable v-else-if="list?.items.length" :users="list.items" :role="params.role" :busy="saving" @edit="edit" @status="confirmStatus" />

      <div v-else class="empty-state">
        <h3>{{ params.q || params.status || params.admission_year ? 'Tidak ada pengguna yang cocok' : 'Belum ada pengguna' }}</h3>
        <p>{{ params.q || params.status || params.admission_year ? 'Coba kata kunci lain atau atur ulang filter Anda.' : 'Data pengguna untuk peran ini belum tersedia dalam sistem.' }}</p>
      </div>

      <div class="workspace-pagination">
        <span>{{ list?.total ? `Halaman ${page} dari ${pages}` : 'Tidak ada hasil' }}</span>
        <div>
          <button class="button workspace-pager" :disabled="page <= 1 || listStatus === 'pending'" aria-label="Halaman sebelumnya" @click="page--">
            Sebelumnya
          </button>
          <button class="button workspace-pager" :disabled="page >= pages || listStatus === 'pending'" aria-label="Halaman berikutnya" @click="page++">
            Berikutnya
          </button>
        </div>
      </div>
    </div>

    <!-- Formulir Terpisah Berdasarkan Peran -->
    <StudentForm
      v-if="activeForm === 'MAHASISWA'"
      :user="selected"
      :busy="saving"
      :error="mutationError"
      @save="save"
      @reset="resetPassword"
      @close="closeForm"
    />
    <LecturerForm
      v-else-if="activeForm === 'DOSEN' || activeForm === 'KOPRODI'" :initial-koprodi="activeForm === 'KOPRODI'"
      :user="selected"
      :busy="saving"
      :error="mutationError"
      @save="save"
      @reset="resetPassword"
      @close="closeForm"
    />
    <AdminForm
      v-else-if="activeForm === 'ADMIN' || activeForm === 'TU' || activeForm === 'KOORDINATOR_TA'"
      :account-role="activeForm"
      :user="selected"
      :busy="saving"
      :error="mutationError"
      @save="save"
      @reset="resetPassword"
      @close="closeForm"
    />

    <StudentImportModal
      v-if="importModalOpen"
      @close="importModalOpen = false"
      @imported="users.refresh"
    />

    <LecturerImportModal
      v-if="lecturerImportModalOpen"
      @close="lecturerImportModalOpen = false"
      @imported="users.refresh"
    />

    <CohortDeactivateModal
      :open="cohortModalOpen"
      :initial-year="params.admission_year ? Number(params.admission_year) : undefined"
      @close="cohortModalOpen = false"
      @success="handleCohortSuccess"
    />

    <dialog v-if="statusTarget" ref="confirmDialog" class="confirm-dialog" aria-labelledby="status-title" @cancel.prevent="cancelStatus">
      <h2 id="status-title">{{ statusTarget.is_active ? 'Nonaktifkan akun?' : 'Aktifkan akun?' }}</h2>
      <p>{{ statusTarget.full_name }} {{ statusTarget.is_active ? 'akan kehilangan akses ke sistem. Data dan riwayatnya tetap tersimpan.' : 'akan dapat masuk kembali menggunakan akun yang sama.' }}</p>
      <p v-if="mutationError" class="notice error" role="alert">{{ mutationError }}</p>
      <div>
        <button class="button secondary" :disabled="saving" @click="cancelStatus">Batal</button>
        <button class="button" :class="statusTarget.is_active ? 'danger' : 'primary'" :disabled="saving" @click="changeStatus">
          {{ saving ? 'Menyimpan…' : statusTarget.is_active ? 'Nonaktifkan akun' : 'Aktifkan akun' }}
        </button>
      </div>
    </dialog>
  </section>
</template>

<style scoped>
.plus { font-size: 1.25rem; font-weight: 400; line-height: 1; }
.feedback { margin-bottom: 1.25rem; }
.btn-retry { min-height: 32px; padding: .25rem .75rem; font-size: .875rem; margin-left: .5rem; }
.users-panel { min-width: 0; container: users / inline-size; }
.confirm-dialog {
  width: min(460px, calc(100% - 2rem));
  padding: 2rem;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--panel);
  color: var(--ink);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45);
}
.confirm-dialog::backdrop { background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(4px); }
.confirm-dialog h2 { font-size: 1.5rem; font-weight: 550; letter-spacing: -.02em; }
.confirm-dialog p { margin-top: 1rem; font-size: 1rem; line-height: 1.65; color: var(--muted); }
.confirm-dialog > div { display: flex; justify-content: flex-end; gap: .75rem; margin-top: 1.5rem; }

</style>
