<script setup lang="ts">
import type { Project } from '../types'
import { useCapstone } from '../composables/useCapstone'
import PersonPicker from './PersonPicker.vue'
const props = defineProps<{ project: Project }>()
const emit = defineEmits<{ changed: [] }>()
const api = useCapstone()
const { busy, error } = api
const own = computed(() => props.project.students.filter(m => m.student_id === api.user.value?.id))
const candidate1 = shallowRef(own.value.find(m => m.slot === 1)?.candidate_id || null)
const candidate2 = shallowRef(own.value.find(m => m.slot === 2)?.candidate_id || null)
async function save() { if (await api.mutate('/projects/' + props.project.id + '/candidates', { version: props.project.version, candidate_1: candidate1.value, candidate_2: candidate2.value }, 'PUT')) emit('changed') }
</script>
<template><form v-if="own.length && project.status !== 'FINALIZED'" class="panel cap-section" aria-label="Ubah calon pembimbing saya" @submit.prevent="save"><h2>Calon pembimbing saya</h2><p class="muted">Perubahan calon pembimbing akan mengulang keputusan untuk posisi yang berubah.</p><div class="field-grid"><PersonPicker v-model="candidate1" role="DOSEN" label="Calon pembimbing 1" :current-name="own.find(m => m.slot === 1)?.candidate_name" /><PersonPicker v-model="candidate2" role="DOSEN" label="Calon pembimbing 2" :current-name="own.find(m => m.slot === 2)?.candidate_name" /></div><p v-if="error" class="notice error" role="alert">{{ error }}</p><div><button class="button primary" :disabled="busy">{{ busy ? 'Menyimpan…' : 'Simpan calon pembimbing saya' }}</button></div></form></template>
