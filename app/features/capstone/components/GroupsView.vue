<script setup lang="ts">
import WorkspaceFilter from '~/components/workspace/WorkspaceFilter.vue'
import WorkspaceSelect from '~/components/workspace/WorkspaceSelect.vue'
import PersonPicker from './PersonPicker.vue'
import StatusLabel from './StatusLabel.vue'
import { capstoneAPI, useCapstone } from '../composables/useCapstone'
import type { AcademicPeriod, CapstoneGroup, Interest, MemberInput } from '../types'
import { dateTime } from '~/utils/format'

const api = useCapstone()
const { student, staff, busy, error, message } = api
const fetcher = useRequestFetch()
const periodFilter = shallowRef('')
const statusFilter = shallowRef('')

const { data, status, error: loadError, refresh } = await useAsyncData(
  'capstone-groups',
  () => fetcher<{ items: CapstoneGroup[] }>(capstoneAPI + '/groups', {
    query: { academic_period_id: periodFilter.value, status: statusFilter.value },
  }),
  { watch: [periodFilter, statusFilter] },
)
const { data: periods } = await useAsyncData('master-periods-groups', () => fetcher<{ items: AcademicPeriod[] }>(capstoneAPI + '/master/periods'))
const { data: interests } = await useAsyncData('capstone-interests-groups', () => fetcher<{ items: Interest[] }>(capstoneAPI + '/interests'))

const editingGroup = shallowRef<CapstoneGroup | null>(null)
const showForm = shallowRef(false)
const ownID = computed(() => api.user.value?.id || '')

interface GroupMemberDraft {
  student_id: string
  student_name: string
  is_leader: boolean
  responsibility: string
}

const form = reactive<{
  academic_period_id: string
  interest_id: string
  working_title: string
  initial_description: string
  finalize: boolean
  members: GroupMemberDraft[]
  version: number
}>({
  academic_period_id: '',
  interest_id: '',
  working_title: '',
  initial_description: '',
  finalize: false,
  members: [],
  version: 0,
})

const activePeriodOptions = computed(() => (periods.value?.items || []).filter(p => p.group_open || p.is_active).map(p => ({ value: p.id, label: `${p.name} (${p.semester})` })))
const periodFilterOptions = computed(() => [{ value: '', label: 'Semua periode' }, ...(periods.value?.items || []).map(p => ({ value: p.id, label: p.name }))])
const interestOptions = computed(() => (interests.value?.items || []).filter(i => i.is_active).map(i => ({ value: i.id, label: i.name })))
const statusFilterOptions = [
  { value: '', label: 'Semua status' },
  { value: 'DRAFT', label: 'Draf' },
  { value: 'READY', label: 'Siap' },
  { value: 'LOCKED', label: 'Terkunci' },
]

function openCreate(group?: CapstoneGroup) {
  editingGroup.value = group || null
  error.value = ''
  if (group) {
    form.academic_period_id = group.academic_period_id
    form.interest_id = group.interest_id
    form.working_title = group.working_title
    form.initial_description = group.initial_description
    form.finalize = group.status === 'READY'
    form.version = group.version
    form.members = group.members.map(m => ({
      student_id: m.student_id,
      student_name: m.student_name,
      is_leader: m.is_leader,
      responsibility: m.responsibility,
    }))
  } else {
    form.academic_period_id = activePeriodOptions.value[0]?.value || ''
    form.interest_id = interestOptions.value[0]?.value || ''
    form.working_title = ''
    form.initial_description = ''
    form.finalize = true
    form.version = 0
    form.members = [
      { student_id: ownID.value, student_name: api.user.value?.full_name || '', is_leader: true, responsibility: '' },
      { student_id: '', student_name: '', is_leader: false, responsibility: '' },
    ]
  }
  showForm.value = true
}

function setLeader(index: number) {
  form.members.forEach((m, idx) => { m.is_leader = idx === index })
}

async function saveGroup() {
  const path = editingGroup.value ? `/groups/${editingGroup.value.id}` : '/groups'
  const method = editingGroup.value ? 'PUT' : 'POST'
  const res = await api.mutate<{ group: CapstoneGroup }>(path, {
    academic_period_id: form.academic_period_id,
    interest_id: form.interest_id,
    working_title: form.working_title,
    initial_description: form.initial_description,
    finalize: form.finalize,
    version: form.version,
    members: form.members.map(m => ({
      student_id: m.student_id,
      is_leader: m.is_leader,
      responsibility: m.responsibility,
    })),
  }, method)
  if (res) {
    showForm.value = false
    editingGroup.value = null
    await refresh()
  }
}

const myGroupExists = computed(() => student.value && (data.value?.items || []).some(g => g.members.some(m => m.student_id === ownID.value)))

function groupAdvisorsForMember(g: CapstoneGroup, studentId: string): { p1: string; p2: string } {
  const a1 = g.advisors.find(a => a.student_id === studentId && a.slot === 1)
  const a2 = g.advisors.find(a => a.student_id === studentId && a.slot === 2)
  return {
    p1: a1?.supervisor_name || (a1?.candidate_name ? `${a1.candidate_name} (Calon)` : '—'),
    p2: a2?.supervisor_name || (a2?.candidate_name ? `${a2.candidate_name} (Calon)` : '—'),
  }
}
</script>

<template>
  <section>
    <form v-if="student && showForm" class="panel cap-section" aria-labelledby="group-form-title" @submit.prevent="saveGroup">
      <div class="cap-section-heading">
        <div>
          <h2 id="group-form-title">{{ editingGroup ? 'Perbarui kelompok capstone' : 'Bentuk kelompok capstone' }}</h2>
          <p class="muted">Tambahkan 2–5 anggota terdaftar, tetapkan satu Ketua Kelompok, dan uraikan tanggung jawab masing-masing anggota sebelum mengajukan topik.</p>
        </div>
        <button type="button" class="button secondary" :disabled="busy" @click="showForm = false">Tutup</button>
      </div>

      <fieldset class="cap-fieldset" :disabled="busy">
        <div class="field-row">
          <div class="field">
            <label for="group-period">Periode akademik</label>
            <WorkspaceSelect id="group-period" v-model="form.academic_period_id" label="Periode akademik" :options="activePeriodOptions" placeholder="Pilih periode" required :disabled="busy" />
          </div>
          <div class="field">
            <label for="group-interest">Bidang minat</label>
            <WorkspaceSelect id="group-interest" v-model="form.interest_id" label="Bidang minat" :options="interestOptions" placeholder="Pilih bidang minat" required :disabled="busy" />
          </div>
        </div>

        <div class="field">
          <label for="group-title">Judul kerja / gagasan awal proyek</label>
          <input id="group-title" v-model="form.working_title" required minlength="5" maxlength="500" placeholder="Contoh: Sistem Monitoring Kualitas Air Tambak Berbasis IoT">
        </div>
        <div class="field">
          <label for="group-desc">Deskripsi awal permasalahan dan rencana solusi</label>
          <textarea id="group-desc" v-model="form.initial_description" required minlength="10" maxlength="10000" rows="3" />
        </div>

        <div class="member-list-editor">
          <div class="cap-section-heading">
            <h3>Daftar anggota (2–5 mahasiswa)</h3>
            <button v-if="form.members.length < 5" type="button" class="button secondary" @click="form.members.push({ student_id: '', student_name: '', is_leader: false, responsibility: '' })">Tambah anggota</button>
          </div>
          <div v-for="(member, index) in form.members" :key="index" class="member-row">
            <div class="cap-section-heading">
              <strong>Anggota {{ index + 1 }}{{ member.student_id === ownID ? ' · Anda' : '' }}</strong>
              <div class="cap-actions">
                <label class="radio-inline">
                  <input type="radio" name="group_leader" :checked="member.is_leader" @change="setLeader(index)">
                  <span>Ketua kelompok</span>
                </label>
                <button v-if="member.student_id !== ownID && form.members.length > 2" type="button" class="workspace-text-action secondary" @click="form.members.splice(index, 1)">Hapus</button>
              </div>
            </div>
            <div class="field-row">
              <PersonPicker v-model="member.student_id" role="MAHASISWA" label="Pilih mahasiswa" :disabled="member.student_id === ownID" :current-name="member.student_name" />
              <div class="field">
                <label :for="'resp-' + index">Tanggung jawab anggota</label>
                <input :id="'resp-' + index" v-model="member.responsibility" maxlength="500" :required="form.finalize" placeholder="Contoh: Koordinator, Perancangan Hardware / Backend API">
              </div>
            </div>
          </div>
        </div>

        <label class="check-field">
          <input v-model="form.finalize" type="checkbox">
          <span>Tandai kelompok <strong>Siap</strong> untuk melanjutkan pengajuan usulan topik.</span>
        </label>
      </fieldset>

      <div class="cap-actions">
        <button class="button primary" :disabled="busy || !activePeriodOptions.length || !interestOptions.length">
          {{ busy ? 'Menyimpan…' : editingGroup ? 'Simpan perubahan kelompok' : 'Simpan kelompok' }}
        </button>
      </div>
    </form>

    <div class="panel workspace-panel cap-list-panel">
      <div class="workspace-panel-header">
        <div class="workspace-panel-title">
          <h2>Kelompok capstone project</h2>
          <span>{{ data ? `${data.items.length} kelompok` : '—' }}</span>
        </div>
        <div class="workspace-panel-actions">
          <button v-if="student && !showForm && !myGroupExists" type="button" class="button primary" @click="openCreate()">
            <span aria-hidden="true" class="cap-plus">+</span> Buat kelompok
          </button>
        </div>
      </div>

      <div class="workspace-toolbar">
        <WorkspaceFilter id="group-period-filter" v-model="periodFilter" label="Periode akademik" :options="periodFilterOptions" />
        <WorkspaceFilter id="group-status-filter" v-model="statusFilter" label="Status kelompok" :options="statusFilterOptions" />
        <button v-if="periodFilter || statusFilter" type="button" class="workspace-text-action secondary" @click="periodFilter = ''; statusFilter = ''">Reset filter</button>
      </div>

      <p v-if="error" class="notice error cap-panel-feedback" role="alert">{{ error }}</p>
      <p v-if="message" class="notice success cap-panel-feedback" role="status">{{ message }}</p>
      <p v-if="status === 'pending'" class="cap-loading" role="status">Memuat kelompok…</p>
      <div v-else-if="loadError" class="empty-state">
        <h2>Data kelompok belum dapat dimuat</h2>
        <p>Periksa koneksi lalu coba kembali.</p>
        <button class="button secondary" @click="refresh()">Coba lagi</button>
      </div>
      <div v-else-if="!data?.items.length" class="empty-state">
        <h2>Belum ada kelompok terdaftar</h2>
        <p>{{ student ? 'Langkah pertama Capstone: bentuk kelompok 2–5 mahasiswa, tentukan Ketua, bidang minat, dan pembagian tugas.' : 'Kelompok yang dibentuk mahasiswa akan tampil di sini.' }}</p>
        <button v-if="student && !showForm" type="button" class="button primary" @click="openCreate()">Buat kelompok sekarang</button>
      </div>

      <div v-else class="cap-panel-items">
        <article v-for="group in data.items" :key="group.id" class="cap-panel-item">
          <div class="cap-section-heading">
            <div>
              <h2>{{ group.code }} · {{ group.project_title || group.working_title }}</h2>
              <p class="muted">{{ group.academic_period_name }} · {{ group.interest_name }} · Ketua: <strong>{{ group.leader_name || '—' }}</strong> · {{ dateTime(group.updated_at) }}</p>
            </div>
            <div class="cap-actions">
              <StatusLabel :value="group.status" />
              <StatusLabel v-if="group.project_status" :value="group.project_status" />
            </div>
          </div>

          <p class="cap-preserve">{{ group.initial_description }}</p>

          <div class="workspace-table cap-table-wrap" tabindex="0">
            <table class="workspace-table cap-table">
              <thead>
                <tr>
                  <th scope="col">Anggota</th>
                  <th scope="col">Peran</th>
                  <th scope="col">Tanggung jawab</th>
                  <th scope="col">Pembimbing 1</th>
                  <th scope="col">Pembimbing 2</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in group.members" :key="m.student_id">
                  <td><strong>{{ m.student_name }}</strong><small>{{ m.nim }}</small></td>
                  <td><strong :class="m.is_leader ? 'leader-tag' : 'muted'">{{ m.is_leader ? 'Ketua kelompok' : 'Anggota' }}</strong></td>
                  <td>{{ m.responsibility || '—' }}</td>
                  <td>{{ groupAdvisorsForMember(group, m.student_id).p1 }}</td>
                  <td>{{ groupAdvisorsForMember(group, m.student_id).p2 }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="cap-actions">
            <button v-if="student && group.status !== 'LOCKED' && group.members.some(m => m.student_id === ownID)" type="button" class="button secondary" @click="openCreate(group)">Ubah anggota &amp; tugas</button>
            <NuxtLink v-if="student && group.status === 'READY' && !group.project_id && group.members.some(m => m.student_id === ownID)" class="button primary" :to="`/capstone/new?group_id=${group.id}`">Ajukan usulan topik</NuxtLink>
            <NuxtLink v-if="group.project_id" class="button secondary" :to="`/capstone/${group.project_id}`">Buka usulan topik &amp; judul</NuxtLink>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.field-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.member-list-editor { display: grid; gap: .75rem; }
.radio-inline { display: inline-flex; align-items: center; gap: .45rem; font-size: .875rem; font-weight: 600; cursor: pointer; }
.leader-tag { color: var(--accent); font-weight: 650; }
@media (max-width: 767px) { .field-row { grid-template-columns: minmax(0, 1fr); } }
</style>
