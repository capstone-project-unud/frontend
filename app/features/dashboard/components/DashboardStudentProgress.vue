<script setup lang="ts">
import type { DashboardStats } from '../types'

const props = defineProps<{ stats: DashboardStats }>()

const steps = computed(() => [
  {
    key: 'group',
    label: '1. Kelompok',
    done: (props.stats.groups_ready ?? 0) > 0,
    active: (props.stats.groups ?? 0) > 0 && (props.stats.groups_ready ?? 0) === 0,
    detail: (props.stats.groups_ready ?? 0) > 0 ? 'Kelompok siap / terdaftar' : (props.stats.groups ?? 0) > 0 ? 'Draf kelompok' : 'Buat kelompok 2–5 orang',
    to: '/groups',
  },
  {
    key: 'title',
    label: '2. Topik & Seminar',
    done: props.stats.finalized > 0,
    active: props.stats.projects > 0 && props.stats.finalized === 0,
    detail: props.stats.finalized > 0 ? 'Pembimbing ditetapkan' : props.stats.submitted > 0 ? 'Review / Seminar Topik' : props.stats.projects > 0 ? 'Draf topik' : 'Ajukan dari kelompok',
    to: '/capstone',
  },
  {
    key: 'guidance',
    label: '3. Log Bimbingan',
    done: props.stats.guidance_approved > 0,
    active: props.stats.finalized > 0 && props.stats.guidance_approved === 0,
    detail: `${props.stats.guidance_approved} disetujui · ${props.stats.guidance_pending} menunggu`,
    to: '/guidance',
  },
  {
    key: 'up',
    label: '4. Berkas UP (TU)',
    done: props.stats.proposal_ready > 0,
    active: props.stats.proposals > 0 && props.stats.proposal_ready === 0,
    detail: props.stats.proposal_ready > 0 ? 'Enam berkas valid' : props.stats.proposals > 0 ? 'Dalam pemeriksaan' : 'Unggah syarat UP',
    to: '/proposal',
  },
  {
    key: 'docs',
    label: '5. Dokumen Lengkap',
    done: props.stats.documents_approved > 0,
    active: props.stats.documents_uploaded > 0 && props.stats.documents_approved === 0,
    detail: `${props.stats.documents_approved} disetujui · ${props.stats.documents_uploaded} unggahan`,
    to: '/documents',
  },
  {
    key: 'sempro',
    label: '6. Seminar Proposal',
    done: props.stats.sempro_approved > 0,
    active: props.stats.sempro_scheduled > 0 || props.stats.sempro_revision > 0,
    detail: props.stats.sempro_approved > 0 ? 'Panel menyetujui' : props.stats.sempro_revision > 0 ? 'Revisi pasca-Sempro' : props.stats.sempro_scheduled > 0 ? 'Jadwal tercatat' : 'Belum dicatat',
    to: '/sempro',
  },
  {
    key: 'final',
    label: '7. Ujian Akhir & Expo',
    done: (props.stats.expo_published ?? 0) > 0,
    active: (props.stats.final_exam_apps ?? 0) > 0 || (props.stats.final_exam_scheduled ?? 0) > 0 || (props.stats.final_exam_passed ?? 0) > 0,
    detail: (props.stats.expo_published ?? 0) > 0 ? 'Lulus & Terbit Expo' : (props.stats.final_exam_passed ?? 0) > 0 ? 'Lulus Sidang (Siap Expo)' : (props.stats.final_exam_scheduled ?? 0) > 0 ? 'Sidang Terjadwal' : 'Menuju Ujian Akhir',
    to: (props.stats.final_exam_passed ?? 0) > 0 ? '/expo' : '/final-exam',
  },
])

const completedCount = computed(() => steps.value.filter(s => s.done).length)
const percent = computed(() => Math.round((completedCount.value / steps.value.length) * 100))
</script>

<template>
  <section class="panel progress-card" aria-label="Progres tahapan capstone">
    <div class="progress-head">
      <div>
        <h2>Alur progres capstone Anda</h2>
        <p class="muted">{{ completedCount }} dari {{ steps.length }} tonggak tahapan telah diselesaikan.</p>
      </div>
      <div class="progress-badge">
        <strong>{{ percent }}%</strong>
      </div>
    </div>

    <div class="progress-track" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100">
      <div class="progress-fill" :style="{ width: `${percent}%` }" />
    </div>

    <ol class="milestone-grid">
      <li v-for="step in steps" :key="step.key" class="milestone-item" :class="{ done: step.done, active: step.active }">
        <NuxtLink :to="step.to" class="milestone-link">
          <span class="milestone-top">
            <span class="milestone-dot" aria-hidden="true" />
            <strong>{{ step.label }}</strong>
          </span>
          <span class="milestone-detail">{{ step.detail }}</span>
        </NuxtLink>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.progress-card { display: grid; gap: 1rem; padding: clamp(1rem, 1.5cqi, 1.375rem); border-radius: 1rem; }
.progress-head { display: flex; justify-content: space-between; align-items: center; gap: 1rem; border-bottom: 1px solid var(--line); padding-bottom: .75rem; }
.progress-head h2 { font-size: 1.0625rem; font-weight: 600; letter-spacing: -.02em; }
.progress-head p { margin-top: .25rem; font-size: .875rem; }
.progress-badge strong { font-size: 1.5rem; font-weight: 700; color: var(--accent); letter-spacing: -.03em; }
.progress-track { height: 8px; background: var(--line); border-radius: 999px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--accent); border-radius: 999px; transition: width 320ms ease; }
.milestone-grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(11.5rem, 1fr)); gap: .75rem; }
.milestone-item { border: 1px solid var(--border); border-radius: 10px; background: var(--canvas); transition: border-color 150ms ease, background-color 150ms ease; }
.milestone-item.done { border-color: var(--success); }
.milestone-item.active { border-color: var(--accent); }
.milestone-link { display: grid; gap: .35rem; padding: .75rem .875rem; height: 100%; }
.milestone-link:hover { background: var(--panel-hover); border-radius: 9px; }
.milestone-top { display: flex; align-items: center; gap: .45rem; font-size: .875rem; }
.milestone-dot { width: 8px; height: 8px; border-radius: 999px; flex: 0 0 8px; background: var(--muted); }
.milestone-item.done .milestone-dot { background: var(--success); }
.milestone-item.active .milestone-dot { background: var(--accent); }
.milestone-detail { color: var(--muted); font-size: .8125rem; padding-left: 1.15rem; }
</style>
