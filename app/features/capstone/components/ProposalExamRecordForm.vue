<script setup lang="ts">
import WorkspaceSelect from '~/components/workspace/WorkspaceSelect.vue'
import WorkspaceDatePicker from '~/components/workspace/WorkspaceDatePicker.vue'
import PersonPicker from './PersonPicker.vue'
import type { Project, Proposal } from '../types'
import type { ProposalExam } from '../proposal'
import { useCapstone } from '../composables/useCapstone'
const props = defineProps<{ application: Proposal; project: Project; exam?: ProposalExam }>()
const emit = defineEmits<{ saved: [] }>()
const api = useCapstone()
const { busy, error } = api
const local = props.exam ? new Date(new Date(props.exam.scheduled_at).getTime() + 8 * 3600000).toISOString() : ''
const date = shallowRef(local.slice(0, 10))
const hour = shallowRef(local.slice(11, 13) || '08')
const minute = shallowRef(local.slice(14, 16) || '00')
const location = shallowRef(props.exam?.location || '')
const examiners = reactive<{ id: string | null }[]>([1, 2, 3].map(n => ({ id: props.exam?.panel.find(p => p.role === 'EXAMINER_' + n)?.id || null })))
const supervisors = computed(() => props.project.students.filter(s => s.student_id === props.application.student_id).sort((a, b) => a.slot - b.slot))
const frozen = computed(() => !!props.exam && (props.exam.evaluations.length > 0 || props.exam.attendance.length > 0))
const hours = Array.from({ length: 24 }, (_, n) => ({ value: String(n).padStart(2, '0'), label: String(n).padStart(2, '0') }))
const minutes = Array.from({ length: 60 }, (_, n) => ({ value: String(n).padStart(2, '0'), label: String(n).padStart(2, '0') }))
const duplicateOrSupervisorError = computed(() => {
 const ids = examiners.map(e => e.id).filter((v): v is string => !!v)
 if (new Set(ids).size !== ids.length) return 'Ketiga penguji harus dosen yang berbeda.'
 const supIDs = supervisors.value.map(s => s.supervisor_id).filter((v): v is string => !!v)
 if (ids.some(id => supIDs.includes(id))) return 'Penguji harus berbeda dari pembimbing Anda.'
 return ''
})
async function save() {
 if (frozen.value || !date.value || duplicateOrSupervisorError.value || examiners.some(p => !p.id)) return
 if (await api.mutate('/proposal-exams', { application_id: props.application.id, scheduled_at: `${date.value}T${hour.value}:${minute.value}:00+08:00`, location: location.value, examiner_1_id: examiners[0]?.id, examiner_2_id: examiners[1]?.id, examiner_3_id: examiners[2]?.id, version: props.exam?.version || 0 })) emit('saved')
}
</script>
<template>
 <form class="panel cap-section" aria-labelledby="exam-record-title" @submit.prevent="save">
  <h2 id="exam-record-title">Catat informasi ujian Anda</h2><p class="muted">Masukkan tanggal dan penguji sesuai jadwal ujian Anda. Waktu menggunakan WITA.</p>
  <p v-if="frozen" class="notice">Informasi terkunci setelah dosen mengisi presensi atau nilai.</p>
  <fieldset class="cap-fieldset" :disabled="busy || frozen">
   <p>{{ application.title }}</p><div class="field-grid"><div v-for="s in supervisors" :key="s.slot" class="field"><h3>Pembimbing {{ s.slot }} (otomatis)</h3><p>{{ s.supervisor_name || s.external_supervisor_name || 'Belum ditetapkan' }}</p></div></div>
   <div class="field-grid"><div class="field"><label for="exam-record-date">Tanggal ujian</label><WorkspaceDatePicker id="exam-record-date" v-model="date" label="Tanggal ujian" required :disabled="busy || frozen" min="2020-01-01" max="2100-12-31" /></div><div class="field"><label for="exam-record-hour">Jam (WITA)</label><WorkspaceSelect id="exam-record-hour" v-model="hour" label="Jam ujian" :options="hours" :disabled="busy || frozen" required /></div><div class="field"><label for="exam-record-minute">Menit</label><WorkspaceSelect id="exam-record-minute" v-model="minute" label="Menit ujian" :options="minutes" :disabled="busy || frozen" required /></div></div>
   <div class="field"><label for="exam-record-location">Lokasi atau tautan ujian</label><input id="exam-record-location" v-model="location" required minlength="3" maxlength="250"></div>
   <div class="field-grid"><PersonPicker v-for="(examiner, i) in examiners" :key="i" v-model="examiner.id" role="DOSEN" :label="'Penguji ' + (i + 1)" :disabled="busy || frozen" :current-name="exam?.panel.find(p => p.role === 'EXAMINER_' + (i + 1))?.name" /></div>
  </fieldset>
  <p v-if="duplicateOrSupervisorError" class="notice error" role="alert">{{ duplicateOrSupervisorError }}</p>
  <p v-if="error" class="notice error" role="alert">{{ error }}</p><div><button class="button primary" :disabled="busy || frozen || !date || !!duplicateOrSupervisorError || examiners.some(p => !p.id)">{{ busy ? 'Menyimpan…' : exam ? 'Simpan perubahan informasi' : 'Simpan informasi ujian' }}</button></div>
 </form>
</template>
