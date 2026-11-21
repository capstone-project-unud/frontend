<script setup lang="ts">
import type { Proposal } from '../types'
import { proposalDocuments, type ProposalKind } from '../proposal'
import { capstoneAPI, useCapstone } from '../composables/useCapstone'
import { dateTime } from '~/utils/format'
import StatusLabel from './StatusLabel.vue'
const props = defineProps<{ application: Proposal }>()
const emit = defineEmits<{ saved: [] }>()
const api = useCapstone()
const { busy, error } = api
const notes = reactive<Record<string, string>>({})
const checked = computed(() => props.application.documents.filter(d => d.status === 'VALID').length)
const reviewer = computed(() => api.user.value?.roles.includes('TU'))
function document(kind: ProposalKind) { return props.application.documents.find(d => d.kind === kind) }
async function review(kind: ProposalKind, status: 'VALID' | 'REVISION') {
 if (await api.mutate('/proposals/' + props.application.id + '/review', { version: props.application.version, kind, status, note: notes[kind] || '' }, 'PUT')) emit('saved')
}
</script>
<template>
 <section class="cap-section" :aria-labelledby="'review-' + application.id">
  <div class="cap-section-heading"><div><h2 :id="'review-' + application.id">{{ application.student_name }} · {{ application.nim }}</h2><p class="muted">{{ application.title }}</p></div><strong>{{ checked }} dari 6 berkas valid</strong></div>
  <p v-if="error" class="notice error" role="alert">{{ error }}</p>
  <section v-for="item in proposalDocuments" :key="item.kind" class="member-row">
   <div class="cap-section-heading"><h3>{{ item.label }}</h3><StatusLabel :value="document(item.kind)?.status || 'MISSING'" /></div>
   <a v-if="document(item.kind)" class="button secondary" :href="capstoneAPI + '/files/' + document(item.kind)!.file_id">Unduh {{ item.label }}</a>
   <p v-if="document(item.kind)?.note" class="notice">{{ document(item.kind)!.note }}</p>
   <p v-if="document(item.kind)?.reviewed_at" class="muted">Diperiksa {{ dateTime(document(item.kind)!.reviewed_at!) }}</p>
   <form v-if="reviewer && document(item.kind)" class="cap-review" @submit.prevent="review(item.kind, 'VALID')">
    <div class="field"><label :for="application.id + item.kind">Catatan pemeriksaan (wajib untuk revisi)</label><textarea :id="application.id + item.kind" v-model="notes[item.kind]" maxlength="2000" rows="2" :disabled="busy" /></div>
    <div class="cap-actions"><button class="button primary" :disabled="busy">Validasi berkas</button><button class="button secondary" type="button" :disabled="busy || (notes[item.kind]?.trim().length || 0) < 5" @click="review(item.kind, 'REVISION')">Minta perbaikan</button></div>
   </form>
  </section>
  <p v-if="application.ready" class="notice success">Enam berkas telah divalidasi TU. Lengkapi informasi jadwal dan penguji di halaman ujian proposal.</p>
 </section>
</template>
