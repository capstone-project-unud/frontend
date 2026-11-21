<script setup lang="ts">
import WorkspaceDatePicker from '~/components/workspace/WorkspaceDatePicker.vue'
import PersonPicker from './PersonPicker.vue'
import StatusLabel from './StatusLabel.vue'
import { capstoneAPI, useCapstone } from '../composables/useCapstone'
import type { TopicSeminar } from '../types'
import { dateTime } from '~/utils/format'

const props = defineProps<{ projectId?: string }>()
const api = useCapstone()
const { student, coordinator, busy, error, message } = api
const isAdmin = computed(() => api.user.value?.roles.includes('ADMIN') ?? false)
const isTU = computed(() => api.user.value?.roles.includes('TU') ?? false)
const isLecturer = computed(() => api.user.value?.roles.includes('DOSEN') ?? false)
const fetcher = useRequestFetch()

const { data, status, error: loadError, refresh } = await useAsyncData(
  () => 'topic-seminars-' + (props.projectId || 'all'),
  () => fetcher<{ items: TopicSeminar[] }>(capstoneAPI + '/topic-seminars', { query: props.projectId ? { project_id: props.projectId } : {} }),
)

const scheduleForm = reactive<Record<string, { date: string; time: string; location: string; p1: string; p2: string }>>({})
const evalNotes = reactive<Record<string, string>>({})
const decisionForm = reactive<Record<string, { status: string; note: string }>>({})

watch(data, (val) => {
  for (const item of val?.items || []) {
    if (!scheduleForm[item.id]) {
      scheduleForm[item.id] = {
        date: item.scheduled_at ? item.scheduled_at.slice(0, 10) : '',
        time: item.scheduled_at ? item.scheduled_at.slice(11, 16) : '09:00',
        location: item.location || '',
        p1: item.panelist_1_id || '',
        p2: item.panelist_2_id || '',
      }
    }
    if (!evalNotes[item.id]) evalNotes[item.id] = item.feasibility_notes || ''
    if (!decisionForm[item.id]) decisionForm[item.id] = { status: 'LAYAK', note: item.decision_note || '' }
  }
}, { immediate: true })

async function registerTopic(pid: string) {
  if (await api.mutate('/topic-seminars', { project_id: pid }, 'POST')) await refresh()
}

async function schedule(item: TopicSeminar) {
  const f = scheduleForm[item.id]
  if (!f || !f.date) return
  const iso = new Date(`${f.date}T${f.time || '09:00'}:00+08:00`).toISOString()
  if (await api.mutate(`/topic-seminars/${item.id}/schedule`, {
    scheduled_at: iso,
    location: f.location,
    panelist_1_id: f.p1,
    panelist_2_id: f.p2,
    version: item.version,
  }, 'PUT')) await refresh()
}

async function evaluate(item: TopicSeminar) {
  if (await api.mutate(`/topic-seminars/${item.id}/evaluate`, {
    feasibility_notes: evalNotes[item.id] || '',
    version: item.version,
  }, 'PUT')) await refresh()
}

async function decide(item: TopicSeminar, decision: string) {
  const f = decisionForm[item.id] || { status: decision, note: '' }
  if (await api.mutate(`/topic-seminars/${item.id}/decision`, {
    status: decision,
    note: f.note,
    version: item.version,
  }, 'POST')) await refresh()
}
</script>

<template>
  <div class="panel workspace-panel cap-list-panel">
    <div class="workspace-panel-header">
      <div class="workspace-panel-title">
        <h2>Seminar kelayakan topik</h2>
        <span>{{ data ? `${data.items.length} seminar` : '—' }}</span>
      </div>
      <div v-if="student && projectId && !data?.items.length" class="workspace-panel-actions">
        <button type="button" class="button primary" :disabled="busy" @click="registerTopic(projectId)">Daftar seminar topik</button>
      </div>
    </div>

    <p v-if="error" class="notice error cap-panel-feedback" role="alert">{{ error }}</p>
    <p v-if="message" class="notice success cap-panel-feedback" role="status">{{ message }}</p>
    <p v-if="status === 'pending'" class="cap-loading" role="status">Memuat seminar topik…</p>
    <div v-else-if="loadError" class="empty-state">
      <h3>Data seminar topik belum dapat dimuat</h3>
      <button class="button secondary" @click="refresh()">Coba lagi</button>
    </div>
    <div v-else-if="!data?.items.length" class="empty-state">
      <h3>Belum ada pendaftaran seminar kelayakan topik</h3>
      <p>Setelah usulan topik diajukan dan diverifikasi, daftarkan seminar kelayakan topik bersama Tim Bidang Minat.</p>
    </div>

    <div v-else class="cap-panel-items">
      <article v-for="item in data.items" :key="item.id" class="cap-panel-item">
        <div class="cap-section-heading">
          <div>
            <h3>{{ item.project_title }}</h3>
            <p class="muted">
              {{ item.interest_name }}
              <template v-if="item.scheduled_at"> · {{ dateTime(item.scheduled_at) }} · {{ item.location }}</template>
              <template v-if="item.panelist_1_name"> · Tim Bidang Minat: {{ item.panelist_1_name }} &amp; {{ item.panelist_2_name }}</template>
            </p>
          </div>
          <StatusLabel :value="item.status" />
        </div>

        <p v-if="item.feasibility_notes" class="notice">Hasil telaah Tim Bidang Minat: {{ item.feasibility_notes }}</p>
        <p v-if="item.decision_note" class="notice">Keputusan Koordinator: {{ item.decision_note }}</p>

        <form v-if="(coordinator || isAdmin || isTU) && item.status !== 'LAYAK'" class="cap-review" @submit.prevent="schedule(item)">
          <h4>Jadwalkan Seminar Kelayakan Topik</h4>
          <div class="field-row">
            <div class="field">
              <label :for="'ts-date-' + item.id">Tanggal</label>
              <WorkspaceDatePicker :id="'ts-date-' + item.id" v-model="scheduleForm[item.id]!.date" label="Tanggal seminar topik" />
            </div>
            <div class="field">
              <label :for="'ts-time-' + item.id">Waktu (WITA)</label>
              <input :id="'ts-time-' + item.id" v-model="scheduleForm[item.id]!.time" type="time" required>
            </div>
          </div>
          <div class="field">
            <label :for="'ts-loc-' + item.id">Ruang atau tautan daring</label>
            <input :id="'ts-loc-' + item.id" v-model="scheduleForm[item.id]!.location" required minlength="3" maxlength="250" placeholder="Misal: Ruang Rapat PSTI / Google Meet">
          </div>
          <div class="field-row">
            <PersonPicker v-model="scheduleForm[item.id]!.p1" role="DOSEN" label="Dosen Penilai 1 (Bidang Minat)" :current-name="item.panelist_1_name" />
            <PersonPicker v-model="scheduleForm[item.id]!.p2" role="DOSEN" label="Dosen Penilai 2 (Bidang Minat)" :current-name="item.panelist_2_name" />
          </div>
          <div class="cap-actions">
            <button class="button primary" :disabled="busy">Simpan jadwal &amp; penilai</button>
          </div>
        </form>

        <form v-if="isLecturer && (item.panelist_1_id === api.user.value?.id || item.panelist_2_id === api.user.value?.id)" class="cap-review" @submit.prevent="evaluate(item)">
          <div class="field">
            <label :for="'ts-eval-' + item.id">Rumusan hasil kelayakan topik (Tim Bidang Minat)</label>
            <textarea :id="'ts-eval-' + item.id" v-model="evalNotes[item.id]" rows="2" required minlength="5" maxlength="3000" />
          </div>
          <div class="cap-actions">
            <button class="button primary" :disabled="busy">Simpan hasil telaah kelayakan</button>
          </div>
        </form>

        <form v-if="coordinator" class="cap-review" @submit.prevent="decide(item, 'LAYAK')">
          <div class="field">
            <label :for="'ts-dec-' + item.id">Catatan keputusan resmi Program Studi</label>
            <textarea :id="'ts-dec-' + item.id" v-model="decisionForm[item.id]!.note" rows="2" required minlength="5" maxlength="2000" />
          </div>
          <div class="cap-actions">
            <button class="button primary" :disabled="busy">Tetapkan topik Layak</button>
            <button type="button" class="button secondary" :disabled="busy" @click="decide(item, 'REVISI')">Minta revisi topik</button>
            <button type="button" class="button secondary" :disabled="busy" @click="decide(item, 'DITOLAK')">Tolak topik</button>
          </div>
        </form>
      </article>
    </div>
  </div>
</template>

<style scoped>
.field-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
@media (max-width: 720px) { .field-row { grid-template-columns: minmax(0, 1fr); } }
</style>
