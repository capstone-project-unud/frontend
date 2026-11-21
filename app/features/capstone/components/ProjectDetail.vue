<script setup lang="ts">
import type { Project } from '../types'
import { capstoneAPI, useCapstone } from '../composables/useCapstone'
import { dateTime } from '~/utils/format'
import ProjectForm from './ProjectForm.vue'
import CandidateEditor from './CandidateEditor.vue'
import FileUpload from './FileUpload.vue'
import SupervisorDecisions from './SupervisorDecisions.vue'
import TopicSeminarsPanel from './TopicSeminarsPanel.vue'
import StatusLabel from './StatusLabel.vue'

const props = defineProps<{ id: string }>()
const api = useCapstone()
const { busy, error, message, student, coordinator } = api
const isTU = computed(() => api.user.value?.roles.includes('TU') ?? false)
const isAdmin = computed(() => api.user.value?.roles.includes('ADMIN') ?? false)
const fetcher = useRequestFetch()

const { data, status, error: loadError, refresh } = await useAsyncData('capstone-project-' + props.id, () => fetcher<{ project: Project }>(capstoneAPI + '/projects/' + props.id))
const { data: history, refresh: refreshHistory } = await useAsyncData('capstone-history-' + props.id, () => fetcher<{ items: { id: number; action: string; created_at: string }[] }>(capstoneAPI + '/projects/' + props.id + '/history'))

const editing = shallowRef(false)
const note = shallowRef('')
const verifyNote = shallowRef('')
const letterForm = reactive<{ file_id: string | null; number: string; issued_date: string }>({ file_id: null, number: '', issued_date: '' })

const project = computed(() => data.value?.project)
watch(project, (p) => {
  if (p) {
    letterForm.file_id = p.assignment_letter_file_id || null
    letterForm.number = p.assignment_letter_number || ''
    letterForm.issued_date = p.assignment_letter_issued_at || ''
  }
}, { immediate: true })

const uniqueMembers = computed(() => {
  const seen = new Set<string>()
  return (project.value?.students || []).filter(m => !seen.has(m.student_id) && seen.add(m.student_id))
})

const canEdit = computed(() => !!project.value && student.value && project.value.owner_id === api.user.value?.id && ['DRAFT', 'REVISION'].includes(project.value.status))
const historyLabels: Record<string, string> = {
  PROJECT_SAVED: 'Draf judul disimpan',
  PROJECT_SUBMITTED: 'Judul diajukan',
  CANDIDATES_CHANGED: 'Calon pembimbing diubah',
  SUPERVISOR_DECISION: 'Keputusan pembimbing dicatat',
  SUPERVISOR_ASSIGNED: 'Pembimbing ditetapkan',
  PROJECT_FINALIZED: 'Judul difinalisasi',
  REVISION_REQUESTED: 'Revisi diminta',
  FINALIZATION_REOPENED: 'Finalisasi dibuka kembali untuk koreksi',
  TOPIC_ADMIN_VERIFIED: 'Verifikasi administrasi usulan topik',
  TOPIC_SEMINAR_REGISTERED: 'Pendaftaran Seminar Kelayakan Topik',
  TOPIC_SEMINAR_SCHEDULED: 'Jadwal Seminar Kelayakan Topik ditetapkan',
  TOPIC_SEMINAR_DECIDED: 'Keputusan resmi Seminar Kelayakan Topik dicatat',
  ASSIGNMENT_LETTER_ATTACHED: 'Surat Tugas Pembimbing dilampirkan',
  GUIDANCE_SUBMITTED: 'Log bimbingan diajukan',
  GUIDANCE_REVIEWED: 'Log bimbingan diperiksa',
  PROPOSAL_SUBMITTED: 'Berkas UP diajukan',
  PROPOSAL_FILE_REVIEWED: 'Berkas UP diperiksa',
}

async function changed() { await Promise.all([refresh(), refreshHistory()]) }
async function action(path: string, body: Record<string, unknown> = {}, method: 'POST' | 'PUT' = 'POST') {
  if (!project.value) return
  if (await api.mutate('/projects/' + props.id + path, { version: project.value.version, ...body }, method)) await changed()
}
</script>

<template>
  <section>
    <NuxtLink to="/capstone" class="cap-link cap-back-link">Kembali ke daftar topik &amp; judul</NuxtLink>
    <p v-if="status === 'pending'" role="status">Memuat topik &amp; judul…</p>
    <div v-else-if="loadError" class="notice error" role="alert">
      Judul belum dapat dimuat. <button class="button secondary" @click="refresh()">Coba lagi</button>
    </div>

    <template v-else-if="project">
      <ProjectForm v-if="editing" :key="project.version" :project="project" @cancel="editing = false" @saved="editing = false; changed()" />
      <div v-else class="cap-stack">
        <article class="panel cap-section">
          <div class="cap-section-heading">
            <div>
              <h2>{{ project.title }}</h2>
              <p class="muted">{{ project.interest_name }} · {{ project.academic_period_name || 'Periode aktif' }} · Verifikasi topik: <StatusLabel :value="project.topic_verify_status || 'PENDING'" /></p>
            </div>
            <StatusLabel :value="project.status" />
          </div>
          <p class="cap-preserve">{{ project.summary }}</p>
          <p v-if="project.revision_note" class="notice">Catatan revisi: {{ project.revision_note }}</p>
          <p v-if="project.topic_verify_note" class="notice">Catatan verifikasi administrasi: {{ project.topic_verify_note }}</p>
          <p v-if="project.assignment_letter_number" class="notice">
            Surat Tugas Pembimbing No. <strong>{{ project.assignment_letter_number }}</strong> (Terbit: {{ project.assignment_letter_issued_at }})
            <template v-if="project.assignment_letter_file_id"> · <a class="cap-link" :href="`${capstoneAPI}/files/${project.assignment_letter_file_id}`">Unduh Surat Tugas (PDF)</a></template>
          </p>

          <div class="workspace-table cap-table-wrap" tabindex="0">
            <table class="workspace-table cap-table">
              <thead>
                <tr>
                  <th scope="col">Anggota kelompok</th>
                  <th scope="col">Peran</th>
                  <th scope="col">Tanggung jawab</th>
                  <th scope="col">Pembimbing 1</th>
                  <th scope="col">Pembimbing 2</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in uniqueMembers" :key="m.student_id">
                  <td><strong>{{ m.student_name }}</strong><small>{{ m.nim }}</small></td>
                  <td><strong :class="m.is_leader ? 'cap-leader' : 'muted'">{{ m.is_leader ? 'Ketua kelompok' : 'Anggota' }}</strong></td>
                  <td>{{ m.responsibility || '—' }}</td>
                  <td>{{ project.students.find(s => s.student_id === m.student_id && s.slot === 1)?.supervisor_name || project.students.find(s => s.student_id === m.student_id && s.slot === 1)?.candidate_name || '—' }}</td>
                  <td>{{ project.students.find(s => s.student_id === m.student_id && s.slot === 2)?.supervisor_name || project.students.find(s => s.student_id === m.student_id && s.slot === 2)?.candidate_name || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="cap-actions">
            <a v-if="project.description_file_id" class="button secondary" :href="capstoneAPI + '/files/' + project.description_file_id">Unduh deskripsi topik</a>
            <button v-if="canEdit" class="button secondary" @click="editing = true">Ubah draf</button>
            <button v-if="canEdit" class="button primary" :disabled="busy" @click="action('/submit')">Ajukan topik</button>
            <NuxtLink v-if="coordinator" to="/finalization" class="button secondary">Buka finalisasi judul</NuxtLink>
            <button v-if="project.status === 'FINALIZED'" class="button secondary" :disabled="busy" @click="api.download('/projects/' + id + '/letter', 'Penetapan_Judul_Capstone.pdf')">Unduh penetapan (PDF)</button>
          </div>
        </article>

        <p v-if="error" class="notice error" role="alert">{{ error }}</p>
        <p v-if="message" class="notice success" role="status">{{ message }}</p>

        <form v-if="(isTU || isAdmin || coordinator) && project.status === 'SUBMITTED'" class="panel cap-section" @submit.prevent="action('/verify-topic', { status: 'VALID', note: verifyNote })">
          <h2>Verifikasi administrasi usulan topik</h2>
          <p class="muted">Periksa keanggotaan kelompok 2–5 orang, keikutsertaan mata kuliah, kelengkapan berkas usulan, serta tanda tangan calon Pembimbing 1.</p>
          <div class="field">
            <label for="verify-note">Catatan verifikasi (wajib saat meminta perbaikan)</label>
            <textarea id="verify-note" v-model="verifyNote" rows="2" maxlength="2000" />
          </div>
          <div class="cap-actions">
            <button class="button primary" :disabled="busy">Verifikasi Valid</button>
            <button type="button" class="button secondary" :disabled="busy" @click="action('/verify-topic', { status: 'REVISION', note: verifyNote })">Minta lengkapi berkas</button>
          </div>
        </form>

        <TopicSeminarsPanel :project-id="project.id" />

        <CandidateEditor v-if="student" :key="project.version" :project="project" @changed="changed" />
        <SupervisorDecisions :project="project" @changed="changed" />

        <form v-if="(coordinator || isAdmin) && project.status === 'FINALIZED'" class="panel cap-section" @submit.prevent="action('/assignment-letter', letterForm, 'PUT')">
          <h2>Surat Tugas Dosen Pembimbing</h2>
          <p class="muted">Lampirkan Surat Tugas resmi dari institusi beserta tanggal terbitnya (diperlukan untuk verifikasi masa berlaku &lt; 1 tahun pada Ujian Akhir).</p>
          <div class="field-grid">
            <div class="field">
              <label for="st-number">Nomor Surat Tugas</label>
              <input id="st-number" v-model="letterForm.number" required minlength="3" maxlength="100" placeholder="Misal: 123/UN14.2.7/HK.04/2026">
            </div>
            <div class="field">
              <label for="st-date">Tanggal terbit (YYYY-MM-DD)</label>
              <input id="st-date" v-model="letterForm.issued_date" type="date" required>
            </div>
          </div>
          <FileUpload v-model="letterForm.file_id" label="Unggah berkas Surat Tugas Pembimbing (PDF)" />
          <div class="cap-actions">
            <button class="button primary" :disabled="busy || !letterForm.file_id">Simpan Surat Tugas</button>
          </div>
        </form>

        <form v-if="coordinator && project.status === 'SUBMITTED'" class="panel cap-section" aria-label="Minta revisi judul" @submit.prevent="action('/revision', { note })">
          <h2>Permintaan revisi</h2>
          <div class="field">
            <label for="revision-note">Catatan untuk pengusul</label>
            <textarea id="revision-note" v-model="note" required minlength="5" maxlength="2000" rows="3" />
          </div>
          <div><button class="button secondary" :disabled="busy">Kembalikan untuk revisi</button></div>
        </form>

        <form v-if="coordinator && project.status === 'FINALIZED'" class="panel cap-section" aria-label="Koreksi penetapan" @submit.prevent="action('/reopen', { note })">
          <h2>Koreksi penetapan pembimbing</h2>
          <p class="muted">Jika pembimbing kedua belum ditetapkan, buka kembali finalisasi dengan alasan tercatat sebelum pendaftaran UP.</p>
          <div class="field">
            <label for="reopen-note">Alasan koreksi</label>
            <textarea id="reopen-note" v-model="note" required minlength="5" maxlength="2000" rows="3" />
          </div>
          <div><button class="button secondary" :disabled="busy">Buka kembali finalisasi</button></div>
        </form>

        <section class="panel cap-section" aria-labelledby="history-title">
          <h2 id="history-title">Riwayat proses</h2>
          <ol v-if="history?.items.length" class="cap-history">
            <li v-for="item in history.items" :key="item.id">
              <span>{{ historyLabels[item.action] || item.action }}</span>
              <time :datetime="item.created_at">{{ dateTime(item.created_at) }}</time>
            </li>
          </ol>
          <p v-else class="muted">Belum ada riwayat yang dapat ditampilkan.</p>
        </section>
      </div>
    </template>
  </section>
</template>

<style scoped>
.cap-leader { color: var(--accent); font-weight: 650; }
</style>
