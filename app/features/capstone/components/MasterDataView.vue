<script setup lang="ts">
import WorkspaceSelect from '~/components/workspace/WorkspaceSelect.vue'
import WorkspaceSkeleton from '~/components/workspace/WorkspaceSkeleton.vue'
import InterestManagement from './InterestManagement.vue'
import StatusLabel from './StatusLabel.vue'
import { capstoneAPI, useCapstone } from '../composables/useCapstone'
import type { AcademicPeriod, AssessmentRubricItem, DocumentType, StageRequirement } from '../types'

const api = useCapstone()
const { busy, error, message } = api
const fetcher = useRequestFetch()
const tab = shallowRef<'periods' | 'interests' | 'doctypes' | 'stages' | 'rubrics'>('periods')

const { data: periodsData, status: periodsStatus, refresh: refreshPeriods } = await useLazyAsyncData('master-periods', () => fetcher<{ items: AcademicPeriod[] }>(capstoneAPI + '/master/periods'))
const { data: docsData, status: docsStatus, refresh: refreshDocs } = await useLazyAsyncData('master-docs', () => fetcher<{ items: DocumentType[] }>(capstoneAPI + '/master/document-types'))
const { data: stagesData, status: stagesStatus, refresh: refreshStages } = await useLazyAsyncData('master-stages', () => fetcher<{ items: StageRequirement[] }>(capstoneAPI + '/master/stage-requirements'))
const { data: rubricsData, status: rubricsStatus, refresh: refreshRubrics } = await useLazyAsyncData('master-rubrics', () => fetcher<{ items: AssessmentRubricItem[] }>(capstoneAPI + '/master/rubrics'))

const periodForm = reactive({
  id: '', code: '', name: '', semester: 'GENAP', start_date: '2026-02-01', end_date: '2026-07-31',
  group_open: true, topic_open: true, sempro_open: true, exam_open: true, is_active: true,
})
async function savePeriod() {
  const path = periodForm.id ? `/master/periods/${periodForm.id}` : '/master/periods'
  const method = periodForm.id ? 'PUT' : 'POST'
  if (await api.mutate(path, periodForm, method)) {
    periodForm.id = ''; periodForm.code = ''; periodForm.name = ''
    await refreshPeriods()
  }
}
function editPeriod(p: AcademicPeriod) {
  Object.assign(periodForm, p)
}

const docForm = reactive({
  editing: false, code: '', name: '', category: 'APPROVAL_ADMIN', stage: 'SEMPRO', scope: 'GROUP',
  description: '', is_required: true, is_active: true, sort_order: 100,
})
async function saveDocType() {
  const path = docForm.editing ? `/master/document-types/${docForm.code}` : '/master/document-types'
  const method = docForm.editing ? 'PUT' : 'POST'
  if (await api.mutate(path, docForm, method)) {
    docForm.editing = false; docForm.code = ''; docForm.name = ''; docForm.description = ''
    await refreshDocs()
  }
}
function editDocType(d: DocumentType) {
  Object.assign(docForm, { ...d, editing: true })
}

const stageNotes = reactive<Record<string, StageRequirement>>({})
watch(stagesData, (val) => {
  for (const s of val?.items || []) {
    stageNotes[s.stage] = { ...s }
  }
}, { immediate: true })
async function saveStage(stage: string) {
  const item = stageNotes[stage]
  if (item && await api.mutate(`/master/stage-requirements/${stage}`, item, 'PUT')) await refreshStages()
}

const rubricDrafts = reactive<Record<string, AssessmentRubricItem>>({})
watch(rubricsData, (val) => {
  for (const r of val?.items || []) {
    rubricDrafts[r.id] = { ...r }
  }
}, { immediate: true })
async function saveRubric(id: string) {
  const r = rubricDrafts[id]
  if (r && await api.mutate(`/master/rubrics/${id}`, {
    cpmk_title: r.cpmk_title,
    ik_description: r.ik_description,
    weight: Number(r.weight),
    is_active: r.is_active,
  }, 'PUT')) await refreshRubrics()
}
</script>

<template>
  <section class="master-stack">
    <div class="tab-bar" role="tablist">
      <button type="button" role="tab" :aria-selected="tab === 'periods'" class="tab-btn" :class="{ active: tab === 'periods' }" @click="tab = 'periods'">1. Periode Akademik</button>
      <button type="button" role="tab" :aria-selected="tab === 'interests'" class="tab-btn" :class="{ active: tab === 'interests' }" @click="tab = 'interests'">2. Bidang Minat</button>
      <button type="button" role="tab" :aria-selected="tab === 'doctypes'" class="tab-btn" :class="{ active: tab === 'doctypes' }" @click="tab = 'doctypes'">3. Jenis Dokumen</button>
      <button type="button" role="tab" :aria-selected="tab === 'stages'" class="tab-btn" :class="{ active: tab === 'stages' }" @click="tab = 'stages'">4. Persyaratan Tahap</button>
      <button type="button" role="tab" :aria-selected="tab === 'rubrics'" class="tab-btn" :class="{ active: tab === 'rubrics' }" @click="tab = 'rubrics'">5. Rubrik CPMK &amp; IK</button>
    </div>

    <p v-if="error" class="notice error" role="alert">{{ error }}</p>
    <p v-if="message" class="notice success" role="status">{{ message }}</p>

    <template v-if="tab === 'periods'">
      <form class="panel cap-section" @submit.prevent="savePeriod">
        <h2>{{ periodForm.id ? 'Ubah periode akademik' : 'Tambah periode akademik' }}</h2>
        <div class="field-row">
          <div class="field"><label>Kode periode</label><input v-model="periodForm.code" required minlength="3" maxlength="40" placeholder="2026-GANJIL"></div>
          <div class="field"><label>Nama periode</label><input v-model="periodForm.name" required minlength="3" maxlength="150" placeholder="Tahun Akademik 2026/2027 Ganjil"></div>
        </div>
        <div class="field-row3">
          <div class="field"><label for="m-period-sem">Semester</label><WorkspaceSelect id="m-period-sem" v-model="periodForm.semester" label="Semester" :options="[{ value: 'GANJIL', label: 'Ganjil' }, { value: 'GENAP', label: 'Genap' }, { value: 'ANTARA', label: 'Antara' }]" /></div>
          <div class="field"><label for="m-period-start">Tanggal mulai</label><input id="m-period-start" v-model="periodForm.start_date" type="date" required></div>
          <div class="field"><label for="m-period-end">Tanggal selesai</label><input id="m-period-end" v-model="periodForm.end_date" type="date" required></div>
        </div>
        <div class="checks-inline">
          <label><input v-model="periodForm.is_active" type="checkbox"> Periode aktif utama</label>
          <label><input v-model="periodForm.group_open" type="checkbox"> Buka pendaftaran kelompok</label>
          <label><input v-model="periodForm.topic_open" type="checkbox"> Buka topik</label>
          <label><input v-model="periodForm.sempro_open" type="checkbox"> Buka Sempro</label>
          <label><input v-model="periodForm.exam_open" type="checkbox"> Buka Ujian Akhir</label>
        </div>
        <div class="cap-actions">
          <button class="button primary" :disabled="busy">Simpan periode</button>
          <button v-if="periodForm.id" type="button" class="button secondary" @click="periodForm.id = ''; periodForm.code = ''; periodForm.name = ''">Batal ubah</button>
        </div>
      </form>

      <div class="panel workspace-panel cap-list-panel">
        <div class="workspace-panel-header"><div class="workspace-panel-title"><h2>Daftar periode akademik</h2></div></div>
        <WorkspaceSkeleton v-if="periodsStatus === 'pending'" variant="table" :rows="4" label="Memuat periode akademik…" />
        <div v-else class="workspace-table cap-table-wrap">
          <table class="workspace-table cap-table">
            <thead><tr><th>Kode</th><th>Nama periode</th><th>Rentang</th><th>Status</th><th class="cap-action-heading">Aksi</th></tr></thead>
            <tbody>
              <tr v-for="p in periodsData?.items || []" :key="p.id">
                <td><strong>{{ p.code }}</strong></td>
                <td>{{ p.name }} ({{ p.semester }})</td>
                <td>{{ p.start_date }} s.d. {{ p.end_date }}</td>
                <td><StatusLabel :value="p.is_active ? 'ACTIVE' : 'DRAFT'" /></td>
                <td class="cap-row-actions"><button type="button" class="workspace-text-action" @click="editPeriod(p)">Ubah</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <InterestManagement v-else-if="tab === 'interests'" />

    <template v-else-if="tab === 'doctypes'">
      <form class="panel cap-section" @submit.prevent="saveDocType">
        <h2>{{ docForm.editing ? `Ubah jenis dokumen (${docForm.code})` : 'Tambah jenis dokumen capstone' }}</h2>
        <div class="field-row">
          <div class="field"><label>Kode unik (mis. B-100, LAPORAN_AKHIR)</label><input v-model="docForm.code" :disabled="docForm.editing" required></div>
          <div class="field"><label>Nama jenis dokumen</label><input v-model="docForm.name" required></div>
        </div>
        <div class="field-row3">
          <div class="field"><label for="m-doc-cat">Kategori</label><WorkspaceSelect id="m-doc-cat" v-model="docForm.category" label="Kategori" :options="[{ value: 'B_SERIES', label: 'Seri B' }, { value: 'PROPOSAL_REPORT', label: 'Usulan & Laporan' }, { value: 'APPROVAL_ADMIN', label: 'Pengesahan & Administrasi' }, { value: 'FINAL_REQUIREMENT', label: 'Syarat Ujian Akhir' }, { value: 'EXPO_OUTPUT', label: 'Luaran & Expo' }]" /></div>
          <div class="field"><label for="m-doc-stage">Tahap</label><WorkspaceSelect id="m-doc-stage" v-model="docForm.stage" label="Tahap" :options="[{ value: 'TOPIK', label: 'Topik' }, { value: 'SEMPRO', label: 'Sempro' }, { value: 'BIMBINGAN', label: 'Bimbingan' }, { value: 'UJIAN_AKHIR', label: 'Ujian Akhir' }, { value: 'EXPO', label: 'Expo' }]" /></div>
          <div class="field"><label for="m-doc-scope">Lingkup</label><WorkspaceSelect id="m-doc-scope" v-model="docForm.scope" label="Lingkup" :options="[{ value: 'GROUP', label: 'Kelompok' }, { value: 'INDIVIDUAL', label: 'Individu' }]" /></div>
        </div>
        <div class="field"><label>Keterangan resmi</label><input v-model="docForm.description" maxlength="1000"></div>
        <div class="checks-inline">
          <label><input v-model="docForm.is_required" type="checkbox"> Dokumen wajib</label>
          <label><input v-model="docForm.is_active" type="checkbox"> Aktif digunakan</label>
        </div>
        <div class="cap-actions">
          <button class="button primary" :disabled="busy">Simpan jenis dokumen</button>
          <button v-if="docForm.editing" type="button" class="button secondary" @click="docForm.editing = false; docForm.code = ''; docForm.name = ''">Batal</button>
        </div>
      </form>
      <div class="panel workspace-panel cap-list-panel">
        <div class="workspace-panel-header"><div class="workspace-panel-title"><h2>Katalog jenis dokumen ({{ docsData?.items.length ?? 0 }})</h2></div></div>
        <WorkspaceSkeleton v-if="docsStatus === 'pending'" variant="table" :rows="5" label="Memuat katalog jenis dokumen…" />
        <div v-else class="workspace-table cap-table-wrap">
          <table class="workspace-table cap-table">
            <thead><tr><th>Kode &amp; Nama</th><th>Tahap</th><th>Lingkup</th><th>Status</th><th class="cap-action-heading">Aksi</th></tr></thead>
            <tbody>
              <tr v-for="dt in docsData?.items || []" :key="dt.code">
                <td><strong>{{ dt.code }}</strong> — {{ dt.name }}<small>{{ dt.description }}</small></td>
                <td>{{ dt.stage }}</td>
                <td>{{ dt.scope === 'INDIVIDUAL' ? 'Individu' : 'Kelompok' }}</td>
                <td><StatusLabel :value="dt.is_active ? 'ACTIVE' : 'DRAFT'" /></td>
                <td class="cap-row-actions"><button type="button" class="workspace-text-action" @click="editDocType(dt)">Ubah</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div v-else-if="tab === 'stages'" class="panel workspace-panel cap-list-panel">
      <div class="workspace-panel-header"><div class="workspace-panel-title"><h2>Konfigurasi persyaratan tiap tahap</h2></div></div>
      <WorkspaceSkeleton v-if="stagesStatus === 'pending'" variant="cards" :rows="3" label="Memuat persyaratan tahap…" />
      <div v-else class="cap-panel-items">
        <template v-for="st in stagesData?.items || []" :key="st.stage">
          <form v-if="stageNotes[st.stage]" class="cap-panel-item" @submit.prevent="saveStage(st.stage)">
            <div class="cap-section-heading"><h3>{{ st.stage }} · {{ stageNotes[st.stage]?.label }}</h3><button class="button secondary" :disabled="busy">Simpan aturan</button></div>
            <div class="field-row3">
              <div class="field"><label>Min anggota</label><input v-model.number="stageNotes[st.stage]!.min_group_members" type="number" min="1" max="5"></div>
              <div class="field"><label>Max anggota</label><input v-model.number="stageNotes[st.stage]!.max_group_members" type="number" min="2" max="10"></div>
              <div class="field"><label>Minimal SKS lulus</label><input v-model.number="stageNotes[st.stage]!.min_sks" type="number" min="0" max="200"></div>
            </div>
            <div class="field-row3">
              <div class="field"><label>Nilai minimal</label><input v-model="stageNotes[st.stage]!.min_grade" maxlength="5"></div>
              <div class="field"><label>Min log bimbingan</label><input v-model.number="stageNotes[st.stage]!.min_guidance_logs" type="number" min="0" max="30"></div>
              <div class="field"><label>Max plagiarisme (%)</label><input v-model.number="stageNotes[st.stage]!.max_plagiarism_pct" type="number" min="1" max="100"></div>
            </div>
            <div class="field"><label>Catatan persyaratan</label><textarea v-model="stageNotes[st.stage]!.notes" rows="2" /></div>
          </form>
        </template>
      </div>
    </div>

    <div v-else class="panel workspace-panel cap-list-panel">
      <div class="workspace-panel-header"><div class="workspace-panel-title"><h2>Rubrik penilaian CPMK &amp; IK</h2></div></div>
      <WorkspaceSkeleton v-if="rubricsStatus === 'pending'" variant="table" :rows="5" label="Memuat rubrik CPMK & IK…" />
      <div v-else class="workspace-table cap-table-wrap">
        <table class="workspace-table cap-table">
          <thead><tr><th>Tahap &amp; IK</th><th>Deskripsi Indikator Kinerja</th><th>Bobot (%)</th><th class="cap-action-heading">Simpan</th></tr></thead>
          <tbody>
            <template v-for="r in rubricsData?.items || []" :key="r.id">
              <tr v-if="rubricDrafts[r.id]">
                <td><strong>{{ r.stage === 'PROYEK_AKHIR_1' ? 'PA I (Sempro)' : 'PA II (Ujian Akhir)' }}</strong><small>{{ r.cpmk_code }} · {{ r.ik_code }}</small></td>
                <td><input v-model="rubricDrafts[r.id]!.ik_description" maxlength="1000"></td>
                <td><input v-model.number="rubricDrafts[r.id]!.weight" type="number" step="0.25" min="0.5" max="100" style="width:90px"></td>
                <td class="cap-row-actions"><button type="button" class="workspace-text-action" :disabled="busy" @click="saveRubric(r.id)">Simpan</button></td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.master-stack { display: grid; gap: 1.5rem; }
.tab-bar { display: flex; gap: .5rem; flex-wrap: wrap; }
.tab-btn { padding: .625rem 1rem; border-radius: 10px; border: 1px solid var(--border); background: var(--panel); color: var(--muted); font-weight: 600; font-size: .875rem; }
.tab-btn.active { border-color: var(--accent); color: var(--accent); }
.field-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.field-row3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.checks-inline { display: flex; flex-wrap: wrap; gap: 1rem; }
.checks-inline label { display: inline-flex; align-items: center; gap: .4rem; font-size: .875rem; }
@media (max-width: 780px) { .field-row, .field-row3 { grid-template-columns: minmax(0, 1fr); } }
</style>
