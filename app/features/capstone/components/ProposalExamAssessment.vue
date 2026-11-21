<script setup lang="ts">
import WorkspaceSelect from '~/components/workspace/WorkspaceSelect.vue'
import { CPMK_RUBRIC } from '../types'
import type { ProposalExam, PublishedPolicy } from '../proposal'
import { useCapstone } from '../composables/useCapstone'
const props = defineProps<{ exam: ProposalExam; evaluatorId: string; policy: PublishedPolicy | null }>()
const emit = defineEmits<{ saved: [] }>()
const api = useCapstone()
const { busy, error } = api
const existing = props.exam.evaluations.find(e => e.evaluator_id === props.evaluatorId)
const scores = reactive<Record<string, number | ''>>(Object.fromEntries(CPMK_RUBRIC.flatMap(g => g.items.map(i => [i.code, existing?.scores[i.code] ?? '']))))
const recommendation = shallowRef(existing?.recommendation || '')
const notes = shallowRef(existing?.notes || '')
const confirm = shallowRef(false)
const rules = computed(() => props.exam.policy || props.policy?.rules)
const recommendations = [{ value: 'APPROVED', label: 'Layak dilanjutkan' }, { value: 'REVISION', label: 'Layak dengan revisi' }, { value: 'REJECTED', label: 'Perlu ujian ulang' }]
async function save() {
 if (!confirm.value || Object.values(scores).some(v => v === '') || !rules.value) return
 if (await api.mutate('/proposal-exams/' + props.exam.id + '/evaluation', { scores, recommendation: recommendation.value, notes: notes.value, version: existing?.version || 0, confirm_signature: confirm.value }, 'PUT')) emit('saved')
}
</script>
<template>
 <form class="cap-section" :aria-labelledby="'assessment-' + exam.id" @submit.prevent="save">
  <h3 :id="'assessment-' + exam.id">Penilaian individu · {{ exam.student_name }}</h3>
  <p class="muted">Isi seluruh indikator dengan nilai 0–100.</p>
  <p v-if="!rules" class="notice">Admin atau koordinator perlu menetapkan bobot dan konversi huruf sebelum penilaian dikirim.</p>
  <p v-else class="muted">Aturan: {{ rules.name }}. Nilai akhir tersedia setelah dua pembimbing dan tiga penguji mengirim penilaian.</p>
  <fieldset class="cap-fieldset" :disabled="busy || !rules">
   <section v-for="group in CPMK_RUBRIC" :key="group.code" class="member-row"><h3>{{ group.code }} · {{ group.title }}</h3><div class="field-grid"><div v-for="item in group.items" :key="item.code" class="field"><label :for="exam.id + item.code">{{ item.code }} · {{ item.label }} <span v-if="rules" class="muted">({{ rules.indicator_weights[item.code] }}%)</span></label><input :id="exam.id + item.code" v-model.number="scores[item.code]" type="number" min="0" max="100" step="0.01" required inputmode="decimal"></div></div></section>
   <div class="field"><label :for="'recommendation-' + exam.id">Rekomendasi</label><WorkspaceSelect :id="'recommendation-' + exam.id" v-model="recommendation" label="Rekomendasi penilaian" :options="recommendations" required :disabled="busy || !rules" /></div>
   <div class="field"><label :for="'evaluation-note-' + exam.id">Catatan (wajib untuk revisi atau ujian ulang)</label><textarea :id="'evaluation-note-' + exam.id" v-model="notes" rows="3" maxlength="2000" :required="recommendation !== 'APPROVED'" :minlength="recommendation !== 'APPROVED' ? 5 : 0" /></div>
   <label class="check-field"><input v-model="confirm" type="checkbox" required> Saya menyetujui penilaian ini dan penggunaan template tanda tangan saya pada form nilai dan berita acara.</label>
  </fieldset>
  <p v-if="error" class="notice error" role="alert">{{ error }}</p><div><button class="button primary" :disabled="busy || !confirm || !rules">{{ busy ? 'Mengirim…' : existing ? 'Perbarui penilaian saya' : 'Kirim penilaian saya' }}</button></div>
 </form>
</template>
