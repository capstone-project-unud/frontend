<script setup lang="ts">
import type { Project } from '../types'
import { useCapstone } from '../composables/useCapstone'
import { dateTime } from '~/utils/format'
import StatusLabel from './StatusLabel.vue'
const props = defineProps<{ project: Project }>()
const emit = defineEmits<{ changed: [] }>()
const api = useCapstone()
const { busy, error, coordinator } = api
const notes = reactive<Record<string, string>>({})
function allowed(candidate: string | null, supervisor: string | null) { return props.project.status === 'SUBMITTED' && (coordinator.value || (supervisor || candidate) === api.user.value?.id) }
async function decide(studentID: string, slot: number, kind: 'title' | 'confirmation', status: 'APPROVED' | 'REJECTED') {
 const ok = await api.mutate('/projects/' + props.project.id + '/decision', { version: props.project.version, student_id: studentID, slot, kind, status, note: notes[studentID + slot] || '' }, 'PUT'); if (ok) emit('changed')
}
</script>
<template>
 <section class="panel cap-section" aria-labelledby="supervisor-heading"><h2 id="supervisor-heading">Persetujuan dan kesediaan pembimbing</h2><p class="muted">Setuju terhadap judul dan bersedia membimbing adalah dua keputusan terpisah.</p>
  <p v-if="error" class="notice error" role="alert">{{ error }}</p>
  <article v-for="m in project.students" :key="m.student_id + m.slot" class="member-row">
   <h3>{{ m.student_name }} · Pembimbing {{ m.slot }}</h3><p>{{ m.supervisor_name || m.candidate_name || 'Calon pembimbing belum dipilih' }}</p>
   <div class="decision-columns"><div><h4>Persetujuan judul</h4><StatusLabel :value="m.title_status" /><small v-if="m.title_at">{{ dateTime(m.title_at) }}</small><div v-if="allowed(m.candidate_id, m.supervisor_id)" class="cap-actions"><button class="button primary" :disabled="busy || !(m.candidate_id || m.supervisor_id)" @click="decide(m.student_id, m.slot, 'title', 'APPROVED')">Setujui judul</button><button class="button secondary" :disabled="busy || !(m.candidate_id || m.supervisor_id)" @click="decide(m.student_id, m.slot, 'title', 'REJECTED')">Tolak judul</button></div></div>
   <div><h4>Kesediaan membimbing</h4><StatusLabel :value="m.confirmation_status" /><small v-if="m.confirmation_at">{{ dateTime(m.confirmation_at) }}</small><div v-if="allowed(m.candidate_id, m.supervisor_id)" class="cap-actions"><button class="button primary" :disabled="busy || !(m.candidate_id || m.supervisor_id)" @click="decide(m.student_id, m.slot, 'confirmation', 'APPROVED')">Bersedia membimbing</button><button class="button secondary" :disabled="busy || !(m.candidate_id || m.supervisor_id)" @click="decide(m.student_id, m.slot, 'confirmation', 'REJECTED')">Tidak bersedia</button></div></div></div>
   <div v-if="allowed(m.candidate_id, m.supervisor_id)" class="field"><label :for="'decision-note-' + m.student_id + m.slot">Catatan (wajib untuk penolakan)</label><textarea :id="'decision-note-' + m.student_id + m.slot" v-model="notes[m.student_id + m.slot]" maxlength="2000" rows="2" /></div><p v-if="m.note" class="notice">{{ m.note }}</p>
  </article>
 </section>
</template>
