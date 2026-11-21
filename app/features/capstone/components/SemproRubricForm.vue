<script setup lang="ts">
import WorkspaceSelect from '~/components/workspace/WorkspaceSelect.vue'
import { CPMK_RUBRIC, type FinalExam, type Participant, type ProposalSeminar } from '../types'

const props = defineProps<{
  seminar: ProposalSeminar | FinalExam
  students: Participant[]
  evaluatorId: string
  mode?: 'SEMPRO' | 'FINAL_EXAM'
  busy: boolean
  error: string
  savedMessage?: string
}>()

const emit = defineEmits<{
  save: [payload: { student_id: string; scores: Record<string, number>; recommendation: string; notes: string }]
  close: []
}>()

const dialog = useTemplateRef<HTMLDialogElement>('dialog')
onMounted(() => dialog.value?.showModal())
onBeforeUnmount(() => dialog.value?.close())

const distinctStudents = computed(() => {
  const seen = new Map<string, { student_id: string; student_name: string; nim: string }>()
  for (const s of props.students) {
    if (!seen.has(s.student_id)) seen.set(s.student_id, { student_id: s.student_id, student_name: s.student_name, nim: s.nim })
  }
  return Array.from(seen.values())
})

const studentOptions = computed(() => distinctStudents.value.map((s) => {
  const scored = props.seminar.evaluations.some(ev => ev.student_id === s.student_id && ev.evaluator_id === props.evaluatorId)
  return { value: s.student_id, label: `${s.student_name} (${s.nim})${scored ? ' · Sudah dinilai' : ''}` }
}))

const recommendationOptions = computed(() => props.mode === 'FINAL_EXAM'
  ? [
      { value: 'PASSED', label: 'Lulus Ujian Akhir' },
      { value: 'REVISION', label: 'Lulus dengan revisi' },
      { value: 'FAILED', label: 'Mengulang Ujian Akhir' },
    ]
  : [
      { value: 'APPROVED', label: 'Layak dilanjutkan' },
      { value: 'REVISION', label: 'Layak dengan revisi' },
      { value: 'REJECTED', label: 'Perlu seminar ulang' },
    ])

const defaultRec = computed(() => props.mode === 'FINAL_EXAM' ? 'PASSED' : 'APPROVED')
const selectedStudent = shallowRef(distinctStudents.value[0]?.student_id || '')
const recommendation = shallowRef<string>(defaultRec.value)
const notes = shallowRef('')
const scores = reactive<Record<string, number>>({})

function loadStudentEvaluation(studentID: string) {
  const existing = props.seminar.evaluations.find(ev => ev.student_id === studentID && ev.evaluator_id === props.evaluatorId)
  for (const group of CPMK_RUBRIC) {
    for (const item of group.items) {
      scores[item.code] = existing?.scores[item.code] ?? 75
    }
  }
  recommendation.value = existing?.recommendation || defaultRec.value
  notes.value = existing?.notes || ''
}

watch(selectedStudent, (val) => {
  if (val) loadStudentEvaluation(val)
}, { immediate: true })

function cpmkAverage(items: readonly { code: string }[]) {
  const sum = items.reduce((acc, item) => acc + (Number(scores[item.code]) || 0), 0)
  return Math.round((sum / items.length) * 100) / 100
}

const totalScore = computed(() => {
  const sum = CPMK_RUBRIC.reduce((acc, group) => acc + cpmkAverage(group.items), 0)
  return Math.round((sum / CPMK_RUBRIC.length) * 100) / 100
})

const gradeCategory = computed(() => {
  const s = totalScore.value
  if (s >= 80) return 'ISTIMEWA'
  if (s >= 71) return 'SANGAT BAIK'
  if (s >= 65) return 'BAIK'
  if (s >= 60) return 'CUKUP BAIK'
  if (s >= 55) return 'CUKUP'
  if (s >= 50) return 'KURANG CUKUP'
  if (s >= 40) return 'KURANG'
  return 'SANGAT KURANG'
})

function submit() {
  if (!selectedStudent.value) return
  const normalized: Record<string, number> = {}
  for (const group of CPMK_RUBRIC) {
    for (const item of group.items) {
      normalized[item.code] = Number(scores[item.code]) || 0
    }
  }
  emit('save', {
    student_id: selectedStudent.value,
    scores: normalized,
    recommendation: recommendation.value,
    notes: notes.value,
  })
}
</script>

<template>
  <dialog ref="dialog" class="cap-dialog rubric-dialog" aria-labelledby="rubric-dialog-title" @cancel.prevent="!busy && emit('close')">
    <form @submit.prevent="submit">
      <div class="cap-section-heading">
        <div>
          <h2 id="rubric-dialog-title">{{ mode === 'FINAL_EXAM' ? 'Penilaian individu Ujian Akhir (PA II)' : 'Penilaian individu Seminar Proposal (PA I)' }}</h2>
          <p class="muted">Isi nilai 0–100 untuk setiap indikator.</p>
        </div>
        <div class="score-summary">
          <strong>{{ totalScore.toFixed(2) }}</strong>
          <span>{{ gradeCategory }}</span>
        </div>
      </div>

      <fieldset class="cap-fieldset" :disabled="busy">
        <div class="field">
          <label for="eval-student">Mahasiswa yang dinilai</label>
          <WorkspaceSelect id="eval-student" v-model="selectedStudent" label="Mahasiswa" :options="studentOptions" required :disabled="busy" />
        </div>

        <div v-for="group in CPMK_RUBRIC" :key="group.code" class="rubric-group">
          <div class="rubric-group-head">
            <h3>{{ group.code }} · {{ group.title }}</h3>
            <span>Rata-rata: {{ cpmkAverage(group.items).toFixed(2) }}</span>
          </div>
          <div v-for="item in group.items" :key="item.code" class="rubric-item">
            <label :for="'ik-' + item.code"><strong>{{ item.code }}</strong> — {{ item.label }}</label>
            <input :id="'ik-' + item.code" v-model.number="scores[item.code]" type="number" min="0" max="100" step="1" required>
          </div>
        </div>

        <div class="field">
          <label for="eval-rec">Rekomendasi hasil</label>
          <WorkspaceSelect id="eval-rec" v-model="recommendation" label="Rekomendasi" :options="recommendationOptions" required :disabled="busy" />
        </div>

        <div class="field">
          <label for="eval-notes">Catatan penilaian <span v-if="recommendation === 'APPROVED' || recommendation === 'PASSED'" class="optional">(opsional)</span></label>
          <textarea id="eval-notes" v-model="notes" maxlength="2000" rows="2" :required="recommendation !== 'APPROVED' && recommendation !== 'PASSED'" placeholder="Masukan substansi atau perbaikan untuk mahasiswa ini" />
        </div>
      </fieldset>

      <p v-if="error" class="notice error" role="alert">{{ error }}</p>
      <p v-else-if="savedMessage" class="notice success" role="status">{{ savedMessage }}</p>

      <div class="cap-dialog-actions">
        <button type="button" class="button secondary" :disabled="busy" @click="emit('close')">Tutup</button>
        <button type="submit" class="button primary" :disabled="busy || !selectedStudent">{{ busy ? 'Menyimpan…' : 'Simpan nilai mahasiswa' }}</button>
      </div>
    </form>
  </dialog>
</template>

<style scoped>
.rubric-dialog { width: min(820px, calc(100% - 2rem)); }
.score-summary { display: grid; justify-items: end; padding: .5rem .875rem; border: 1px solid var(--border); border-radius: 10px; background: var(--canvas); }
.score-summary strong { font-size: 1.25rem; font-weight: 700; color: var(--accent); }
.score-summary span { font-size: .75rem; font-weight: 600; color: var(--muted); }
.rubric-group { display: grid; gap: .625rem; padding: .875rem; border: 1px solid var(--border); border-radius: 12px; background: var(--canvas); }
.rubric-group-head { display: flex; justify-content: space-between; gap: 1rem; align-items: center; border-bottom: 1px solid var(--line); padding-bottom: .5rem; }
.rubric-group-head h3 { font-size: .9375rem; margin: 0; }
.rubric-group-head span { font-size: .8125rem; font-weight: 600; color: var(--muted); }
.rubric-item { display: grid; grid-template-columns: minmax(0, 1fr) 5.5rem; gap: .75rem; align-items: center; }
.rubric-item label { font-size: .875rem; margin: 0; }
.rubric-item input { text-align: right; }
@media (max-width: 640px) { .rubric-item { grid-template-columns: minmax(0, 1fr); } .rubric-item input { text-align: left; max-width: 8rem; } }
</style>
