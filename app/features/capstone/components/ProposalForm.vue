<script setup lang="ts">
import WorkspaceSelect from '~/components/workspace/WorkspaceSelect.vue'
import type { Project, Proposal } from '../types'
import { proposalDocuments, type ProposalKind } from '../proposal'
import { useCapstone } from '../composables/useCapstone'
import FileUpload from './FileUpload.vue'
const props = defineProps<{
 projects: Project[]
 application?: Proposal
 locked?: boolean
 prefillDocs?: Partial<Record<'proposal' | 'b100' | 'b200', string>>
 approvedGuidanceCount?: number
}>()
const emit = defineEmits<{ saved: [] }>()
const api = useCapstone()
const { busy, error } = api
const project = shallowRef(props.application?.project_id || props.projects[0]?.id || '')
const files = reactive(Object.fromEntries(proposalDocuments.map(d => [d.kind, props.application?.documents.find(f => f.kind === d.kind)?.file_id || props.prefillDocs?.[d.kind as 'proposal' | 'b100' | 'b200'] || null])) as Record<ProposalKind, string | null>)
watch(() => props.prefillDocs, (pre) => {
 if (!pre) return
 for (const k of ['proposal', 'b100', 'b200'] as const) {
  if (!files[k] && pre[k]) files[k] = pre[k]!
 }
}, { deep: true })
const hasPrefilled = computed(() => !props.application && !!props.prefillDocs && Object.values(props.prefillDocs).some(Boolean))
const uploads = reactive<Record<string, boolean>>({})
const uploading = computed(() => Object.values(uploads).some(Boolean))
const complete = computed(() => Object.values(files).every(Boolean))
const projectOptions = computed(() => props.projects.map(p => ({ value: p.id, label: p.title })))
async function save() {
 if (uploading.value || !complete.value || props.locked) return
 const input = Object.fromEntries(proposalDocuments.map(d => [d.kind + '_file_id', files[d.kind]]))
 if (await api.mutate('/proposals', { ...input, project_id: project.value, version: props.application?.version || 0 })) emit('saved')
}
</script>
<template>
 <form class="panel cap-section" aria-labelledby="proposal-form-title" @submit.prevent="save">
  <h2 id="proposal-form-title">Pendaftaran ujian proposal</h2>
  <p class="muted">Unggah enam persyaratan. TU memeriksa setiap berkas; status dan catatan perbaikannya dapat Anda pantau di bawah.</p>
  <p v-if="hasPrefilled" class="notice">Berkas Proposal, B-100, atau B-200 yang sudah ada di menu Dokumen Capstone otomatis ditautkan agar tidak perlu diunggah dua kali (Anda tetap dapat menggantinya bila perlu).</p>
  <p v-if="typeof approvedGuidanceCount === 'number' && approvedGuidanceCount === 0" class="notice">Catatan pedoman: Log bimbingan disetujui pembimbing saat ini masih 0. Pastikan log bimbingan telah dicatat &amp; disetujui minimal 1 kali sebelum Seminar Proposal.</p>
  <p v-if="locked" class="notice">Berkas terkunci setelah informasi ujian dicatat.</p>
  <fieldset class="cap-fieldset" :disabled="busy || locked">
   <div class="field"><label for="proposal-project">Judul yang ditetapkan</label><WorkspaceSelect id="proposal-project" v-model="project" label="Judul yang ditetapkan" :options="projectOptions" required :disabled="busy || !!application || locked" /></div>
   <div class="field-grid"><FileUpload v-for="item in proposalDocuments" :key="item.kind" v-model="files[item.kind]" :label="item.label" :accept="item.accept" :disabled="busy || locked" @uploading="uploads[item.kind] = $event" /></div>
  </fieldset>
  <p v-if="error" class="notice error" role="alert">{{ error }}</p>
  <div><button class="button primary" :disabled="busy || uploading || !complete || !project || locked">{{ uploading ? 'Menunggu unggahan…' : busy ? 'Mengajukan…' : application ? 'Ajukan perbaikan berkas' : 'Ajukan verifikasi TU' }}</button></div>
 </form>
</template>
