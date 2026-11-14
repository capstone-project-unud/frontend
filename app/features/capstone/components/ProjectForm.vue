<script setup lang="ts">
import WorkspaceSelect from '~/components/workspace/WorkspaceSelect.vue'

import type { Interest, Project, ProjectInput, MemberInput } from '../types'
import { capstoneAPI, useCapstone } from '../composables/useCapstone'
import PersonPicker from './PersonPicker.vue'
import FileUpload from './FileUpload.vue'
const props = defineProps<{ project?: Project }>()
const api = useCapstone()
const { busy, error } = api
const emit = defineEmits<{ saved: [project: Project]; cancel: [] }>()
const fetcher = useRequestFetch()
const { data: interests, error: interestError, refresh } = await useAsyncData('capstone-interests', () => fetcher<{ items: Interest[] }>(capstoneAPI + '/interests'))
const fields = computed(() => interests.value?.items.filter(i => i.is_active) || [])
function initialMembers(): MemberInput[] {
 if (props.project) return props.project.students.filter(r => r.slot === 1).map(r => ({ student_id: r.student_id, candidate_1: r.candidate_id, candidate_2: props.project?.students.find(s => s.student_id === r.student_id && s.slot === 2)?.candidate_id || null }))
 return [{ student_id: api.user.value?.id || '', candidate_1: null, candidate_2: null }, { student_id: '', candidate_1: null, candidate_2: null }]
}
const form = reactive<ProjectInput>({ title: props.project?.title || '', summary: props.project?.summary || '', interest_id: props.project?.interest_id || '', description_file_id: props.project?.description_file_id || null, signed_description: props.project?.signed_description || false, members: initialMembers(), version: props.project?.version || 0 })
const interestOptions = computed(() => fields.value.map(i => ({ value: i.id, label: i.name })))
const ownID = computed(() => api.user.value?.id)
async function save() { const result = await api.mutate<{ project: Project }>(props.project ? '/projects/' + props.project.id : '/projects', form, props.project ? 'PUT' : 'POST'); if (result) emit('saved', result.project) }
function studentName(id: string) { return props.project?.students.find(r => r.student_id === id)?.student_name || '' }
</script>
<template>
 <form class="cap-form" aria-label="Formulir judul capstone" @submit.prevent="save">
  <div v-if="interestError" class="notice error" role="alert">Bidang minat belum dapat dimuat. <button type="button" class="button secondary" @click="refresh()">Coba lagi</button></div>
  <fieldset class="panel cap-section" :disabled="busy">
   <legend>Deskripsi capstone</legend>
   <div class="field"><label for="project-title">Judul capstone</label><input id="project-title" v-model="form.title" required minlength="5" maxlength="500"></div>
   <div class="field"><label for="project-interest">Bidang minat</label><WorkspaceSelect id="project-interest" v-model="form.interest_id" label="Bidang minat" :options="interestOptions" placeholder="Pilih bidang minat" required :disabled="busy" /><small v-if="!fields.length">Bidang minat belum tersedia. Hubungi admin atau koordinator TA.</small></div>
   <div class="field"><label for="project-summary">Ringkasan deskripsi</label><textarea id="project-summary" v-model="form.summary" rows="5" required minlength="10" maxlength="10000" /></div>
   <FileUpload v-model="form.description_file_id" label="Berkas deskripsi dengan pengesahan calon pembimbing (PDF)" />
   <label class="check-field"><input v-model="form.signed_description" type="checkbox">Deskripsi telah mendapat pengesahan calon pembimbing.</label>
   <p class="muted">Pengesahan pada berkas tetap diperlukan. Persetujuan judul dan kesediaan membimbing akan dicatat terpisah di aplikasi.</p>
  </fieldset>
  <fieldset class="panel cap-section" :disabled="busy">
   <legend>Anggota dan calon pembimbing</legend><p class="muted">Daftarkan 2–5 mahasiswa, termasuk Anda. Setiap mahasiswa dapat memiliki calon pembimbing yang berbeda.</p>
   <div v-for="(member, index) in form.members" :key="index" class="member-row">
    <div class="cap-section-heading"><h3>Mahasiswa {{ index + 1 }}{{ member.student_id === ownID ? ' · Anda' : '' }}</h3><button v-if="member.student_id !== ownID && form.members.length > 2" type="button" class="button secondary" @click="form.members.splice(index, 1)">Hapus anggota {{ index + 1 }}</button></div>
    <PersonPicker v-model="member.student_id" role="MAHASISWA" label="Mahasiswa" :disabled="member.student_id === ownID" :current-name="member.student_id === ownID ? api.user.value?.full_name : studentName(member.student_id)" />
    <div class="field-grid"><PersonPicker v-model="member.candidate_1" role="DOSEN" label="Calon pembimbing 1" :current-name="project?.students.find(s => s.student_id === member.student_id && s.slot === 1)?.candidate_name" /><PersonPicker v-model="member.candidate_2" role="DOSEN" label="Calon pembimbing 2" :current-name="project?.students.find(s => s.student_id === member.student_id && s.slot === 2)?.candidate_name" /></div>
   </div>
   <button v-if="form.members.length < 5" type="button" class="button secondary" @click="form.members.push({ student_id: '', candidate_1: null, candidate_2: null })">Tambah anggota</button>
  </fieldset>
  <p v-if="error" class="notice error" role="alert">{{ error }}</p>
  <div class="cap-actions"><button type="button" class="button secondary" :disabled="busy" @click="emit('cancel')">Batal</button><button class="button primary" :disabled="busy || !fields.length">{{ busy ? 'Menyimpan…' : 'Simpan draf judul' }}</button></div>
 </form>
</template>
