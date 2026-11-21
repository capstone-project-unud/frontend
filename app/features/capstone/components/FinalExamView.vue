<script setup lang="ts">
import WorkspaceDatePicker from '~/components/workspace/WorkspaceDatePicker.vue'
import WorkspaceSelect from '~/components/workspace/WorkspaceSelect.vue'
import FileUpload from './FileUpload.vue'
import PersonPicker from './PersonPicker.vue'
import RevisionTrackerPanel from './RevisionTrackerPanel.vue'
import SemproRubricForm from './SemproRubricForm.vue'
import StatusLabel from './StatusLabel.vue'
import { capstoneAPI, useCapstone } from '../composables/useCapstone'
import type { FinalExamApplication, FinalExamItem } from '../types'
import { labels } from '../types'
import { calendarToday } from '~/utils/calendar'
import { dateTime } from '~/utils/format'

const api = useCapstone()
const { student, coordinator, busy, error, message } = api
const isTU = computed(() => api.user.value?.roles.includes('TU') ?? false)
const isLecturer = computed(() => api.user.value?.roles.includes('DOSEN') ?? false)
const fetcher = useRequestFetch()

const { data, status, error: loadError, refresh } = await useAsyncData(
  'final-exam-list',
  () => fetcher<{ items: FinalExamItem[] }>(capstoneAPI + '/final-exam'),
)

const projectOptions = computed(() => (data.value?.items || []).map(i => ({ value: i.project_id, label: i.title })))
const appForm = reactive<{
  project_id: string
  sks_completed: number
  min_grade_ok: boolean
  transcript_file_id: string | null
  spp_file_id: string | null
  biodata_summary: string
  ijazah_file_id: string | null
  photo_file_id: string | null
  pa_letter_file_id: string | null
  plagiarism_pct: number
  plagiarism_file_id: string | null
}>({
  project_id: '',
  sks_completed: 140,
  min_grade_ok: true,
  transcript_file_id: null,
  spp_file_id: null,
  biodata_summary: '',
  ijazah_file_id: null,
  photo_file_id: null,
  pa_letter_file_id: null,
  plagiarism_pct: 12,
  plagiarism_file_id: null,
})

watch(data, (val) => {
  if (!appForm.project_id && val?.items.length) appForm.project_id = val.items[0]!.project_id
}, { immediate: true })

const myExistingApp = computed(() => {
  const uid = api.user.value?.id
  if (!uid) return null
  const item = (data.value?.items || []).find(i => i.project_id === appForm.project_id)
  return item?.applications.find(a => a.student_id === uid) || null
})

watch(myExistingApp, (a) => {
  if (a) {
    appForm.sks_completed = a.sks_completed
    appForm.min_grade_ok = a.min_grade_ok
    appForm.transcript_file_id = a.transcript_file_id
    appForm.spp_file_id = a.spp_file_id
    appForm.biodata_summary = a.biodata_summary
    appForm.ijazah_file_id = a.ijazah_file_id
    appForm.photo_file_id = a.photo_file_id
    appForm.pa_letter_file_id = a.pa_letter_file_id
    appForm.plagiarism_pct = a.plagiarism_pct
    appForm.plagiarism_file_id = a.plagiarism_file_id
  }
}, { immediate: true })

async function submitApp() {
  if (await api.mutate('/final-exam/applications', {
    ...appForm,
    version: myExistingApp.value?.version || 0,
  })) await refresh()
}

const reviewNotes = reactive<Record<string, string>>({})
async function reviewTU(app: FinalExamApplication, statusVal: 'VALID' | 'REVISION') {
  if (await api.mutate(`/final-exam/applications/${app.id}/tu-review`, { status: statusVal, note: reviewNotes[app.id] || '', version: app.version }, 'PUT')) {
    reviewNotes[app.id] = ''
    await refresh()
  }
}
async function reviewAdvisor(app: FinalExamApplication, approved: boolean) {
  if (await api.mutate(`/final-exam/applications/${app.id}/advisor-review`, { approved, note: reviewNotes[app.id] || '', version: app.version }, 'PUT')) {
    reviewNotes[app.id] = ''
    await refresh()
  }
}

const openScheduleID = shallowRef<string | null>(null)
const schedForm = reactive({
  date: calendarToday(), time: '09:00', location: '',
  examiner_1_id: null as string | null, examiner_2_id: null as string | null, examiner_3_id: null as string | null, version: 0,
})
function toggleSchedule(item: FinalExamItem) {
  if (openScheduleID.value === item.project_id) { openScheduleID.value = null; return }
  openScheduleID.value = item.project_id
  if (item.exam) {
    const dt = new Date(item.exam.scheduled_at)
    const wita = new Date(dt.getTime() + 8 * 3600 * 1000)
    schedForm.date = wita.toISOString().slice(0, 10)
    schedForm.time = wita.toISOString().slice(11, 16)
    schedForm.location = item.exam.location
    schedForm.examiner_1_id = item.exam.examiner_1_id
    schedForm.examiner_2_id = item.exam.examiner_2_id
    schedForm.examiner_3_id = item.exam.examiner_3_id
    schedForm.version = item.exam.version
  } else {
    schedForm.date = calendarToday(); schedForm.time = '09:00'; schedForm.location = ''
    schedForm.examiner_1_id = null; schedForm.examiner_2_id = null; schedForm.examiner_3_id = null; schedForm.version = 0
  }
}
async function saveSchedule(projectID: string) {
  if (!schedForm.date) return
  if (await api.mutate('/final-exam/schedule', {
    project_id: projectID,
    scheduled_at: `${schedForm.date}T${schedForm.time || '09:00'}:00+08:00`,
    location: schedForm.location,
    examiner_1_id: schedForm.examiner_1_id,
    examiner_2_id: schedForm.examiner_2_id,
    examiner_3_id: schedForm.examiner_3_id,
    version: schedForm.version,
  })) {
    openScheduleID.value = null
    await refresh()
  }
}

const evaluatingItem = shallowRef<FinalExamItem | null>(null)
const rubricSaved = shallowRef('')
const decNotes = reactive<Record<string, string>>({})

function canEvaluate(item: FinalExamItem) {
  const uid = api.user.value?.id
  if (!uid || !item.exam || item.exam.status === 'PASSED' || !isLecturer.value) return false
  return [item.exam.examiner_1_id, item.exam.examiner_2_id, item.exam.examiner_3_id].includes(uid)
    || item.students.some(s => s.supervisor_id === uid)
}
function isExaminer(item: FinalExamItem) {
  const uid = api.user.value?.id
  return !!uid && !!item.exam && [item.exam.examiner_1_id, item.exam.examiner_2_id, item.exam.examiner_3_id].includes(uid)
}
async function saveEval(payload: { student_id: string; scores: Record<string, number>; recommendation: string; notes: string }) {
  if (!evaluatingItem.value?.exam) return
  rubricSaved.value = ''
  if (await api.mutate(`/final-exam/${evaluatingItem.value.exam.id}/evaluate`, payload, 'PUT')) {
    rubricSaved.value = 'Nilai Ujian Akhir mahasiswa disimpan.'
    await refresh()
    const updated = data.value?.items.find(i => i.project_id === evaluatingItem.value?.project_id)
    if (updated) evaluatingItem.value = updated
  }
}
async function decideExam(item: FinalExamItem, nextStatus: 'PASSED' | 'REVISION' | 'FAILED') {
  if (!item.exam) return
  if (await api.mutate(`/final-exam/${item.exam.id}/decision`, { status: nextStatus, note: decNotes[item.exam.id] || '', version: item.exam.version })) {
    decNotes[item.exam.id] = ''
    await refresh()
  }
}
</script>

<template>
  <section class="exam-stack">
    <form v-if="student && projectOptions.length" class="panel cap-section" aria-labelledby="exam-app-title" @submit.prevent="submitApp">
      <div class="cap-section-heading">
        <div>
          <h2 id="exam-app-title">Pendaftaran &amp; verifikasi 11 syarat Ujian Akhir</h2>
          <p class="muted">Lengkapi prasyarat individu: minimal 140 SKS (nilai min C), similarity Turnitin &lt; 20%, B-100..B-400 + Laporan Akhir pada menu Dokumen, serta 6 berkas pendukung.</p>
        </div>
      </div>
      <fieldset class="cap-fieldset" :disabled="busy">
        <div class="field-row">
          <div class="field">
            <label for="fe-proj">Proyek capstone</label>
            <WorkspaceSelect id="fe-proj" v-model="appForm.project_id" label="Proyek capstone" :options="projectOptions" required />
          </div>
          <div class="field">
            <label for="fe-sks">Jumlah SKS lulus (&ge; 140)</label>
            <input id="fe-sks" v-model.number="appForm.sks_completed" type="number" min="140" max="250" required>
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="fe-plag">Persentase similarity plagiarisme (&lt; 20%)</label>
            <input id="fe-plag" v-model.number="appForm.plagiarism_pct" type="number" min="0" max="19.99" step="0.1" required>
          </div>
          <label class="check-field">
            <input v-model="appForm.min_grade_ok" type="checkbox" required>
            <span>Seluruh mata kuliah pada Transkrip &amp; KHS bernilai minimal C.</span>
          </label>
        </div>
        <div class="field">
          <label for="fe-bio">Ringkasan biodata ujian akhir (tempat/tanggal lahir, kontak aktif, judul resmi)</label>
          <textarea id="fe-bio" v-model="appForm.biodata_summary" rows="2" maxlength="2000" required />
        </div>
        <div class="uploads-grid">
          <FileUpload v-model="appForm.transcript_file_id" label="1. Transkrip Sementara + KHS Berjalan (PDF)" />
          <FileUpload v-model="appForm.spp_file_id" label="2. Kuitansi Pembayaran SPP Terakhir (PDF/JPG)" />
          <FileUpload v-model="appForm.ijazah_file_id" label="3. Salinan Ijazah Terakhir (PDF/JPG)" />
          <FileUpload v-model="appForm.photo_file_id" label="4. Pas Foto Hitam-Putih 4x6 (PNG/JPG/PDF)" />
          <FileUpload v-model="appForm.pa_letter_file_id" label="5. Surat Permohonan Maju Ujian diketahui PA (PDF)" />
          <FileUpload v-model="appForm.plagiarism_file_id" label="6. Bukti Lolos Uji Plagiarisme Turnitin &lt;20% (PDF)" />
        </div>
      </fieldset>
      <div class="cap-actions">
        <button class="button primary" :disabled="busy">{{ busy ? 'Mengirim…' : myExistingApp ? 'Perbarui pendaftaran Ujian Akhir' : 'Ajukan Ujian Akhir' }}</button>
      </div>
    </form>

    <div class="panel workspace-panel cap-list-panel">
      <div class="workspace-panel-header">
        <div class="workspace-panel-title">
          <h2>Daftar Ujian Akhir / Sidang Capstone</h2>
          <span>{{ data ? `${data.items.length} kelompok` : '—' }}</span>
        </div>
      </div>

      <p v-if="error" class="notice error cap-panel-feedback" role="alert">{{ error }}</p>
      <p v-if="message" class="notice success cap-panel-feedback" role="status">{{ message }}</p>
      <p v-if="status === 'pending'" class="cap-loading" role="status">Memuat Ujian Akhir…</p>
      <div v-else-if="loadError" class="empty-state">
        <h2>Data Ujian Akhir belum dapat dimuat</h2>
        <button class="button secondary" @click="refresh()">Coba lagi</button>
      </div>
      <div v-else-if="!data?.items.length" class="empty-state">
        <h2>Belum ada kelompok pada tahap Ujian Akhir</h2>
        <p>Kelompok yang telah memiliki penetapan judul &amp; lulus Seminar Proposal dapat melanjutkan ke Ujian Akhir di sini.</p>
      </div>

      <div v-else class="cap-panel-items">
        <article v-for="item in data.items" :key="item.project_id" class="cap-panel-item">
          <div class="cap-section-heading">
            <div>
              <h2>{{ item.title }}</h2>
              <p class="muted">{{ item.interest_name }} · Berkas individu terverifikasi: {{ item.readiness.students_verified }}/{{ item.readiness.total_students }}</p>
            </div>
            <StatusLabel :value="item.exam ? item.exam.status : item.readiness.ready ? 'READY' : 'PENDING'" />
          </div>

          <div class="readiness-grid">
            <div class="readiness-item"><span>Sempro &amp; Revisi Sempro</span><strong :class="{ 'cap-success': item.readiness.sempro_rev_approved }">{{ item.readiness.sempro_rev_approved ? 'Tuntas' : 'Belum' }}</strong></div>
            <div class="readiness-item"><span>B-100 s.d. B-400</span><strong :class="{ 'cap-success': item.readiness.b_series_complete }">{{ item.readiness.b_series_complete ? 'Lengkap' : 'Belum lengkap' }}</strong></div>
            <div class="readiness-item"><span>Laporan Akhir &amp; Plagiarisme</span><strong :class="{ 'cap-success': item.readiness.final_report_ready && item.readiness.plagiarism_ready }">{{ item.readiness.final_report_ready ? 'Tersedia' : 'Belum' }}</strong></div>
            <div class="readiness-item"><span>Surat Tugas &lt; 1 tahun</span><strong :class="{ 'cap-success': item.readiness.assignment_valid }">{{ item.readiness.assignment_valid ? 'Berlaku' : 'Periksa masa berlaku' }}</strong></div>
          </div>

          <div v-if="item.applications.length" class="cap-panel-items sub-apps">
            <div v-for="app in item.applications" :key="app.id" class="app-card">
              <div class="cap-section-heading">
                <div>
                  <strong>{{ app.student_name }} ({{ app.nim }})</strong>
                  <small class="muted"> · {{ app.sks_completed }} SKS · Turnitin {{ app.plagiarism_pct }}% · Pembimbing: {{ app.advisor_1_approved && app.advisor_2_approved ? 'Kedua pembimbing setuju' : `P1:${app.advisor_1_approved ? 'OK' : 'Menunggu'} / P2:${app.advisor_2_approved ? 'OK' : 'Menunggu'}` }}</small>
                </div>
                <StatusLabel :value="app.tu_status" />
              </div>
              <div class="cap-actions">
                <a v-if="app.transcript_file_id" class="workspace-text-action" :href="`${capstoneAPI}/files/${app.transcript_file_id}`">Transkrip/KHS</a>
                <a v-if="app.spp_file_id" class="workspace-text-action" :href="`${capstoneAPI}/files/${app.spp_file_id}`">SPP</a>
                <a v-if="app.pa_letter_file_id" class="workspace-text-action" :href="`${capstoneAPI}/files/${app.pa_letter_file_id}`">Surat PA</a>
                <a v-if="app.plagiarism_file_id" class="workspace-text-action" :href="`${capstoneAPI}/files/${app.plagiarism_file_id}`">Turnitin</a>
              </div>
              <div v-if="isTU || (isLecturer && item.students.some(s => s.student_id === app.student_id && s.supervisor_id === api.user.value?.id))" class="cap-review">
                <input v-model="reviewNotes[app.id]" maxlength="2000" placeholder="Catatan verifikasi administrasi atau persetujuan pembimbing">
                <div class="cap-actions">
                  <button v-if="isTU" type="button" class="button primary" :disabled="busy" @click="reviewTU(app, 'VALID')">TU: Syarat Valid</button>
                  <button v-if="isTU" type="button" class="button secondary" :disabled="busy" @click="reviewTU(app, 'REVISION')">TU: Minta Lengkapi</button>
                  <button v-if="isLecturer && item.students.some(s => s.student_id === app.student_id && s.supervisor_id === api.user.value?.id)" type="button" class="button primary" :disabled="busy" @click="reviewAdvisor(app, true)">Pembimbing: Setujui Maju Sidang (Lampiran 3b)</button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="coordinator && item.readiness.ready && item.exam?.status !== 'PASSED'" class="cap-actions">
            <button type="button" class="button primary" @click="toggleSchedule(item)">
              {{ openScheduleID === item.project_id ? 'Tutup form jadwal' : item.exam ? 'Ubah jadwal Ujian Akhir' : 'Jadwalkan Ujian Akhir' }}
            </button>
          </div>

          <form v-if="openScheduleID === item.project_id" class="cap-review" @submit.prevent="saveSchedule(item.project_id)">
            <h3>Penjadwalan Ujian Akhir</h3>
            <div class="schedule-row">
              <div class="field"><label :for="'fe-date-' + item.project_id">Tanggal</label><WorkspaceDatePicker :id="'fe-date-' + item.project_id" v-model="schedForm.date" label="Tanggal Ujian Akhir" /></div>
              <div class="field"><label :for="'fe-time-' + item.project_id">Waktu (WITA)</label><input :id="'fe-time-' + item.project_id" v-model="schedForm.time" type="time" required></div>
              <div class="field"><label :for="'fe-loc-' + item.project_id">Lokasi / Ruang Sidang</label><input :id="'fe-loc-' + item.project_id" v-model="schedForm.location" required minlength="3" maxlength="250"></div>
            </div>
            <div class="examiner-grid">
              <PersonPicker v-model="schedForm.examiner_1_id" role="DOSEN" label="Penguji 1" :current-name="item.exam?.examiner_1_name" />
              <PersonPicker v-model="schedForm.examiner_2_id" role="DOSEN" label="Penguji 2" :current-name="item.exam?.examiner_2_name" />
              <PersonPicker v-model="schedForm.examiner_3_id" role="DOSEN" label="Penguji 3" :current-name="item.exam?.examiner_3_name" />
            </div>
            <div class="cap-actions">
              <button class="button primary" :disabled="busy">Simpan jadwal Ujian Akhir</button>
            </div>
          </form>

          <template v-if="item.exam">
            <dl class="cap-description">
              <dt>Jadwal &amp; lokasi Ujian Akhir</dt>
              <dd>{{ dateTime(item.exam.scheduled_at) }} · {{ item.exam.location }}</dd>
              <dt>Tim Penguji</dt>
              <dd>1. {{ item.exam.examiner_1_name }} | 2. {{ item.exam.examiner_2_name }} | 3. {{ item.exam.examiner_3_name }}</dd>
              <template v-if="item.exam.outcome_note"><dt>Catatan keputusan</dt><dd>{{ item.exam.outcome_note }}</dd></template>
            </dl>
            <div class="cap-actions">
              <button v-if="canEvaluate(item)" type="button" class="button primary" @click="rubricSaved = ''; evaluatingItem = item">Isi nilai rubrik PA II</button>
              <button type="button" class="button secondary" :disabled="busy" @click="api.download(`/final-exam/${item.exam.id}/report`, 'Berita_Acara_Ujian_Akhir.pdf')">Unduh Berita Acara (PDF)</button>
            </div>

            <div v-if="item.exam.student_summaries.length" class="cap-table-wrap">
              <table class="cap-table">
                <thead><tr><th>Mahasiswa</th><th>NIM</th><th>Penguji</th><th>Nilai Akhir PA II</th><th>Mutu</th></tr></thead>
                <tbody>
                  <tr v-for="st in item.exam.student_summaries" :key="st.student_id">
                    <td><strong>{{ st.student_name }}</strong></td><td>{{ st.nim }}</td>
                    <td>{{ st.examiner_count }} / 3</td><td><strong>{{ st.average_score.toFixed(2) }}</strong></td><td>{{ st.grade_label }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <RevisionTrackerPanel
              stage="FINAL_EXAM"
              :seminar-id="item.exam.id"
              :project-id="item.project_id"
              :seminar-version="item.exam.version"
              :approved-file-id="item.exam.revision_approved_file_id"
              :items="item.exam.revision_items || []"
              :is-examiner="isExaminer(item)"
              @changed="refresh()"
            />

            <form v-if="coordinator" class="cap-review" @submit.prevent="decideExam(item, 'PASSED')">
              <h4>Penetapan kelulusan Ujian Akhir</h4>
              <textarea v-model="decNotes[item.exam.id]" rows="2" placeholder="Catatan resmi Ujian Akhir" />
              <div class="cap-actions">
                <button class="button primary" :disabled="busy">Tetapkan Lulus</button>
                <button type="button" class="button secondary" :disabled="busy" @click="decideExam(item, 'REVISION')">Lulus dengan revisi</button>
                <button type="button" class="button danger" :disabled="busy" @click="decideExam(item, 'FAILED')">Mengulang ujian</button>
              </div>
            </form>
          </template>
        </article>
      </div>
    </div>

    <SemproRubricForm
      v-if="evaluatingItem?.exam && api.user.value?.id"
      mode="FINAL_EXAM"
      :seminar="evaluatingItem.exam"
      :students="evaluatingItem.students"
      :evaluator-id="api.user.value.id"
      :busy="busy"
      :error="error"
      :saved-message="rubricSaved"
      @save="saveEval"
      @close="evaluatingItem = null"
    />
  </section>
</template>

<style scoped>
.exam-stack { display: grid; gap: 1.5rem; }
.field-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.uploads-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.readiness-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .75rem; }
.readiness-item { display: grid; gap: .25rem; padding: .75rem 1rem; border: 1px solid var(--border); border-radius: 10px; background: var(--canvas); }
.readiness-item span { font-size: .8125rem; color: var(--muted); }
.readiness-item strong { font-size: .9375rem; }
.app-card { padding: 1rem; border: 1px solid var(--border); border-radius: 12px; background: var(--canvas); display: grid; gap: .6rem; }
.schedule-row, .examiner-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
@media (max-width: 900px) { .field-row, .uploads-grid, .readiness-grid, .schedule-row, .examiner-grid { grid-template-columns: minmax(0, 1fr); } }
</style>


