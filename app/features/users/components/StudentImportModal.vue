<script setup lang="ts">
import { downloadStudentTemplate, parseStudentFile, type ParsedStudentRow } from '~/utils/studentExportImport'

const emit = defineEmits<{ close: []; imported: [] }>()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

const fileName = shallowRef('')
const parsedRows = shallowRef<ParsedStudentRow[]>([])
const isDragging = shallowRef(false)
const isImporting = shallowRef(false)
const progressCount = shallowRef(0)
const importError = shallowRef('')
const createdCount = shallowRef(0)
const updatedCount = shallowRef(0)
const skippedCount = shallowRef(0)
const failedItems = shallowRef<{ nim: string; reason: string }[]>([])
const completed = shallowRef(false)

const validRows = computed(() => parsedRows.value.filter(r => r.isValid))
const invalidRows = computed(() => parsedRows.value.filter(r => !r.isValid))

onMounted(() => dialog.value?.showModal())
onBeforeUnmount(() => dialog.value?.close())

function close() {
  if (!isImporting.value) emit('close')
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) processFile(file)
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) processFile(file)
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
    parsedRows.value = await parseStudentFile(file)
    if (parsedRows.value.length === 0) {
      importError.value = 'File kosong atau format kolom tidak sesuai template.'
    }
  } catch {
    importError.value = 'Gagal membaca isi file. Pastikan format file Excel (.xlsx, .xls) atau .csv valid.'
  }
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
    progressCount.value = i + 1

    try {
      // 1. Cek keberadaan mahasiswa berdasarkan NIM unik
      const searchRes = await $fetch<{ items: any[]; total: number }>('/api/v1/users', {
        query: { q: row.nim, role: 'MAHASISWA' },
      })
      const existing = (searchRes.items || []).find((u: any) => u.nim === row.nim)

      if (existing) {
        // Cek apakah ada data yang berubah
        const hasChanges =
          existing.full_name !== row.full_name ||
          existing.email.toLowerCase() !== row.email.toLowerCase() ||
          Number(existing.admission_year) !== Number(row.admission_year) ||
          (existing.phone || '') !== (row.phone || '')

        if (hasChanges) {
          // Overwrite data mahasiswa lama dengan data baru
          await $fetch(`/api/v1/users/${existing.id}`, {
            method: 'PUT',
            body: {
              full_name: row.full_name,
              email: row.email,
              roles: ['MAHASISWA'],
              nim: row.nim,
              admission_year: row.admission_year,
              nip: null,
              nidn: null,
              phone: row.phone,
              expertise: '',
            },
          })
          updatedCount.value++
        } else {
          // Data persis sama, lewati tanpa error
          skippedCount.value++
        }
      } else {
        // Akun baru (Insert)
        await $fetch('/api/v1/users', {
          method: 'POST',
          body: {
            full_name: row.full_name,
            email: row.email,
            roles: ['MAHASISWA'],
            nim: row.nim,
            admission_year: row.admission_year,
            nip: null,
            nidn: null,
            phone: row.phone,
            expertise: '',
            password: row.password,
            is_active: true,
          },
        })
        createdCount.value++
      }
    } catch (err: any) {
      const msg = err?.data?.error?.message || err?.data?.message || err?.message || 'Gagal memproses baris ini'
      failedItems.value.push({ nim: row.nim, reason: msg })
    }
  }

  isImporting.value = false
  completed.value = true
  emit('imported')
}
</script>

<template>
  <dialog ref="dialog" class="import-dialog" aria-labelledby="import-title" @cancel.prevent="close">
    <div class="dialog-header">
      <div class="header-text">
        <h2 id="import-title">Import Data Mahasiswa</h2>
        <p class="dialog-intro">
          Tambahkan akun mahasiswa secara massal menggunakan file CSV atau Excel.
        </p>
      </div>
      <button class="close-button" type="button" aria-label="Tutup formulir" :disabled="isImporting" @click="close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="dialog-body">
      <!-- Info & Template Download -->
      <div class="template-banner">
        <div class="banner-info">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <div>
            <strong>Gunakan Template Resmi</strong>
            <span>Pastikan susunan kolom sesuai dengan template standar agar terbaca akurat.</span>
          </div>
        </div>
        <button type="button" class="template-btn" @click="downloadStudentTemplate">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Unduh Template (.xlsx)
        </button>
      </div>

      <!-- File Dropzone -->
      <div
        v-if="!isImporting && !completed"
        class="dropzone"
        :class="{ dragging: isDragging, 'has-file': Boolean(fileName) }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="fileInput?.click()"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
          class="hidden-input"
          @change="handleFileSelect"
        >
        <div class="dropzone-content">
          <div class="drop-icon-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <div v-if="fileName" class="file-chosen">
            <strong>{{ fileName }}</strong>
            <span>Klik atau seret file lain untuk mengganti</span>
          </div>
          <div v-else class="file-prompt">
            <strong>Klik untuk memilih file atau seret file ke sini</strong>
            <span>Format yang didukung: Excel (.xlsx, .xls) atau file .csv</span>
          </div>
        </div>
      </div>

      <!-- Progress Bar Saat Import Berjalan -->
      <div v-if="isImporting" class="progress-box">
        <div class="progress-header">
          <strong>Sedang memproses import akun mahasiswa…</strong>
          <span>{{ progressCount }} dari {{ validRows.length }}</span>
        </div>
        <div class="progress-bar-bg">
          <div
            class="progress-bar-fill"
            :style="{ width: `${Math.round((progressCount / validRows.length) * 100)}%` }"
          ></div>
        </div>
      </div>

      <!-- Laporan Hasil Setelah Import Selesai -->
      <div v-if="completed" class="result-box">
        <div class="result-summary-grid">
          <div class="result-card created">
            <span class="result-num">{{ createdCount }}</span>
            <span class="result-label">Akun Baru Dibuat</span>
          </div>
          <div class="result-card updated">
            <span class="result-num">{{ updatedCount }}</span>
            <span class="result-label">Akun Diperbarui (Overwrite)</span>
          </div>
          <div class="result-card skipped">
            <span class="result-num">{{ skippedCount }}</span>
            <span class="result-label">Dilewati (Data Sama)</span>
          </div>
          <div v-if="failedItems.length" class="result-card failed">
            <span class="result-num">{{ failedItems.length }}</span>
            <span class="result-label">Gagal Diimpor</span>
          </div>
        </div>

        <div v-if="failedItems.length" class="failed-list">
          <h4>Keterangan Gagal ({{ failedItems.length }} akun):</h4>
          <ul>
            <li v-for="item in failedItems" :key="item.nim">
              <strong>NIM {{ item.nim }}</strong>: {{ item.reason }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Preview Hasil Parsing -->
      <div v-if="parsedRows.length && !isImporting && !completed" class="preview-section">
        <div class="preview-summary">
          <span class="badge valid">{{ validRows.length }} siap diimpor</span>
          <span v-if="invalidRows.length" class="badge invalid">{{ invalidRows.length }} tidak valid</span>
        </div>

        <div class="table-scroll">
          <table class="preview-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>NIM</th>
                <th>Nama Lengkap</th>
                <th>Email</th>
                <th>Angkatan</th>
                <th>Kata Sandi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in parsedRows" :key="idx" :class="{ error: !row.isValid }">
                <td>
                  <span v-if="row.isValid" class="tag valid">Siap</span>
                  <span v-else class="tag invalid" :title="row.errorReason">Error</span>
                </td>
                <td>{{ row.nim || '—' }}</td>
                <td>{{ row.full_name || '—' }}</td>
                <td>{{ row.email || '—' }}</td>
                <td>{{ row.admission_year }}</td>
                <td><code>{{ row.password ? '••••••••' : 'Auto-generate' }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p v-if="importError" class="notice error" role="alert">{{ importError }}</p>
    </div>

    <div class="dialog-actions">
      <button v-if="!completed" class="button secondary" type="button" :disabled="isImporting" @click="close">
        Batal
      </button>
      <button v-else class="button primary" type="button" @click="close">
        Selesai
      </button>

      <button
        v-if="!completed && validRows.length > 0"
        class="button primary"
        type="button"
        :disabled="isImporting"
        @click="startImport"
      >
        <span v-if="isImporting">Mengimpor…</span>
        <span v-else>Impor {{ validRows.length }} Mahasiswa</span>
      </button>
    </div>
  </dialog>
</template>

<style scoped>
.import-dialog {
  width: min(720px, calc(100% - 2rem));
  max-height: calc(100dvh - 2.5rem);
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 24px;
  color: var(--ink);
  background: var(--panel);
  box-shadow: 0 24px 64px -12px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}

.import-dialog::backdrop {
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.75rem 2rem 1.25rem;
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
  flex: 0 0 36px;
  color: var(--muted);
  cursor: pointer;
  transition: color 150ms ease, transform 180ms ease;
}

.close-button:hover {
  background: transparent;
  color: var(--ink);
  transform: rotate(90deg);
}

.dialog-body {
  padding: 0 2rem 1.5rem;
  max-height: calc(100dvh - 16rem);
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

/* Result Summary Grid */
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

/* Dropzone */
.dropzone {
  border: 2px dashed var(--border);
  border-radius: 16px;
  padding: 2rem 1.5rem;
  text-align: center;
  background: var(--canvas);
  cursor: pointer;
  transition: all 180ms ease;
}

.dropzone:hover,
.dropzone.dragging {
  border-color: var(--accent);
  background: var(--panel-hover);
}

.dropzone.has-file {
  border-style: solid;
  border-color: var(--border);
  background: var(--panel-hover);
}

.hidden-input {
  display: none;
}

.drop-icon-circle {
  width: 44px;
  height: 44px;
  margin: 0 auto 1rem;
  background: transparent;
  border: 0;
  display: grid;
  place-items: center;
  color: var(--accent);
}

.file-prompt strong,
.file-chosen strong {
  display: block;
  font-size: .9375rem;
  font-weight: 600;
  color: var(--ink);
}

.file-prompt span,
.file-chosen span {
  display: block;
  font-size: .8125rem;
  color: var(--muted);
  margin-top: .35rem;
}

/* Progress Box */
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
  max-height: 220px;
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
}

.preview-table td {
  padding: .55rem .75rem;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
}

.preview-table tr.error {
  background: var(--panel-hover);
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

