<script setup lang="ts">
import WorkspaceSkeleton from '~/components/workspace/WorkspaceSkeleton.vue'
import type { Proposal, Project } from '../types'
import type { ProposalExam, PublishedPolicy } from '../proposal'
import { capstoneAPI, useCapstone } from '../composables/useCapstone'
import ProposalExamRecordForm from './ProposalExamRecordForm.vue'
import ProposalExamCard from './ProposalExamCard.vue'
import ProposalGradingPolicy from './ProposalGradingPolicy.vue'
const api = useCapstone()
const { student, user } = api
const fetcher = useRequestFetch()
const { data, status, error, refresh } = await useLazyAsyncData('individual-proposal-exams', () => fetcher<{ items: ProposalExam[] }>(capstoneAPI + '/proposal-exams'))
const { data: applications, error: applicationError } = await useLazyAsyncData('exam-applications', () => student.value ? fetcher<{ items: Proposal[] }>(capstoneAPI + '/proposals') : Promise.resolve({ items: [] }))
const { data: projects, error: projectError } = await useLazyAsyncData('exam-projects', () => student.value ? fetcher<{ items: Project[] }>(capstoneAPI + '/projects', { query: { status: 'FINALIZED' } }) : Promise.resolve({ items: [] }))
const { data: policy, error: policyError, refresh: refreshPolicy } = await useLazyAsyncData('proposal-grading-policy', () => fetcher<{ policy: PublishedPolicy | null }>(capstoneAPI + '/proposal-grading-policy'))
const own = computed(() => applications.value?.items.find(a => a.student_id === user.value?.id))
const project = computed(() => projects.value?.items.find(p => p.id === own.value?.project_id))
const ownExam = computed(() => data.value?.items.find(e => e.student_id === user.value?.id))
const managePolicy = computed(() => user.value?.roles.some(r => ['ADMIN', 'KOORDINATOR_TA'].includes(r)))
</script>
<template>
 <section>
  <p v-if="student && (applicationError || projectError)" class="notice error" role="alert">Data pendaftaran atau judul belum dapat dimuat. <button class="button secondary" @click="reloadNuxtApp()">Muat ulang</button></p>
  <ProposalExamRecordForm v-if="student && own?.ready && project && status === 'success'" :key="ownExam?.version || 0" :application="own" :project="project" :exam="ownExam" @saved="refresh()" />
  <p v-else-if="student && !applicationError && !projectError" class="notice">Lengkapi <NuxtLink to="/proposal">pendaftaran proposal</NuxtLink> dan tunggu validasi keenam berkas dari TU. Lengkapi informasi ujian setelah jadwal Anda terbit.</p>
  <p v-if="policyError" class="notice error" role="alert">Aturan perhitungan belum dapat dimuat. <button class="button secondary" @click="refreshPolicy()">Coba lagi</button></p>
  <ProposalGradingPolicy v-if="managePolicy && policy" :key="policy.policy?.id || 'new-policy'" :policy="policy.policy" @saved="refreshPolicy()" />
  <div class="panel workspace-panel cap-list-panel"><div class="workspace-panel-header"><div class="workspace-panel-title"><h2>Ujian proposal per mahasiswa</h2><span>{{ data?.items.length ?? '—' }} ujian</span></div><button class="button secondary" @click="refresh()">Muat ulang</button></div>
   <WorkspaceSkeleton v-if="status === 'pending'" variant="cards" :rows="3" label="Memuat informasi ujian proposal…" /><div v-else-if="error" class="empty-state"><h2>Ujian belum dapat dimuat</h2><button class="button secondary" @click="refresh()">Coba lagi</button></div><div v-else-if="!data?.items.length" class="empty-state"><h2>Belum ada informasi ujian</h2><p>{{ student ? 'Informasi ujian Anda akan muncul setelah disimpan.' : 'Informasi muncul setelah mahasiswa mencatat jadwal dan penguji.' }}</p></div>
   <ProposalExamCard v-for="exam in data?.items || []" v-else :key="exam.id" :exam="exam" :policy="policy?.policy || null" @saved="refresh()" />
  </div>
 </section>
</template>
