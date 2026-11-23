<script setup lang="ts">
import WorkspaceSelect from '~/components/workspace/WorkspaceSelect.vue'
import type { CapstoneGroup, Interest, MemberInput, Project, ProjectInput } from '../types'
import { capstoneAPI, useCachedReference, useCapstone } from '../composables/useCapstone'
import PersonPicker from './PersonPicker.vue'
import FileUpload from './FileUpload.vue'

const props = defineProps<{ project?: Project }>()
const api = useCapstone()
const { busy, error } = api
const emit = defineEmits<{ saved: [project: Project]; cancel: [] }>()
const fetcher = useRequestFetch()
const route = useRoute()

const { data: interests, error: interestError, refresh } = await useCachedReference<{ items: Interest[] }>('capstone-interests', '/interests')
const { data: groupsData } = await useLazyAsyncData('capstone-groups-for-topic', () => fetcher<{ items: CapstoneGroup[] }>(capstoneAPI + '/groups'))

const fields = computed(() => interests.value?.items.filter(i => i.is_active) || [])
const ownID = computed(() => api.user.value?.id || '')

const linkedGroup = computed(() => {
  const qid = typeof route.query.group_id === 'string' ? route.query.group_id : props.project?.group_id
  if (!qid) return null
  return (groupsData.value?.items || []).find(g => g.id === qid) || null
})

function initialMembers(): MemberInput[] {
  if (props.project) {
    return props.project.students
      .filter(r => r.slot === 1)
      .map(r => {
        const slot2 = props.project?.students.find(s => s.student_id === r.student_id && s.slot === 2)
        return {
          student_id: r.student_id,
          is_leader: r.is_leader ?? (r.student_id === props.project?.owner_id),
          responsibility: r.responsibility || '',
          candidate_1: r.candidate_id,
          candidate_2: slot2?.candidate_id || null,
          is_external_supervisor: slot2?.is_external_supervisor || false,
          external_supervisor_name: slot2?.external_supervisor_name || '',
          external_supervisor_institution: slot2?.external_supervisor_institution || '',
        }
      })
  }
  if (linkedGroup.value) {
    return linkedGroup.value.members.map(m => ({
      student_id: m.student_id,
      is_leader: m.is_leader,
      responsibility: m.responsibility,
      candidate_1: null,
      candidate_2: null,
      is_external_supervisor: false,
      external_supervisor_name: '',
      external_supervisor_institution: '',
    }))
  }
  return [
    { student_id: ownID.value, is_leader: true, responsibility: 'Ketua Kelompok', candidate_1: null, candidate_2: null, is_external_supervisor: false, external_supervisor_name: '', external_supervisor_institution: '' },
    { student_id: '', is_leader: false, responsibility: 'Anggota Tim', candidate_1: null, candidate_2: null, is_external_supervisor: false, external_supervisor_name: '', external_supervisor_institution: '' },
  ]
}

const form = reactive<ProjectInput>({
  group_id: props.project?.group_id || linkedGroup.value?.id || null,
  academic_period_id: props.project?.academic_period_id || linkedGroup.value?.academic_period_id || null,
  title: props.project?.title || linkedGroup.value?.working_title || '',
  summary: props.project?.summary || linkedGroup.value?.initial_description || '',
  interest_id: props.project?.interest_id || linkedGroup.value?.interest_id || '',
  description_file_id: props.project?.description_file_id || null,
  signed_description: props.project?.signed_description || false,
  members: initialMembers(),
  version: props.project?.version || 0,
})

watch(linkedGroup, (g) => {
  if (!props.project && g && !form.group_id) {
    form.group_id = g.id
    form.academic_period_id = g.academic_period_id
    form.interest_id = g.interest_id
    if (!form.title) form.title = g.working_title
    if (!form.summary) form.summary = g.initial_description
    form.members = g.members.map(m => ({
      student_id: m.student_id,
      is_leader: m.is_leader,
      responsibility: m.responsibility,
      candidate_1: null,
      candidate_2: null,
    }))
  }
})

const interestOptions = computed(() => fields.value.map(i => ({ value: i.id, label: i.name })))
function setLeader(index: number) {
  form.members.forEach((m, i) => { m.is_leader = i === index })
}

async function save() {
  const path = linkedGroup.value && !props.project ? `/groups/${linkedGroup.value.id}/topic` : (props.project ? '/projects/' + props.project.id : '/projects')
  const method = props.project ? 'PUT' : 'POST'
  const result = await api.mutate<{ project: Project }>(path, form, method)
  if (result) emit('saved', result.project)
}

function studentName(id: string) {
  return props.project?.students.find(r => r.student_id === id)?.student_name
    || linkedGroup.value?.members.find(m => m.student_id === id)?.student_name
    || ''
}
</script>

<template>
  <form class="cap-form" aria-label="Formulir usulan topik capstone" @submit.prevent="save">
    <div v-if="interestError" class="notice error" role="alert">
      Bidang minat belum dapat dimuat. <button type="button" class="button secondary" @click="refresh()">Coba lagi</button>
    </div>
    <p v-if="linkedGroup" class="notice">
      Terhubung ke kelompok <strong>{{ linkedGroup.code }}</strong> ({{ linkedGroup.academic_period_name }}). Anggota, ketua, dan pembagian tugas diambil otomatis dari data kelompok.
    </p>

    <fieldset class="panel cap-section" :disabled="busy">
      <legend>Usulan topik &amp; deskripsi capstone</legend>
      <div class="field">
        <label for="project-title">Judul usulan topik capstone</label>
        <input id="project-title" v-model="form.title" required minlength="5" maxlength="500">
      </div>
      <div class="field">
        <label for="project-interest">Bidang minat</label>
        <WorkspaceSelect id="project-interest" v-model="form.interest_id" label="Bidang minat" :options="interestOptions" placeholder="Pilih bidang minat" required :disabled="busy || !!linkedGroup" />
        <small v-if="!fields.length">Bidang minat belum tersedia. Hubungi admin atau koordinator capstone.</small>
      </div>
      <div class="field">
        <label for="project-summary">Ringkasan masalah dan solusi yang diusulkan</label>
        <textarea id="project-summary" v-model="form.summary" rows="5" required minlength="10" maxlength="10000" />
      </div>
      <FileUpload v-model="form.description_file_id" label="Dokumen usulan topik bertanda tangan calon pembimbing (PDF)" />
      <label class="check-field">
        <input v-model="form.signed_description" type="checkbox">
        Dokumen usulan telah mendapat tanda tangan persetujuan calon pembimbing.
      </label>
      <p class="muted">Persetujuan judul dan kesediaan membimbing tetap dicatat secara terpisah oleh setiap dosen pada aplikasi.</p>
    </fieldset>

    <fieldset class="panel cap-section" :disabled="busy">
      <legend>Anggota, peran, dan calon pembimbing</legend>
      <p class="muted">Setiap mahasiswa (2–5 anggota) menetapkan Ketua Kelompok, pembagian tugas, serta calon Pembimbing 1 &amp; 2 masing-masing.</p>
      <div v-for="(member, index) in form.members" :key="index" class="member-row">
        <div class="cap-section-heading">
          <h3>Mahasiswa {{ index + 1 }}{{ member.student_id === ownID ? ' · Anda' : '' }}</h3>
          <div class="cap-actions">
            <label class="radio-inline">
              <input type="radio" name="topic_leader" :checked="!!member.is_leader" :disabled="!!linkedGroup" @change="setLeader(index)">
              <span>Ketua</span>
            </label>
            <button v-if="!linkedGroup && member.student_id !== ownID && form.members.length > 2" type="button" class="button secondary" @click="form.members.splice(index, 1)">
              Hapus anggota {{ index + 1 }}
            </button>
          </div>
        </div>
        <div class="field-grid">
          <PersonPicker v-model="member.student_id" role="MAHASISWA" label="Mahasiswa" :disabled="member.student_id === ownID || !!linkedGroup" :current-name="member.student_id === ownID ? api.user.value?.full_name : studentName(member.student_id)" />
          <div class="field">
            <label :for="'topic-resp-' + index">Tanggung jawab anggota</label>
            <input :id="'topic-resp-' + index" v-model="member.responsibility" maxlength="500" :disabled="!!linkedGroup" placeholder="Tugas di kelompok">
          </div>
        </div>
        <div class="field-grid">
          <PersonPicker v-model="member.candidate_1" role="DOSEN" label="Calon pembimbing 1" :current-name="project?.students.find(s => s.student_id === member.student_id && s.slot === 1)?.candidate_name" />
          <PersonPicker v-model="member.candidate_2" role="DOSEN" label="Calon pembimbing 2" :current-name="project?.students.find(s => s.student_id === member.student_id && s.slot === 2)?.candidate_name" />
        </div>
        <label class="check-field">
          <input v-model="member.is_external_supervisor" type="checkbox">
          <span>Libatkan pembimbing mitra / eksternal industri (opsional)</span>
        </label>
        <div v-if="member.is_external_supervisor" class="field-grid">
          <div class="field">
            <label :for="'ext-name-' + index">Nama pembimbing mitra / eksternal</label>
            <input :id="'ext-name-' + index" v-model="member.external_supervisor_name" maxlength="150" placeholder="Nama lengkap &amp; gelar pembimbing mitra">
          </div>
          <div class="field">
            <label :for="'ext-inst-' + index">Instansi / perusahaan mitra</label>
            <input :id="'ext-inst-' + index" v-model="member.external_supervisor_institution" maxlength="200" placeholder="Contoh: PT Teknologi Nusantara / Diskominfo">
          </div>
        </div>
      </div>
      <button v-if="!linkedGroup && form.members.length < 5" type="button" class="button secondary" @click="form.members.push({ student_id: '', is_leader: false, responsibility: 'Anggota Tim', candidate_1: null, candidate_2: null, is_external_supervisor: false, external_supervisor_name: '', external_supervisor_institution: '' })">
        Tambah anggota
      </button>
    </fieldset>

    <p v-if="error" class="notice error" role="alert">{{ error }}</p>
    <div class="cap-actions">
      <button type="button" class="button secondary" :disabled="busy" @click="emit('cancel')">Batal</button>
      <button class="button primary" :disabled="busy || !fields.length">{{ busy ? 'Menyimpan…' : 'Simpan usulan topik' }}</button>
    </div>
  </form>
</template>

<style scoped>
.radio-inline { display: inline-flex; align-items: center; gap: .45rem; font-size: .875rem; font-weight: 600; cursor: pointer; }
</style>
