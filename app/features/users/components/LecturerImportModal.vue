<script setup lang="ts">
import WorkspaceFilePicker from '~/components/workspace/WorkspaceFilePicker.vue'
import { downloadLecturerTemplate, parseLecturerFile, type ParsedLecturerRow } from '~/utils/lecturerExportImport'
import type { Role, User } from '~/types/user'
import { apiMessage } from '~/utils/format'

const emit = defineEmits<{ close: []; imported: [] }>()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')

const fileName = shallowRef('')
const parsedRows = shallowRef<ParsedLecturerRow[]>([])
const isImporting = shallowRef(false)
const progressCount = shallowRef(0)
const importError = shallowRef('')
const createdCount = shallowRef(0)
const updatedCount = shallowRef(0)
const skippedCount = shallowRef(0)
const failedItems = shallowRef<{ identifier: string; reason: string }[]>([])
const completed = shallowRef(false)

const validRows = computed(() => parsedRows.value.filter(r => r.isValid))
const invalidRows = computed(() => parsedRows.value.filter(r => !r.isValid))

onMounted(() => dialog.value?.showModal())
onBeforeUnmount(() => dialog.value?.close())

function close() {
  if (!isImporting.value) emit('close')
}

async function processFile(file: File) {
  fileName.value = file.name
  importError.value = ''
  completed.value = false
  createdCount.value = 0
  updatedCount.value = 0
  skippedCount.value = 0
  failedItems.value = []

  try {
    parsedRows.value = await parseLecturerFile(file)
    if (parsedRows.value.length === 0) {
      importError.value = 'File kosong atau format kolom tidak sesuai template.'
    }
  } catch {
    importError.value = 'Gagal membaca isi file. Pastikan format file Excel (.xlsx, .xls) atau .csv valid.'
  }
}

function matchesLecturer(u: User, row: ParsedLecturerRow) {
  if (u.email.toLowerCase() === row.email.toLowerCase()) return true
  if (row.nip && u.nip === row.nip) return true
  if (row.nidn && u.nidn === row.nidn) return true
  return false
}

async function findExistingLecturer(row: ParsedLecturerRow): Promise<User | undefined> {
  for (const term of [row.email, row.nip, row.nidn]) {
    if (!term) continue
    const searchRes = await $fetch<{ items: User[]; total: number }>('/api/v1/users', {
      query: { q: term, limit: 20 },
    })
    const matched = (searchRes.items || []).find(u => matchesLecturer(u, row))
    if (matched) return matched
  }
  return undefined
}

async function startImport() {
  if (validRows.value.length === 0 || isImporting.value) return

  isImporting.value = true
  progressCount.value = 0
  createdCount.value = 0
  updatedCount.value = 0
  skippedCount.value = 0
  failedItems.value = []
  importError.value = ''

  const rowsToImport = validRows.value

  for (let i = 0; i < rowsToImport.length; i++) {
    const row = rowsToImport[i]
    if (!row) continue
    progressCount.value = i + 1

    try {
      // 1. Cek keberadaan dosen berdasarkan email institusi atau NIP/NIDN tanpa filter tab agar dosen Koordinator Capstone tetap ditemukan
      const existing = await findExistingLecturer(row)

      const targetRoles: Role[] = ['DOSEN']
      if (row.is_coordinator) {
        targetRoles.push('KOORDINATOR_TA')
      }

      if (existing?.roles.includes('KOPRODI')) targetRoles.push('KOPRODI')
      if (existing) {
        if (!existing.roles.includes('DOSEN')) {
          failedItems.value.push({
            identifier: row.nip || row.nidn || row.email,
            reason: 'Email, NIP, atau NIDN sudah digunakan akun non-dosen.',
          })
          continue
        }

        const currentHasCoordinator = existing.roles.includes('KOORDINATOR_TA')
        const hasChanges =
          existing.full_name !== row.full_name ||
          existing.email.toLowerCase() !== row.email.toLowerCase() ||
          currentHasCoordinator !== row.is_coordinator ||
          (existing.nip || '') !== row.nip ||
          (existing.nidn || '') !== row.nidn ||
          (existing.phone || '') !== row.phone ||
          (existing.expertise || '') !== row.expertise

        if (hasChanges) {
          await $fetch(`/api/v1/users/${existing.id}`, {
            method: 'PUT',
            body: {
              full_name: row.full_name,
              email: row.email,
              roles: targetRoles,
              nip: row.nip || null,
              nidn: row.nidn || null,
              phone: row.phone,
              expertise: row.expertise,
              nim: null,
              admission_year: null,
            },
          })
          updatedCount.value++
        } else {
          skippedCount.value++
        }
      } else {
        if (!row.password) {
          failedItems.value.push({
            identifier: row.nip || row.nidn || row.email,
            reason: 'Kata sandi awal wajib diisi untuk akun dosen baru (minimal 12 karakter).',
          })
          continue
        }

        // Buat akun dosen baru
        await $fetch('/api/v1/users', {
          method: 'POST',
          body: {
            full_name: row.full_name,
            email: row.email,
            roles: targetRoles,
            nip: row.nip || null,
            nidn: row.nidn || null,
            phone: row.phone,
            expertise: row.expertise,
            password: row.password,
            nim: null,
            admission_year: null,
          },
        })
        createdCount.value++
      }
    } catch (err) {
      failedItems.value.push({
        identifier: row.nip || row.nidn || row.email,
        reason: apiMessage(err),
      })
    }
  }

  isImporting.value = false
  completed.value = true
  emit('imported')
}
</script>

<template>
  <dialog ref="dialog" class="import-dialog" aria-labelledby="lecturer-import-title" @cancel.prevent="close">
    <div class="dialog-header">
      <div class="header-text">
        <h2 id="lecturer-import-title">Import Data Dosen</h2>
        <p class="dialog-intro">
          Unggah file Excel (.xlsx) atau .csv untuk menambahkan atau memperbarui data dosen program studi secara massal.
        </p>
      </div>
      <button class="close-button" type="button" aria-label="Tutup modal import" :disabled="isImporting" @click="close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="dialog-body">
      <!-- Unduh Template Banner -->
      <div class="template-banner">
        <div class="banner-info">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          <div>
            <strong>Gunakan Template Excel Resmi Dosen</strong>
            <span>Pastikan kolom NIP, NIDN, Nama Lengkap & Gelar, Email Institusi, Telepon, Keahlian, dan Peran Koordinator Capstone sesuai format.</span>
          </div>
        </div>
        <button type="button" class="template-btn" @click="downloadLecturerTemplate">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Unduh Template Dosen
        </button>
      </div>

      <WorkspaceFilePicker v-if="!isImporting && !completed" id="lecturer-import-file" accept=".xlsx,.xls,.csv" :file-name="fileName" :disabled="isImporting" @select="processFile" />

      <!-- Progress Section -->
      <div v-if="isImporting" class="progress-box">
        <div class="progress-header">
          <span>Memproses data dosen...</span>
          <strong>{{ progressCount }} / {{ validRows.length }}</strong>
        </div>
        <div class="progress-bar-bg">
          <div
            class="progress-bar-fill"
            :style="{ width: `${(progressCount / (validRows.length || 1)) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Error Message -->
      <p v-if="importError" class="notice error" role="alert">{{ importError }}</p>

      <!-- Completed Result Summary -->
      <div v-if="completed" class="result-box">
        <div class="result-summary-grid">
          <div class="result-card created">
            <span class="result-num">{{ createdCount }}</span>
            <span class="result-label">Akun Baru Dibuat</span>
          </div>
          <div class="result-card updated">
            <span class="result-num">{{ updatedCount }}</span>
            <span class="result-label">Data Diperbarui</span>
          </div>
          <div class="result-card skipped">
            <span class="result-num">{{ skippedCount }}</span>
            <span class="result-label">Dilewati (Sama)</span>
          </div>
          <div class="result-card failed">
            <span class="result-num">{{ failedItems.length }}</span>
            <span class="result-label">Gagal Disimpan</span>
          </div>
        </div>

        <div v-if="failedItems.length > 0" class="failed-list">
          <h4>Daftar Baris yang Gagal:</h4>
          <ul>
            <li v-for="(f, idx) in failedItems" :key="idx">
              <strong>{{ f.identifier }}</strong>: {{ f.reason }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Preview Parsed Rows -->
      <div v-if="parsedRows.length > 0 && !completed" class="preview-section">
        <div class="preview-summary">
          <span class="badge valid">{{ validRows.length }} Baris Siap Diimpor</span>
          <span v-if="invalidRows.length > 0" class="badge invalid">{{ invalidRows.length }} Baris Tidak Valid</span>
        </div>

        <div class="table-scroll">
          <table class="preview-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Identitas Pegawai</th>
                <th>Nama Lengkap & Gelar</th>
                <th>Email Institusi</th>
                <th>Bidang Keahlian</th>
                <th>Peran</th>
                <th>Status Validasi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in parsedRows" :key="idx" :class="{ error: !row.isValid }">
                <td>{{ idx + 1 }}</td>
                <td>
                  <div class="id-stack">
                    <span v-if="row.nip">NIP: {{ row.nip }}</span>
                    <span v-if="row.nidn">NIDN: {{ row.nidn }}</span>
                    <span v-if="!row.nip && !row.nidn" class="muted">—</span>
                  </div>
                </td>
                <td><strong>{{ row.full_name }}</strong></td>
                <td>{{ row.email }}</td>
                <td>{{ row.expertise || '—' }}</td>
                <td>
                  <span class="role-tag" :class="{ coordinator: row.is_coordinator }">
                    {{ row.is_coordinator ? 'Dosen & Koordinator Capstone' : 'Dosen' }}
                  </span>
                </td>
                <td>
                  <span v-if="row.isValid" class="tag valid">Valid</span>
                  <span v-else class="tag invalid" :title="row.errorReason">
                    {{ row.errorReason }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="dialog-actions">
      <button class="button secondary" type="button" :disabled="isImporting" @click="close">
        {{ completed ? 'Selesai' : 'Batal' }}
      </button>
      <button
        v-if="!completed"
        class="button primary"
        type="button"
        :disabled="validRows.length === 0 || isImporting"
        @click="startImport"
      >
        {{ isImporting ? 'Mengimpor…' : `Impor ${validRows.length} Dosen` }}
      </button>
    </div>
  </dialog>
</template>

<style scoped>
.import-dialog {
  width: min(860px, calc(100% - 2rem));
  max-height: calc(100dvh - 2.5rem);
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 24px;
  color: var(--ink);
  background: var(--panel);
  box-shadow: 0 24px 64px -12px rgba(0, 0, 0, 0.45);
  animation: dialogPop 200ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.import-dialog::backdrop {
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.75rem 2rem 1.25rem;
  border-bottom: 1px solid var(--line);
}

.header-text h2 {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -.03em;
  color: var(--ink);
}

.dialog-intro {
  color: var(--muted);
  font-size: .9375rem;
  line-height: 1.5;
  margin-top: .35rem;
}

.close-button {
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: var(--muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: color 150ms ease;
}

.close-button:hover {
  background: transparent;
  color: var(--ink);
}

.dialog-body {
  padding: 1.5rem 2rem;
  max-height: calc(100dvh - 14rem);
  overflow-y: auto;
  scrollbar-width: thin;
}

/* Template Banner */
.template-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 14px;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.banner-info {
  display: flex;
  align-items: center;
  gap: .75rem;
  color: var(--accent);
}

.banner-info strong {
  display: block;
  font-size: .9125rem;
  font-weight: 600;
  color: var(--ink);
}

.banner-info span {
  display: block;
  font-size: .8125rem;
  color: var(--muted);
  margin-top: 2px;
}

.template-btn {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  background: #15803d;
  color: #ffffff;
  border: 1px solid #166534;
  border-radius: 10px;
  padding: .5rem 1rem;
  font-size: .875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
  box-shadow: 0 1px 2px rgba(21, 128, 61, 0.2);
}

.template-btn:hover {
  background: #166534;
  border-color: #14532d;
  color: #ffffff;
}

/* Dropzone */
.progress-box {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: var(--canvas);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: .875rem;
  color: var(--ink);
  margin-bottom: .75rem;
}

.progress-bar-bg {
  width: 100%;
  height: 8px;
  background: var(--line);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 4px;
  transition: width 200ms ease;
}

/* Result Box */
.result-box {
  margin-top: 1.25rem;
}

.result-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: .75rem;
  margin-bottom: 1rem;
}

.result-card {
  padding: 1rem .85rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid var(--border);
  background: var(--panel);
  color: var(--ink);
}

.result-card.created .result-num {
  color: var(--success);
}

.result-card.updated .result-num {
  color: var(--accent);
}

.result-card.skipped .result-num {
  color: var(--muted);
}

.result-card.failed .result-num {
  color: var(--error);
}

.result-num {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.result-label {
  display: block;
  font-size: .75rem;
  font-weight: 600;
  margin-top: .25rem;
  color: var(--muted);
}

.failed-list {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: .875rem;
}

.failed-list h4 {
  font-size: .875rem;
  color: var(--error);
  margin-bottom: .5rem;
}

.failed-list ul {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--ink);
}

/* Preview Section */
.preview-section {
  margin-top: 1.5rem;
}

.preview-summary {
  display: flex;
  gap: .625rem;
  margin-bottom: .75rem;
}

.badge {
  font-size: .8125rem;
  font-weight: 600;
  padding: .2rem .55rem;
  border-radius: 6px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--ink);
}

.badge.valid {
  border-color: var(--success);
  color: var(--success);
}

.badge.invalid {
  border-color: var(--error);
  color: var(--error);
}

.table-scroll {
  max-height: 240px;
  overflow: auto;
  border: 1px solid var(--line);
  border-radius: 10px;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: .8125rem;
  text-align: left;
}

.preview-table th {
  background: var(--canvas);
  padding: .6rem .75rem;
  font-weight: 600;
  color: var(--muted);
  position: sticky;
  top: 0;
  border-bottom: 1px solid var(--line);
  white-space: nowrap;
}

.preview-table td {
  padding: .55rem .75rem;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
}

.preview-table tr.error {
  background: var(--panel-hover);
}

.id-stack {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: .75rem;
}

.role-tag {
  display: inline-block;
  font-size: .75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--ink);
}

.role-tag.coordinator {
  border-color: var(--accent);
  color: var(--accent);
}

.tag {
  display: inline-block;
  font-size: .75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--ink);
}

.tag.valid {
  border-color: var(--success);
  color: var(--success);
}

.tag.invalid {
  border-color: var(--error);
  color: var(--error);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: .75rem;
  border-top: 1px solid var(--line);
  padding: 1.25rem 2rem;
  background: var(--canvas);
}

@media (max-width: 767px) {
  .dialog-header { padding: 1.25rem; }
  .dialog-body { padding: 0 1.25rem 1.25rem; }
  .dialog-actions { padding: 1rem 1.25rem; }
  .template-banner { flex-direction: column; align-items: flex-start; }
}
</style>

