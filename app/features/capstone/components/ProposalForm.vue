<script setup lang="ts">
import WorkspaceSelect from '~/components/workspace/WorkspaceSelect.vue'

import type { Project, Proposal } from '../types'
import { useCapstone } from '../composables/useCapstone'
import FileUpload from './FileUpload.vue'
const props = defineProps<{ projects: Project[]; application?: Proposal }>()
const emit = defineEmits<{ saved: [] }>()
const api = useCapstone()
const { busy, error } = api
const form = reactive({ project_id: props.application?.project_id || props.projects[0]?.id || '', simak_file_id: props.application?.simak_file_id || null, approval_file_id: props.application?.approval_file_id || null, version: props.application?.version || 0 })
const projectOptions = computed(() => props.projects.map(p => ({ value: p.id, label: p.title })))
async function save() { if (await api.mutate('/proposals', form)) emit('saved') }
</script>
<template><form class="panel cap-section" aria-labelledby="proposal-form-title" @submit.prevent="save"><h2 id="proposal-form-title">Berkas persyaratan UP</h2><p class="muted">Unggah screenshot pendaftaran Tugas Akhir di SIMAK dengan status diterima dan surat persetujuan pembimbing yang telah ditandatangani.</p><fieldset class="cap-fieldset" :disabled="busy || !!application?.ready"><div class="field"><label for="proposal-project">Judul yang ditetapkan</label><WorkspaceSelect id="proposal-project" v-model="form.project_id" label="Judul yang ditetapkan" :options="projectOptions" required :disabled="busy || !!application" placeholder="Pilih judul" /></div><FileUpload v-model="form.simak_file_id" label="Screenshot SIMAK berstatus diterima" accept=".pdf,.png,.jpg,.jpeg" :disabled="application?.ready" /><FileUpload v-model="form.approval_file_id" label="Surat persetujuan pembimbing (PDF)" :disabled="application?.ready" /></fieldset><p v-if="error" class="notice error" role="alert">{{ error }}</p><div><button class="button primary" :disabled="busy || !form.simak_file_id || !form.approval_file_id || !form.project_id || application?.ready">{{ busy ? 'Mengajukan…' : application ? 'Ajukan perbaikan berkas' : 'Ajukan verifikasi TU' }}</button></div></form></template>
