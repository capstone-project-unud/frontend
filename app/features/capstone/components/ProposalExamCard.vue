<script setup lang="ts">
import type { ProposalExam, PublishedPolicy } from '../proposal'
import { panelLabels } from '../proposal'
import { capstoneAPI, useCapstone } from '../composables/useCapstone'
import { dateTime } from '~/utils/format'
import ProposalExamAssessment from './ProposalExamAssessment.vue'
const props = defineProps<{ exam: ProposalExam; policy: PublishedPolicy | null }>()
const emit = defineEmits<{ saved: [] }>()
const api = useCapstone()
const { busy, error } = api
const me = computed(() => api.user.value?.id || '')
const panelMember = computed(() => props.exam.panel.some(p => p.id === me.value))
const attended = computed(() => props.exam.attendance.some(a => a.lecturer_id === me.value))
const confirm = shallowRef(false)
const assessment = shallowRef(false)
async function attend() { if (confirm.value && await api.mutate('/proposal-exams/' + props.exam.id + '/attendance', { confirm_signature: true })) emit('saved') }
function report(kind: string, id?: string) { return capstoneAPI + '/proposal-exams/' + props.exam.id + '/report?' + new URLSearchParams({ kind, ...(id ? { evaluator_id: id } : {}) }) }
</script>
<template>
 <article class="cap-section">
  <div class="cap-section-heading"><div><h2>{{ exam.student_name }} · {{ exam.nim }}</h2><p class="muted">{{ exam.title }}</p></div><strong>{{ exam.evaluations.length }} / 5 penilai</strong></div>
  <p>{{ dateTime(exam.scheduled_at) }} WITA · {{ exam.location }}</p>
  <div v-if="exam.final_score !== null" class="notice success"><strong>{{ exam.final_score.toFixed(2) }} · {{ exam.letter }}</strong><p>{{ exam.category }} · {{ exam.outcome === 'APPROVED' ? 'Layak dilanjutkan' : exam.outcome === 'REVISION' ? 'Perlu revisi' : 'Perlu ujian ulang' }}</p></div><p v-else class="notice">Nilai akhir angka dan huruf menunggu penilaian lengkap dari dua pembimbing dan tiga penguji.</p>
  <div class="cap-table-wrap"><table class="workspace-table"><caption class="sr-only">Panel ujian dan status penilaian</caption><thead><tr><th>Peran / Dosen</th><th>Presensi</th><th>Nilai penilai</th><th>Dokumen</th></tr></thead><tbody><tr v-for="p in exam.panel" :key="p.id"><td>{{ panelLabels[p.role] }}<br>{{ p.name }}</td><td>{{ exam.attendance.some(a => a.lecturer_id === p.id) ? 'Hadir dikonfirmasi' : 'Belum dikonfirmasi' }}</td><td>{{ exam.evaluations.find(e => e.evaluator_id === p.id)?.total.toFixed(2) ?? 'Belum diisi' }}</td><td><a class="button secondary" :href="report('score', p.id)">Form nilai {{ panelLabels[p.role] }}</a></td></tr></tbody></table></div>
  <div class="cap-actions"><a class="button secondary" :href="report('attendance')">Cetak presensi</a><a class="button secondary" :href="report('minutes')">Cetak berita acara</a><button v-if="panelMember" class="button primary" :aria-expanded="assessment" @click="assessment = !assessment">{{ assessment ? 'Tutup formulir nilai' : 'Isi nilai saya' }}</button></div>
  <form v-if="panelMember && !attended" class="cap-section" @submit.prevent="attend"><label class="check-field"><input v-model="confirm" type="checkbox" required :disabled="busy"> Saya hadir pada ujian ini dan menyetujui penggunaan tanda tangan saya pada presensi.</label><div><button class="button secondary" :disabled="busy || !confirm">Konfirmasi kehadiran saya</button></div></form>
  <p v-if="panelMember" class="muted">Template tanda tangan dapat diunggah pada <NuxtLink to="/account">profil Anda</NuxtLink>.</p><p v-if="error" class="notice error" role="alert">{{ error }}</p>
  <ProposalExamAssessment v-if="assessment && panelMember" :key="exam.id + ':' + (exam.evaluations.find(e => e.evaluator_id === me)?.version || 0)" :exam="exam" :evaluator-id="me" :policy="policy" @saved="emit('saved')" />
 </article>
</template>
