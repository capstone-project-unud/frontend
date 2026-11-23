<script setup lang="ts">
import type { CapstoneGroup } from '~/features/capstone/types'
import StatusLabel from '~/features/capstone/components/StatusLabel.vue'

const props = defineProps<{
  group: CapstoneGroup | null | undefined
  ownId: string
}>()

const myAdvisors = computed(() => {
  if (!props.group) return []
  return props.group.advisors.filter(a => a.student_id === props.ownId).sort((a, b) => a.slot - b.slot)
})

function advisorDisplay(slot: number) {
  const rec = myAdvisors.value.find(a => a.slot === slot)
  if (!rec) return { name: 'Belum ditetapkan', pending: true, detail: 'Belum ada calon/pembimbing ditetapkan.' }
  const mitra = rec.is_external_supervisor && rec.external_supervisor_name
    ? ` · Mitra: ${rec.external_supervisor_name}${rec.external_supervisor_institution ? ` (${rec.external_supervisor_institution})` : ''}`
    : ''
  if (rec.supervisor_name) {
    return {
      name: rec.supervisor_name,
      pending: false,
      detail: `Ditetapkan resmi (${rec.title_status === 'APPROVED' && rec.confirmation_status === 'APPROVED' ? 'Judul & Kesediaan disetujui' : 'Menunggu finalisasi'})${mitra}`,
    }
  }
  if (rec.candidate_name) {
    return {
      name: `${rec.candidate_name} (Calon)`,
      pending: true,
      detail: `Judul: ${rec.title_status} · Kesediaan: ${rec.confirmation_status}${mitra}`,
    }
  }
  if (mitra) {
    return {
      name: rec.external_supervisor_name || 'Pembimbing mitra',
      pending: false,
      detail: rec.external_supervisor_institution || 'Pembimbing eksternal / mitra',
    }
  }
  return { name: 'Belum dipilih', pending: true, detail: 'Lengkapi calon pembimbing pada pengajuan topik.' }
}

const p1 = computed(() => advisorDisplay(1))
const p2 = computed(() => advisorDisplay(2))
</script>

<template>
  <section class="panel workspace-panel cap-list-panel" aria-labelledby="student-group-card">
    <div class="workspace-panel-header">
      <div class="workspace-panel-title">
        <h2 id="student-group-card">Kelompok &amp; pembimbing capstone Anda</h2>
        <span v-if="group">{{ group.code }} · {{ group.academic_period_name || 'Periode aktif' }}</span>
      </div>
      <div class="workspace-panel-actions">
        <NuxtLink v-if="group?.project_id" class="workspace-text-action" :to="'/capstone/' + group.project_id">Detail topik</NuxtLink>
        <NuxtLink class="workspace-text-action" to="/groups">{{ group ? 'Kelola kelompok' : 'Buat kelompok' }}</NuxtLink>
      </div>
    </div>

    <div v-if="!group" class="empty-state">
      <h3>Anda belum membentuk kelompok capstone</h3>
      <NuxtLink class="button primary" to="/groups">Buat kelompok capstone</NuxtLink>
    </div>

    <div v-else class="group-overview">
      <div class="group-meta-bar">
        <div class="group-title-block">
          <strong class="group-title">{{ group.project_title || group.working_title }}</strong>
          <p class="muted">
            Bidang minat: <strong>{{ group.interest_name }}</strong>
            · Status kelompok: <StatusLabel :value="group.status" />
            <template v-if="group.project_status"> · Topik: <StatusLabel :value="group.project_status" /></template>
          </p>
        </div>
      </div>

      <div class="advisor-pair">
        <div class="advisor-box">
          <span class="advisor-label">Pembimbing 1</span>
          <strong :class="{ muted: p1.pending }">{{ p1.name }}</strong>
          <small class="muted">{{ p1.detail }}</small>
        </div>
        <div class="advisor-box">
          <span class="advisor-label">Pembimbing 2</span>
          <strong :class="{ muted: p2.pending }">{{ p2.name }}</strong>
          <small class="muted">{{ p2.detail }}</small>
        </div>
      </div>

      <div class="workspace-table cap-table-wrap" tabindex="0" aria-label="Daftar anggota kelompok">
        <table class="workspace-table cap-table">
          <thead>
            <tr>
              <th scope="col">Nama anggota</th>
              <th scope="col">NIM</th>
              <th scope="col">Peran kelompok</th>
              <th scope="col">Pembagian tugas / tanggung jawab</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in group.members" :key="m.student_id">
              <td>
                <strong>{{ m.student_name }}</strong>
                <span v-if="m.student_id === ownId" class="muted"> (Anda)</span>
              </td>
              <td>{{ m.nim || '—' }}</td>
              <td>
                <strong :class="m.is_leader ? 'leader-role' : 'muted'">
                  {{ m.is_leader ? 'Ketua kelompok' : 'Anggota' }}
                </strong>
              </td>
              <td>{{ m.responsibility || 'Belum dirinci' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.group-overview { display: grid; border-top: 1px solid var(--line); }
.group-meta-bar { padding: 1rem 1.5rem; border-bottom: 1px solid var(--line); }
.group-title { font-size: 1.0625rem; font-weight: 600; display: block; line-height: 1.4; }
.group-meta-bar p { margin-top: .35rem; font-size: .875rem; }
.advisor-pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-bottom: 1px solid var(--line); }
.advisor-box { display: grid; gap: .25rem; padding: 1rem 1.5rem; background: var(--canvas); }
.advisor-box + .advisor-box { border-left: 1px solid var(--line); }
.advisor-label { font-size: .8125rem; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
.advisor-box strong { font-size: 1rem; font-weight: 600; }
.advisor-box small { font-size: .8125rem; }
.leader-role { color: var(--accent); font-weight: 650; }
@media (max-width: 767px) {
  .advisor-pair { grid-template-columns: minmax(0, 1fr); }
  .advisor-box + .advisor-box { border-left: 0; border-top: 1px solid var(--line); }
  .group-meta-bar, .advisor-box { padding: .875rem 1rem; }
}
</style>
