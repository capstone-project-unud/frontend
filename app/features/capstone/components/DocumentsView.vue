<script setup lang="ts">
import WorkspaceFilter from '~/components/workspace/WorkspaceFilter.vue'
import WorkspaceSelect from '~/components/workspace/WorkspaceSelect.vue'
import FileUpload from './FileUpload.vue'
import StatusLabel from './StatusLabel.vue'
import { capstoneAPI, useCapstone } from '../composables/useCapstone'
import type { DocumentType, Project, ProjectDocument } from '../types'
import { dateTime } from '~/utils/format'

const api = useCapstone()
const { student, coordinator, busy, error, message } = api
const canUpload = computed(() => student.value || coordinator.value || (api.user.value?.roles.includes('ADMIN') ?? false))
const fetcher = useRequestFetch()
const categoryFilter = shallowRef('')
const stageFilter = shallowRef('')

const { data: docTypesData } = await useAsyncData('master-doc-types', () => fetcher<{ items: DocumentType[] }>(capstoneAPI + '/master/document-types'))
const { data, status, error: loadError, refresh } = await useAsyncData(
  'project-documents',
  () => fetcher<{ items: ProjectDocument[] }>(capstoneAPI + '/documents', {
    query: { category: categoryFilter.value, stage: stageFilter.value },
  }),
  { watch: [categoryFilter, stageFilter] },
)
const { data: myProjects } = await useAsyncData(
  'document-projects',
  () => fetcher<{ items: Project[] }>(capstoneAPI + '/projects'),
)

const activeTypes = computed(() => (docTypesData.value?.items || []).filter(t => t.is_active))
const docTypeOptions = computed(() => activeTypes.value.map(t => ({
  value: t.code,
  label: `${t.name} [${t.scope === 'INDIVIDUAL' ? 'Individu' : 'Kelompok'}]`,
})))
const projectOptions = computed(() => (myProjects.value?.items || []).map(p => ({
  value: p.id,
  label: `${p.title} (${p.status})`,
})))

const categoryOptions = [
  { value: '', label: 'Semua kategori' },
  { value: 'B_SERIES', label: 'Seri B (B-100 s.d. B-400)' },
  { value: 'PROPOSAL_REPORT', label: 'Usulan & Laporan Akhir' },
  { value: 'APPROVAL_ADMIN', label: 'Pengesahan, Plagiarisme & Surat Tugas' },
  { value: 'FINAL_REQUIREMENT', label: 'Syarat Administrasi Ujian Akhir' },
  { value: 'EXPO_OUTPUT', label: 'Jurnal & Materi Expo' },
]

const stageOptions = [
  { value: '', label: 'Semua tahap' },
  { value: 'TOPIK', label: 'Usulan & Seminar Topik' },
  { value: 'SEMPRO', label: 'Seminar Proposal' },
  { value: 'BIMBINGAN', label: 'Bimbingan & Perancangan' },
  { value: 'UJIAN_AKHIR', label: 'Ujian Akhir' },
  { value: 'EXPO', label: 'Capstone Expo' },
]

const form = reactive<{
  project_id: string
  doc_type_code: string
  student_id: string
  file_id: string | null
  summary: string
}>({
  project_id: '',
  doc_type_code: 'B-100',
  student_id: '',
  file_id: null,
  summary: '',
})

watch(myProjects, (val) => {
  if (!form.project_id && val?.items.length) {
    form.project_id = val.items[0]!.id
  }
}, { immediate: true })

watch(activeTypes, (val) => {
  if (val.length && !val.some(t => t.code === form.doc_type_code)) {
    form.doc_type_code = val[0]!.code
  }
}, { immediate: true })

const selectedDocType = computed(() => activeTypes.value.find(t => t.code === form.doc_type_code))
const selectedProject = computed(() => (myProjects.value?.items || []).find(p => p.id === form.project_id))
const projectMemberOptions = computed(() => {
  const seen = new Set<string>()
  return (selectedProject.value?.students || [])
    .filter(m => !seen.has(m.student_id) && seen.add(m.student_id))
    .map(m => ({ value: m.student_id, label: `${m.student_name} (${m.nim})` }))
})

watch([() => form.project_id, () => form.doc_type_code], () => {
  if (selectedDocType.value?.scope === 'INDIVIDUAL') {
    if (student.value && api.user.value?.id) form.student_id = api.user.value.id
    else if (!form.student_id && projectMemberOptions.value.length) form.student_id = projectMemberOptions.value[0]!.value
  } else {
    form.student_id = ''
  }
})

const existingDoc = computed(() => (data.value?.items || []).find(d =>
  d.project_id === form.project_id
  && (d.doc_type_code || d.series) === form.doc_type_code
  && (selectedDocType.value?.scope !== 'INDIVIDUAL' || d.student_id === (form.student_id || api.user.value?.id)),
))

const reviewNotes = reactive<Record<string, string>>({})
const expandedHistory = reactive<Record<string, boolean>>({})

function isProjectSupervisor(projectID: string) {
  const uid = api.user.value?.id
  if (!uid) return false
  const proj = (myProjects.value?.items || []).find(p => p.id === projectID)
  return !!proj?.students.some(s => s.supervisor_id === uid)
}

function canReview(doc: ProjectDocument) {
  if (coordinator.value || api.user.value?.roles.includes('ADMIN')) return true
  if (api.user.value?.roles.includes('TU')) return doc.category === 'APPROVAL_ADMIN' || doc.category === 'FINAL_REQUIREMENT'
  return isProjectSupervisor(doc.project_id)
}

async function submitDocument() {
  const ok = await api.mutate('/documents', {
    project_id: form.project_id,
    doc_type_code: form.doc_type_code,
    series: form.doc_type_code,
    student_id: selectedDocType.value?.scope === 'INDIVIDUAL' ? (form.student_id || null) : null,
    file_id: form.file_id,
    summary: form.summary,
    version: existingDoc.value?.version || 0,
  })
  if (ok) {
    form.file_id = null
    form.summary = ''
    await refresh()
  }
}

async function review(doc: ProjectDocument, nextStatus: 'APPROVED' | 'REVISION') {
  const ok = await api.mutate(`/documents/${doc.id}/review`, {
    status: nextStatus,
    note: reviewNotes[doc.id] || '',
    version: doc.version,
  }, 'PUT')
  if (ok) {
    reviewNotes[doc.id] = ''
    await refresh()
  }
}
</script>

<template>
  <section>
    <form v-if="canUpload && projectOptions.length" class="panel cap-section" aria-labelledby="doc-form-title" @submit.prevent="submitDocument">
      <div class="cap-section-heading">
        <div>
          <h2 id="doc-form-title">Unggah &amp; kelola versi dokumen capstone</h2>
          <p class="muted">Meliputi seluruh dokumen resmi: Seri B (B-100 s.d. B-400), Usulan Topik, Proposal Usulan, Persetujuan Sempro &amp; Ujian Akhir, Laporan Akhir, Uji Plagiarisme, Jurnal, Surat Tugas, serta Poster Expo. Setiap unggahan menyimpan riwayat versi.</p>
        </div>
      </div>
      <fieldset class="cap-fieldset" :disabled="busy">
        <div class="field-row">
          <div class="field">
            <label for="doc-project">Proyek / judul capstone</label>
            <WorkspaceSelect id="doc-project" v-model="form.project_id" label="Judul capstone" :options="projectOptions" required :disabled="busy" />
          </div>
          <div class="field">
            <label for="doc-type">Jenis dokumen</label>
            <WorkspaceSelect id="doc-type" v-model="form.doc_type_code" label="Jenis dokumen" :options="docTypeOptions" required :disabled="busy" />
          </div>
        </div>
        <div v-if="selectedDocType?.scope === 'INDIVIDUAL' && !student && projectMemberOptions.length" class="field">
          <label for="doc-student">Mahasiswa pemilik dokumen individu</label>
          <WorkspaceSelect id="doc-student" v-model="form.student_id" label="Mahasiswa" :options="projectMemberOptions" :disabled="busy" />
        </div>
        <p v-if="selectedDocType" class="notice">
          <strong>{{ selectedDocType.name }}:</strong> {{ selectedDocType.description }}
          <span v-if="selectedDocType.code === 'B-200'"> (Dokumen B-200 wajib disetujui pembimbing sebelum pembelian komponen / pemrograman).</span>
        </p>
        <FileUpload v-model="form.file_id" :label="existingDoc ? `Unggah versi baru ${form.doc_type_code} (PDF)` : `Berkas ${form.doc_type_code} (PDF)`" />
        <div class="field">
          <label for="doc-summary">Catatan versi atau ringkasan perubahan <span class="optional">(opsional)</span></label>
          <textarea id="doc-summary" v-model="form.summary" maxlength="2000" rows="2" placeholder="Pokok perubahan pada versi ini (misal: perbaikan Bab III atau tanggapan penguji)" />
        </div>
      </fieldset>
      <div class="cap-actions">
        <button class="button primary" :disabled="busy || !form.project_id || !form.file_id">
          {{ busy ? 'Menyimpan…' : existingDoc ? `Unggah versi ke-${existingDoc.revision_no + 1}` : 'Simpan versi ke-1' }}
        </button>
      </div>
    </form>

    <div class="panel workspace-panel cap-list-panel">
      <div class="workspace-panel-header">
        <div class="workspace-panel-title">
          <h2>Daftar dokumen &amp; riwayat versi capstone</h2>
          <span>{{ data ? `${data.items.length} dokumen` : '—' }}</span>
        </div>
      </div>

      <div class="workspace-toolbar">
        <WorkspaceFilter id="doc-cat-filter" v-model="categoryFilter" label="Kategori" :options="categoryOptions" />
        <WorkspaceFilter id="doc-stage-filter" v-model="stageFilter" label="Tahap" :options="stageOptions" />
        <button v-if="categoryFilter || stageFilter" type="button" class="workspace-text-action secondary" @click="categoryFilter = ''; stageFilter = ''">Reset filter</button>
      </div>

      <p v-if="error" class="notice error cap-panel-feedback" role="alert">{{ error }}</p>
      <p v-if="message" class="notice success cap-panel-feedback" role="status">{{ message }}</p>
      <p v-if="status === 'pending'" role="status" class="cap-loading">Memuat dokumen…</p>
      <div v-else-if="loadError" class="empty-state">
        <h2>Dokumen belum dapat dimuat</h2>
        <p>Periksa koneksi lalu coba kembali.</p>
        <button class="button secondary" @click="refresh()">Coba lagi</button>
      </div>
      <div v-else-if="!data?.items.length" class="empty-state">
        <h2>Belum ada dokumen diunggah</h2>
        <p>{{ categoryFilter || stageFilter ? 'Tidak ada dokumen yang sesuai filter.' : 'Dokumen B-100..B-400, Proposal, Laporan Akhir, Surat Tugas, Pengesahan, dan Materi Expo akan tampil di sini.' }}</p>
      </div>

      <div v-else class="cap-panel-items">
        <article v-for="doc in data.items" :key="doc.id" class="cap-panel-item">
          <div class="cap-section-heading">
            <div>
              <h2>{{ doc.doc_type_name || doc.doc_type_code || doc.series }}</h2>
              <p class="muted">
                {{ doc.project_title }}
                <template v-if="doc.student_name"> · Individu: <strong>{{ doc.student_name }}</strong></template>
                · Versi terbaru: <strong>v{{ doc.revision_no }}</strong> ({{ doc.file_name || 'PDF' }})
                · Oleh {{ doc.uploaded_by_name }} ({{ dateTime(doc.updated_at) }})
              </p>
            </div>
            <StatusLabel :value="doc.status" />
          </div>

          <p v-if="doc.summary" class="cap-preserve">{{ doc.summary }}</p>

          <div class="cap-actions">
            <a class="button secondary" :href="`${capstoneAPI}/files/${doc.file_id}`">Unduh versi terbaru (v{{ doc.revision_no }})</a>
            <button v-if="doc.versions?.length" type="button" class="workspace-text-action" @click="expandedHistory[doc.id] = !expandedHistory[doc.id]">
              {{ expandedHistory[doc.id] ? 'Tutup riwayat versi' : `Riwayat versi (${doc.versions.length})` }}
            </button>
          </div>

          <div v-if="expandedHistory[doc.id] && doc.versions?.length" class="version-history">
            <h3>Riwayat versi tersimpan</h3>
            <ul>
              <li v-for="v in doc.versions" :key="v.id" class="version-row">
                <div>
                  <strong>v{{ v.version_no }}</strong> · {{ v.file_name || 'PDF' }} · <StatusLabel :value="v.review_status" />
                  <small class="muted">Diunggah oleh {{ v.uploaded_by_name }} pada {{ dateTime(v.created_at) }}<template v-if="v.review_note"> · Catatan: {{ v.review_note }}</template></small>
                </div>
                <a class="workspace-text-action" :href="`${capstoneAPI}/files/${v.file_id}`">Unduh v{{ v.version_no }}</a>
              </li>
            </ul>
          </div>

          <p v-if="doc.review_note" class="notice">Catatan pemeriksa ({{ doc.reviewer_name }}): {{ doc.review_note }}</p>
          <small v-if="doc.reviewed_at" class="muted">Diperiksa {{ dateTime(doc.reviewed_at) }}</small>

          <form v-if="canReview(doc) && doc.status !== 'APPROVED'" class="cap-review" @submit.prevent="review(doc, 'APPROVED')">
            <div class="field">
              <label :for="'doc-note-' + doc.id">Catatan pemeriksaan (wajib saat meminta perbaikan)</label>
              <textarea :id="'doc-note-' + doc.id" v-model="reviewNotes[doc.id]" maxlength="2000" rows="2" />
            </div>
            <div class="cap-actions">
              <button class="button primary" :disabled="busy">Setujui dokumen</button>
              <button type="button" class="button secondary" :disabled="busy" @click="review(doc, 'REVISION')">Minta perbaikan</button>
            </div>
          </form>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.field-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.version-history { padding: .875rem 1rem; border: 1px solid var(--border); border-radius: 12px; background: var(--canvas); display: grid; gap: .6rem; }
.version-history h3 { font-size: .9375rem; font-weight: 600; margin: 0; }
.version-history ul { list-style: none; padding: 0; margin: 0; display: grid; gap: .5rem; }
.version-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding-top: .5rem; border-top: 1px solid var(--line); flex-wrap: wrap; }
.version-row small { display: block; margin-top: .2rem; }
@media (max-width: 720px) { .field-row { grid-template-columns: minmax(0, 1fr); } }
</style>
