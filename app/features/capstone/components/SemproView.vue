<script setup lang="ts">
import WorkspaceDatePicker from '~/components/workspace/WorkspaceDatePicker.vue'
import WorkspaceFilter from '~/components/workspace/WorkspaceFilter.vue'
import WorkspaceSearch from '~/components/workspace/WorkspaceSearch.vue'
import FileUpload from './FileUpload.vue'
import PersonPicker from './PersonPicker.vue'
import RevisionTrackerPanel from './RevisionTrackerPanel.vue'
import SemproRubricForm from './SemproRubricForm.vue'
import StatusLabel from './StatusLabel.vue'
import { capstoneAPI, useCapstone } from '../composables/useCapstone'
import type { SemproItem } from '../types'
import { labels } from '../types'
import { calendarToday } from '~/utils/calendar'
import { dateTime } from '~/utils/format'

const api = useCapstone()
const { student, coordinator, busy, error, message } = api
const fetcher = useRequestFetch()

const { data, status, error: loadError, refresh } = await useAsyncData(
  'sempro-list',
  () => fetcher<{ items: SemproItem[] }>(capstoneAPI + '/sempro'),
)

const q = shallowRef('')
const search = shallowRef('')
const stageFilter = shallowRef('')
const stageOptions = [
  { value: '', label: 'Semua status' },
  { value: 'READY', label: 'Siap dijadwalkan' },
  { value: 'SCHEDULED', label: 'Terjadwal' },
  { value: 'REVISION', label: 'Perlu revisi' },
  { value: 'APPROVED', label: 'Disahkan' },
]

const filteredItems = computed(() => {
  const query = q.value.trim().toLowerCase()
  return (data.value?.items || []).filter((item) => {
    if (stageFilter.value) {
      if (stageFilter.value === 'READY' && !(item.readiness.ready && !item.seminar)) return false
      if (stageFilter.value !== 'READY' && item.seminar?.status !== stageFilter.value) return false
    }
    if (!query) return true
    return item.title.toLowerCase().includes(query) ||
      item.interest_name.toLowerCase().includes(query) ||
      item.students.some(s => s.student_name.toLowerCase().includes(query) || s.nim.toLowerCase().includes(query))
  })
})

function resetFilters() {
  q.value = ''
  search.value = ''
  stageFilter.value = ''
}

const openScheduleID = shallowRef<string | null>(null)
const scheduleForm = reactive({
  date: calendarToday(),
  time: '09:00',
  location: '',
  examiner_1_id: null as string | null,
  examiner_2_id: null as string | null,
  examiner_3_id: null as string | null,
  version: 0,
})

const evaluatingItem = shallowRef<SemproItem | null>(null)
const rubricSaved = shallowRef('')
const decisionNotes = reactive<Record<string, string>>({})
const revisionFiles = reactive<Record<string, string | null>>({})
const revisionNotes = reactive<Record<string, string>>({})

function distinctStudents(item: SemproItem) {
  const map = new Map<string, { student_id: string; student_name: string; nim: string; supervisors: string[] }>()
  for (const m of item.students) {
    if (!map.has(m.student_id)) map.set(m.student_id, { student_id: m.student_id, student_name: m.student_name, nim: m.nim, supervisors: [] })
    if (m.supervisor_name && !map.get(m.student_id)!.supervisors.includes(m.supervisor_name)) {
      map.get(m.student_id)!.supervisors.push(m.supervisor_name)
    }
  }
  return Array.from(map.values())
}

function canEvaluate(item: SemproItem) {
  const uid = api.user.value?.id
  if (!uid || !item.seminar || item.seminar.status === 'APPROVED') return false
  if (!api.user.value?.roles.includes('DOSEN')) return false
  if ([item.seminar.examiner_1_id, item.seminar.examiner_2_id, item.seminar.examiner_3_id].includes(uid)) return true
  return item.students.some(s => s.supervisor_id === uid)
}

function openSchedule(item: SemproItem) {
  if (openScheduleID.value === item.project_id) {
    openScheduleID.value = null
    return
  }
  openScheduleID.value = item.project_id
  if (item.seminar) {
    const dt = new Date(item.seminar.scheduled_at)
    const wita = new Date(dt.getTime() + 8 * 60 * 60 * 1000)
    scheduleForm.date = wita.toISOString().slice(0, 10)
    scheduleForm.time = wita.toISOString().slice(11, 16)
    scheduleForm.location = item.seminar.location
    scheduleForm.examiner_1_id = item.seminar.examiner_1_id
    scheduleForm.examiner_2_id = item.seminar.examiner_2_id
    scheduleForm.examiner_3_id = item.seminar.examiner_3_id
    scheduleForm.version = item.seminar.version
  } else {
    scheduleForm.date = calendarToday()
    scheduleForm.time = '09:00'
    scheduleForm.location = ''
    scheduleForm.examiner_1_id = null
    scheduleForm.examiner_2_id = null
    scheduleForm.examiner_3_id = null
    scheduleForm.version = 0
  }
}

async function saveSchedule(projectID: string) {
  if (!scheduleForm.date || !scheduleForm.time) return
  const scheduledAt = `${scheduleForm.date}T${scheduleForm.time}:00+08:00`
  const ok = await api.mutate('/sempro', {
    project_id: projectID,
    scheduled_at: scheduledAt,
    location: scheduleForm.location,
    examiner_1_id: scheduleForm.examiner_1_id,
    examiner_2_id: scheduleForm.examiner_2_id,
    examiner_3_id: scheduleForm.examiner_3_id,
    version: scheduleForm.version,
  })
  if (ok) {
    openScheduleID.value = null
    await refresh()
  }
}

async function saveEvaluation(payload: { student_id: string; scores: Record<string, number>; recommendation: string; notes: string }) {
  if (!evaluatingItem.value?.seminar) return
  rubricSaved.value = ''
  const ok = await api.mutate(`/sempro/${evaluatingItem.value.seminar.id}/evaluate`, payload, 'PUT')
  if (ok) {
    rubricSaved.value = 'Nilai rubrik mahasiswa berhasil disimpan.'
    await refresh()
    const updated = data.value?.items.find(i => i.project_id === evaluatingItem.value?.project_id)
    if (updated) evaluatingItem.value = updated
  }
}

function isSupervisorOf(item: SemproItem) {
  const uid = api.user.value?.id
  return !!uid && item.students.some(s => s.supervisor_id === uid)
}

function isExaminerOf(item: SemproItem) {
  const uid = api.user.value?.id
  if (!uid || !item.seminar) return false
  return [item.seminar.examiner_1_id, item.seminar.examiner_2_id, item.seminar.examiner_3_id].includes(uid)
}

async function signSemproApproval(projectID: string, statusVal: 'APPROVED' | 'REVISION') {
  if (await api.mutate(`/projects/${projectID}/sempro-approval`, { status: statusVal, note: statusVal === 'APPROVED' ? 'Siap maju Seminar Proposal' : 'Perlu perbaikan berkas usulan' })) {
    await refresh()
  }
}

async function decide(item: SemproItem, nextStatus: 'APPROVED' | 'REVISION' | 'REJECTED') {
  if (!item.seminar) return
  const ok = await api.mutate(`/sempro/${item.seminar.id}/decision`, {
    status: nextStatus,
    note: decisionNotes[item.seminar.id] || '',
    version: item.seminar.version,
  })
  if (ok) {
    decisionNotes[item.seminar.id] = ''
    await refresh()
  }
}

async function submitRevision(item: SemproItem) {
  if (!item.seminar) return
  const sid = item.seminar.id
  const ok = await api.mutate(`/sempro/${sid}/revision`, {
    revision_file_id: revisionFiles[sid] || null,
    revision_note: revisionNotes[sid] || '',
    version: item.seminar.version,
  })
  if (ok) {
    revisionFiles[sid] = null
    revisionNotes[sid] = ''
    await refresh()
  }
}

function downloadReport(seminarID: string) {
  return api.download(`/sempro/${seminarID}/report`, 'Berita_Acara_Sempro.pdf')
}
</script>

<template>
  <section>
    <div class="panel workspace-panel cap-list-panel">
      <div class="workspace-panel-header">
        <div class="workspace-panel-title">
          <h2>Seminar proposal</h2>
          <span>{{ data ? `${filteredItems.length} kelompok` : '—' }}</span>
        </div>
      </div>

      <form class="workspace-toolbar" role="search" aria-label="Filter seminar proposal" @submit.prevent="q = search">
        <WorkspaceSearch id="sempro-search" v-model="search" label="Cari judul atau mahasiswa" placeholder="Cari judul, nama, atau NIM…" @search="q = search" @clear="q = ''" />
        <WorkspaceFilter id="sempro-stage-filter" v-model="stageFilter" label="Status seminar" :options="stageOptions" />
        <button v-if="q || stageFilter" type="button" class="workspace-text-action secondary" @click="resetFilters">Reset filter</button>
      </form>

      <p v-if="error" class="notice error cap-panel-feedback" role="alert">{{ error }}</p>
      <p v-if="message" class="notice success cap-panel-feedback" role="status">{{ message }}</p>
      <p v-if="status === 'pending'" role="status" class="cap-loading">Memuat data seminar proposal…</p>
      <div v-else-if="loadError" class="empty-state">
        <h2>Data seminar proposal belum dapat dimuat</h2>
        <p>Periksa koneksi lalu coba kembali.</p>
        <button class="button secondary" @click="refresh()">Coba lagi</button>
      </div>
      <div v-else-if="!filteredItems.length" class="empty-state">
        <h2>Belum ada kelompok pada tahap seminar proposal</h2>
        <p>{{ q || stageFilter ? 'Tidak ada kelompok yang cocok dengan filter.' : 'Kelompok tampil di sini setelah judul ditetapkan oleh Koordinator Capstone.' }}</p>
      </div>

      <div v-else class="cap-panel-items">
        <article v-for="item in filteredItems" :key="item.project_id" class="cap-panel-item">
        <div class="cap-section-heading">
          <div>
            <h2>{{ item.title }}</h2>
            <p class="muted">{{ item.interest_name }}</p>
          </div>
          <StatusLabel :value="item.seminar ? item.seminar.status : item.readiness.ready ? 'PENDING' : 'DRAFT'" />
        </div>

        <div class="readiness-grid">
          <div class="readiness-item">
            <span>Penetapan judul</span>
            <strong :class="{ 'cap-success': item.readiness.finalized }">{{ item.readiness.finalized ? 'Ditetapkan' : 'Belum' }}</strong>
          </div>
          <div class="readiness-item">
            <span>Bimbingan disetujui</span>
            <strong :class="{ 'cap-success': item.readiness.guidance_approved_count >= 1 }">{{ item.readiness.guidance_approved_count }} log</strong>
          </div>
          <div class="readiness-item">
            <span>Berkas persyaratan UP</span>
            <strong :class="{ 'cap-success': item.readiness.proposal_ready }">{{ item.readiness.proposal_ready ? 'Valid (TU)' : 'Menunggu' }}</strong>
          </div>
          <div class="readiness-item">
            <span>Dokumen B-100</span>
            <StatusLabel :value="item.readiness.b100_status" />
          </div>
          <div class="readiness-item">
            <span>Naskah Proposal Usulan</span>
            <StatusLabel :value="item.readiness.proposal_usulan_status || 'MISSING'" />
          </div>
          <div class="readiness-item">
            <span>Persetujuan Maju Pembimbing</span>
            <strong>{{ item.readiness.advisor_approval_count ?? 0 }} pembimbing</strong>
          </div>
        </div>
        <div v-if="isSupervisorOf(item)" class="cap-actions">
          <button type="button" class="button secondary" :disabled="busy" @click="signSemproApproval(item.project_id, 'APPROVED')">Setujui Maju Sempro (Lampiran 3a)</button>
        </div>

        <div class="cap-table-wrap">
          <table class="cap-table">
            <thead>
              <tr>
                <th>Mahasiswa</th>
                <th>NIM</th>
                <th>Pembimbing</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in distinctStudents(item)" :key="m.student_id">
                <td><strong>{{ m.student_name }}</strong></td>
                <td>{{ m.nim }}</td>
                <td>{{ m.supervisors.join(' · ') || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="coordinator && item.readiness.ready && item.seminar?.status !== 'APPROVED'" class="cap-actions">
          <button type="button" class="button primary" @click="openSchedule(item)">
            {{ openScheduleID === item.project_id ? 'Tutup form jadwal' : item.seminar ? 'Ubah jadwal & penguji' : 'Jadwalkan seminar proposal' }}
          </button>
        </div>
        <p v-else-if="coordinator && !item.readiness.ready" class="notice">
          Penjadwalan tersedia setelah minimal 1 log bimbingan disetujui, berkas UP divalidasi TU, dan Dokumen B-100 disetujui pembimbing.
        </p>

        <form v-if="openScheduleID === item.project_id" class="cap-review" @submit.prevent="saveSchedule(item.project_id)">
          <h3>Penjadwalan dan penetapan 3 dosen penguji</h3>
          <p class="muted">Ketiga dosen penguji harus berbeda satu sama lain dan tidak merangkap sebagai pembimbing pada kelompok ini.</p>
          <fieldset class="cap-fieldset" :disabled="busy">
            <div class="schedule-row">
              <div class="field">
                <label :for="'sempro-date-' + item.project_id">Tanggal seminar</label>
                <WorkspaceDatePicker :id="'sempro-date-' + item.project_id" v-model="scheduleForm.date" label="Tanggal seminar" required :disabled="busy" />
              </div>
              <div class="field">
                <label :for="'sempro-time-' + item.project_id">Waktu (WITA)</label>
                <input :id="'sempro-time-' + item.project_id" v-model="scheduleForm.time" type="time" required>
              </div>
              <div class="field">
                <label :for="'sempro-loc-' + item.project_id">Ruangan atau tautan rapat</label>
                <input :id="'sempro-loc-' + item.project_id" v-model="scheduleForm.location" required minlength="3" maxlength="250" placeholder="Ruang Sidang PSTI / Tautan pertemuan">
              </div>
            </div>
            <div class="examiner-grid">
              <PersonPicker v-model="scheduleForm.examiner_1_id" role="DOSEN" label="Dosen Penguji 1" :current-name="item.seminar?.examiner_1_name" />
              <PersonPicker v-model="scheduleForm.examiner_2_id" role="DOSEN" label="Dosen Penguji 2" :current-name="item.seminar?.examiner_2_name" />
              <PersonPicker v-model="scheduleForm.examiner_3_id" role="DOSEN" label="Dosen Penguji 3" :current-name="item.seminar?.examiner_3_name" />
            </div>
          </fieldset>
          <div class="cap-actions">
            <button type="submit" class="button primary" :disabled="busy || !scheduleForm.examiner_1_id || !scheduleForm.examiner_2_id || !scheduleForm.examiner_3_id">
              {{ busy ? 'Menyimpan…' : 'Simpan jadwal seminar' }}
            </button>
          </div>
        </form>

        <template v-if="item.seminar">
          <dl class="cap-description">
            <dt>Jadwal & lokasi seminar</dt>
            <dd>{{ dateTime(item.seminar.scheduled_at) }} · {{ item.seminar.location }}</dd>
            <dt>Tim penguji</dt>
            <dd>1. {{ item.seminar.examiner_1_name }} | 2. {{ item.seminar.examiner_2_name }} | 3. {{ item.seminar.examiner_3_name }}</dd>
            <template v-if="item.seminar.outcome_note">
              <dt>Catatan hasil seminar</dt>
              <dd>{{ item.seminar.outcome_note }}</dd>
            </template>
          </dl>

          <div class="cap-actions">
            <button v-if="canEvaluate(item)" type="button" class="button primary" @click="rubricSaved = ''; evaluatingItem = item">Isi nilai rubrik individu</button>
            <button type="button" class="button secondary" :disabled="busy" @click="downloadReport(item.seminar.id)">Unduh berita acara (PDF)</button>
            <a v-if="item.seminar.revision_file_id" class="button secondary" :href="`${capstoneAPI}/files/${item.seminar.revision_file_id}`">Unduh berkas revisi mahasiswa</a>
          </div>

          <p v-if="item.seminar.revision_note" class="notice">Catatan revisi mahasiswa: {{ item.seminar.revision_note }}</p>

          <div v-if="item.seminar.student_summaries.length" class="cap-table-wrap">
            <table class="cap-table">
              <thead>
                <tr>
                  <th>Mahasiswa</th>
                  <th>NIM</th>
                  <th>Penilai penguji</th>
                  <th>Rata-rata penguji</th>
                  <th>Kategori nilai</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="st in item.seminar.student_summaries" :key="st.student_id">
                  <td><strong>{{ st.student_name }}</strong></td>
                  <td>{{ st.nim }}</td>
                  <td>{{ st.examiner_count }} / 3 penguji</td>
                  <td><strong>{{ st.examiner_count || st.supervisor_count ? st.average_score.toFixed(2) : '—' }}</strong></td>
                  <td>{{ st.grade_label }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <details v-if="item.seminar.evaluations.length" class="eval-details">
            <summary>Rincian nilai per penilai ({{ item.seminar.evaluations.length }} catatan)</summary>
            <ul class="cap-history">
              <li v-for="ev in item.seminar.evaluations" :key="ev.id">
                <strong>{{ ev.student_name }}</strong> · {{ labels[ev.evaluator_role] || ev.evaluator_role }} ({{ ev.evaluator_name }}):
                <strong>{{ ev.total_score.toFixed(2) }} ({{ ev.grade_label }})</strong> — {{ labels[ev.recommendation] || ev.recommendation }}
                <span v-if="ev.notes"> · {{ ev.notes }}</span>
              </li>
            </ul>
          </details>

          <RevisionTrackerPanel
            stage="SEMPRO"
            :seminar-id="item.seminar.id"
            :project-id="item.project_id"
            :seminar-version="item.seminar.version"
            :approved-file-id="item.seminar.revision_approved_file_id"
            :items="item.seminar.revision_items || []"
            :is-examiner="isExaminerOf(item)"
            @changed="refresh()"
          />

          <form v-if="student && item.seminar.status === 'REVISION'" class="cap-review" @submit.prevent="submitRevision(item)">
            <h3>Unggah revisi pasca Seminar Proposal</h3>
            <FileUpload v-model="revisionFiles[item.seminar.id]" label="Berkas proposal hasil revisi (PDF)" />
            <div class="field">
              <label :for="'sempro-rev-' + item.seminar.id">Ringkasan perbaikan</label>
              <textarea :id="'sempro-rev-' + item.seminar.id" v-model="revisionNotes[item.seminar.id]" required minlength="5" maxlength="2000" rows="2" />
            </div>
            <div class="cap-actions">
              <button class="button primary" :disabled="busy || !revisionFiles[item.seminar.id]">Kirim revisi</button>
            </div>
          </form>

          <form v-if="coordinator" class="cap-review" @submit.prevent="decide(item, 'APPROVED')">
            <h3>Keputusan hasil Seminar Proposal</h3>
            <div class="field">
              <label :for="'sempro-dec-' + item.seminar.id">Catatan keputusan (wajib untuk revisi atau seminar ulang)</label>
              <textarea :id="'sempro-dec-' + item.seminar.id" v-model="decisionNotes[item.seminar.id]" maxlength="2000" rows="2" />
            </div>
            <div class="cap-actions">
              <button class="button primary" :disabled="busy">Sahkan lulus Sempro</button>
              <button type="button" class="button secondary" :disabled="busy" @click="decide(item, 'REVISION')">Minta revisi</button>
              <button type="button" class="button danger" :disabled="busy" @click="decide(item, 'REJECTED')">Perlu seminar ulang</button>
            </div>
          </form>
        </template>
      </article>
      </div>
    </div>

    <SemproRubricForm
      v-if="evaluatingItem?.seminar && api.user.value?.id"
      :seminar="evaluatingItem.seminar"
      :students="evaluatingItem.students"
      :evaluator-id="api.user.value.id"
      :busy="busy"
      :error="error"
      :saved-message="rubricSaved"
      @save="saveEvaluation"
      @close="evaluatingItem = null"
    />
  </section>
</template>

<style scoped>
.readiness-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .75rem; }
.readiness-item { display: grid; gap: .25rem; padding: .75rem 1rem; border: 1px solid var(--border); border-radius: 10px; background: var(--canvas); }
.readiness-item span { font-size: .8125rem; color: var(--muted); }
.readiness-item strong { font-size: .9375rem; }
.schedule-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.examiner-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.eval-details summary { cursor: pointer; font-weight: 600; color: var(--muted); }
@media (max-width: 900px) { .readiness-grid, .schedule-row, .examiner-grid { grid-template-columns: minmax(0, 1fr); } }
</style>
