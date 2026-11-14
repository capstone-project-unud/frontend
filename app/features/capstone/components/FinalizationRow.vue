<script setup lang="ts">
import WorkspaceSelect from '~/components/workspace/WorkspaceSelect.vue'

import type { DirectoryUser, Participant } from '../types'
import StatusLabel from './StatusLabel.vue'
const props = defineProps<{ row: Participant; lecturers: DirectoryUser[]; busy: boolean; editable: boolean }>()
const emit = defineEmits<{ assign: [student: string, slot: number, supervisor: string | null]; decide: [student: string, slot: number, kind: 'title' | 'confirmation'] }>()
const supervisor = shallowRef(props.row.supervisor_id)
const missing = computed(() => supervisor.value && !props.lecturers.some(u => u.id === supervisor.value))
const options = computed(() => [
 { value: null, label: 'Belum ditetapkan' },
 ...(missing.value ? [{ value: supervisor.value, label: props.row.supervisor_name }] : []),
 ...props.lecturers.map(u => ({ value: u.id, label: u.full_name })),
])
</script>
<template><tr><th scope="row">{{ row.student_name }}<small>{{ row.nim }} · Posisi {{ row.slot }}</small></th><td>{{ row.candidate_name || 'Belum dipilih' }}</td><td><label class="visually-hidden" :for="'assign-' + row.student_id + row.slot">Pembimbing {{ row.slot }} untuk {{ row.student_name }}</label><WorkspaceSelect :id="'assign-' + row.student_id + row.slot" v-model="supervisor" :label="'Pembimbing ' + row.slot + ' untuk ' + row.student_name" :options="options" :disabled="busy || !editable" /><button v-if="editable" class="button secondary" :disabled="busy || supervisor === row.supervisor_id" @click="emit('assign', row.student_id, row.slot, supervisor)">Simpan pembimbing</button></td><td><StatusLabel :value="row.title_status" /><button v-if="editable" class="button secondary" :disabled="busy || !(row.candidate_id || row.supervisor_id) || row.title_status === 'APPROVED'" @click="emit('decide', row.student_id, row.slot, 'title')">Setujui judul</button></td><td><StatusLabel :value="row.confirmation_status" /><button v-if="editable" class="button secondary" :disabled="busy || !(row.candidate_id || row.supervisor_id) || row.confirmation_status === 'APPROVED'" @click="emit('decide', row.student_id, row.slot, 'confirmation')">Konfirmasi pembimbing</button></td></tr></template>
