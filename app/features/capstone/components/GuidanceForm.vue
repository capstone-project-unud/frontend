<script setup lang="ts">
import WorkspaceSelect from '~/components/workspace/WorkspaceSelect.vue'
import WorkspaceDatePicker from '~/components/workspace/WorkspaceDatePicker.vue'
import { calendarToday, moveCalendarDate } from '~/utils/calendar'

import type { Guidance, Project } from '../types'
import { useCapstone } from '../composables/useCapstone'
const props = defineProps<{ projects: Project[]; log?: Guidance | null }>()
const emit = defineEmits<{ saved: []; cancel: [] }>()
const api = useCapstone()
const { busy, error } = api
const maximumMeetingDate = moveCalendarDate(calendarToday(), 1)
const form = reactive({ project_id: props.log?.project_id || props.projects[0]?.id || '', supervisor_id: props.log?.supervisor_id || '', meeting_date: props.log?.meeting_date.slice(0, 10) || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Makassar' }).format(new Date()), topic: props.log?.topic || '', progress: props.log?.progress || '', obstacles: props.log?.obstacles || '', next_plan: props.log?.next_plan || '', version: props.log?.version || 0 })
const supervisors = computed(() => props.projects.find(p => p.id === form.project_id)?.students.filter(m => m.student_id === api.user.value?.id && m.supervisor_id) || [])
const projectOptions = computed(() => props.projects.map(p => ({ value: p.id, label: p.title })))
const supervisorOptions = computed(() => supervisors.value.map(s => ({ value: s.supervisor_id || '', label: s.supervisor_name + ' · Pembimbing ' + s.slot })))
async function save() { const ok = await api.mutate(props.log ? '/guidance/' + props.log.id : '/guidance', form, props.log ? 'PUT' : 'POST'); if (ok) emit('saved') }
</script>
<template>
 <form class="panel cap-section" aria-labelledby="guidance-form-heading" @submit.prevent="save"><h2 id="guidance-form-heading">{{ log ? 'Perbaiki log bimbingan' : 'Catat bimbingan' }}</h2><fieldset :disabled="busy" class="cap-fieldset">
 <div class="field"><label for="log-project">Judul capstone</label><WorkspaceSelect id="log-project" v-model="form.project_id" label="Judul capstone" :options="projectOptions" placeholder="Pilih judul" required :disabled="busy" /></div>
 <div class="field-grid"><div class="field"><label for="log-date">Tanggal bimbingan</label><WorkspaceDatePicker id="log-date" v-model="form.meeting_date" label="Tanggal bimbingan" required :disabled="busy" min="2000-01-01" :max="maximumMeetingDate" /></div><div class="field"><label for="log-supervisor">Pembimbing pada pertemuan ini</label><WorkspaceSelect id="log-supervisor" v-model="form.supervisor_id" label="Pembimbing pada pertemuan ini" :options="supervisorOptions" placeholder="Pilih pembimbing" required :disabled="busy" /></div></div>
 <div class="field"><label for="log-topic">Topik bimbingan</label><input id="log-topic" v-model="form.topic" required minlength="3" maxlength="300"></div><div class="field"><label for="log-progress">Kemajuan dan hasil bimbingan</label><textarea id="log-progress" v-model="form.progress" required minlength="5" maxlength="10000" rows="4" /></div><div class="field-grid"><div class="field"><label for="log-obstacles">Kendala (opsional)</label><textarea id="log-obstacles" v-model="form.obstacles" maxlength="5000" rows="3" /></div><div class="field"><label for="log-next">Rencana berikutnya (opsional)</label><textarea id="log-next" v-model="form.next_plan" maxlength="5000" rows="3" /></div></div></fieldset>
 <p v-if="error" role="alert" class="notice error">{{ error }}</p><div class="cap-actions"><button class="button secondary" type="button" :disabled="busy" @click="emit('cancel')">Batal</button><button class="button primary" :disabled="busy">{{ busy ? 'Mengirim…' : 'Ajukan log bimbingan' }}</button></div></form>
</template>
