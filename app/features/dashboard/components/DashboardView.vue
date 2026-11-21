<script setup lang="ts">
import { useAuth } from '~/features/auth/composables/useAuth'
import { useDashboard } from '../composables/useDashboard'
import DashboardChartBars from './DashboardChartBars.vue'
import DashboardChartDonut from './DashboardChartDonut.vue'
import DashboardMetrics from './DashboardMetrics.vue'
import DashboardProjects from './DashboardProjects.vue'
import DashboardStudentGroup from './DashboardStudentGroup.vue'
import DashboardStudentProgress from './DashboardStudentProgress.vue'
import DashboardTasks from './DashboardTasks.vue'

const auth = useAuth()
const dashboard = useDashboard()
const { data, status, error, refresh } = dashboard.summary
const { data: users, error: usersError, refresh: refreshUsers } = dashboard.users
const {
  admin,
  metrics,
  userMetrics,
  adminRoleSegments,
  adminCohortBars,
  projectStatusSegments,
  semproStatusSegments,
  guidanceSegments,
  studentDocumentBars,
  lecturerQueueBars,
  tuVerificationBars,
  tuSummarySegments,
  interestBars,
  tasks,
} = dashboard

const personal = computed(() => data.value?.scope === 'student' || data.value?.scope === 'lecturer')
const primary = computed(() => {
  const s = data.value?.scope
  if (s === 'student' && !data.value?.student_group) return { to: '/groups', label: 'Buat kelompok' }
  if (s === 'student' && !data.value?.stats.projects) return { to: '/capstone', label: 'Ajukan topik' }
  if (s === 'admin') return { to: '/admin/users', label: 'Kelola pengguna' }
  if (s === 'coordinator') return { to: '/finalization', label: 'Buka finalisasi' }
  if (s === 'tu') return { to: '/proposal', label: 'Periksa berkas UP' }
  if (s === 'lecturer') return { to: '/guidance', label: 'Periksa bimbingan' }
  return { to: '/capstone', label: 'Buka daftar judul' }
})
</script>

<template>
  <section class="dashboard-page">
    <div v-if="status === 'pending'" class="panel workspace-panel cap-list-panel">
      <div class="workspace-panel-header"><div class="workspace-panel-title"><h2>Ringkasan dashboard</h2></div></div>
      <p role="status" class="cap-loading">Memuat ringkasan…</p>
    </div>
    <div v-else-if="error" class="panel workspace-panel cap-list-panel" role="alert">
      <div class="workspace-panel-header"><div class="workspace-panel-title"><h2>Ringkasan dashboard</h2></div></div>
      <div class="empty-state">
        <h2>Ringkasan belum dapat dimuat</h2>
        <p>Periksa koneksi lalu coba kembali.</p>
        <button class="button secondary" @click="refresh()">Coba lagi</button>
      </div>
    </div>

    <div v-else-if="data" class="dashboard-stack">
      <!-- ADMIN: Pengguna di atas + Grafik pengguna, lalu Ringkasan & Grafik Capstone Prodi -->
      <template v-if="admin">
        <section class="panel workspace-panel dashboard-accounts" aria-labelledby="dashboard-accounts">
          <div class="workspace-panel-header">
            <div class="workspace-panel-title"><h2 id="dashboard-accounts">Ringkasan akun pengguna</h2></div>
            <NuxtLink class="workspace-text-action" to="/admin/users">Manajemen pengguna</NuxtLink>
          </div>
          <div v-if="usersError" class="notice error cap-panel-feedback" role="alert">
            Statistik akun belum dapat dimuat. <button class="button secondary" @click="refreshUsers()">Coba lagi</button>
          </div>
          <div v-else-if="users" class="dashboard-account-metrics">
            <DashboardMetrics :items="userMetrics" label="Statistik akun" />
          </div>
          <p v-else role="status" class="cap-loading">Memuat statistik akun…</p>
        </section>

        <div v-if="users" class="chart-grid">
          <DashboardChartDonut
            title="Komposisi pengguna per peran"
            :subtitle="`${users.active} aktif · ${users.inactive ?? Math.max(0, users.total - users.active)} nonaktif`"
            center-label="Pengguna"
            :segments="adminRoleSegments"
            action-to="/admin/users"
            action-label="Kelola peran"
          />
          <DashboardChartBars
            title="Sebaran mahasiswa per angkatan"
            subtitle="Perbandingan jumlah seluruh mahasiswa dan akun aktif tiap tahun masuk."
            :rows="adminCohortBars"
            primary-label="Total mahasiswa"
            secondary-label="Akun aktif"
            primary-color="var(--accent)"
            secondary-color="var(--success)"
            layout="vertical"
            empty-text="Belum ada data angkatan mahasiswa."
            action-to="/admin/users"
            action-label="Lihat mahasiswa"
          />
        </div>

        <section class="panel workspace-statistics-panel" aria-label="Ringkasan capstone program studi">
          <DashboardMetrics :items="metrics" label="Ringkasan capstone" />
        </section>

        <div class="chart-grid">
          <DashboardChartDonut
            title="Status judul capstone program studi"
            subtitle="Distribusi pendaftaran judul dari draf hingga penetapan pembimbing."
            center-label="Judul"
            :segments="projectStatusSegments"
            action-to="/capstone"
            action-label="Daftar judul"
          />
          <DashboardChartBars
            title="Pendaftaran menurut bidang minat"
            subtitle="Perbandingan judul terdaftar dan yang sudah ditetapkan per bidang minat."
            :rows="interestBars"
            primary-label="Terdaftar"
            secondary-label="Sudah ditetapkan"
            primary-color="var(--info)"
            secondary-color="var(--success)"
            empty-text="Belum ada bidang minat terdaftar."
            :action-to="data.scope === 'koprodi' ? '/reports' : '/admin/interests'"
            :action-label="data.scope === 'koprodi' ? 'Lihat laporan' : 'Kelola bidang minat'"
          />
        </div>
      </template>

      <!-- MAHASISWA: Kelompok & Pembimbing + Progres tahapan + Grafik Bimbingan & Dokumen -->
      <template v-else-if="data.scope === 'student'">
        <section class="panel workspace-statistics-panel" aria-label="Ringkasan mahasiswa">
          <DashboardMetrics :items="metrics" label="Ringkasan mahasiswa" />
        </section>

        <DashboardStudentGroup :group="data.student_group" :own-id="auth.user.value?.id || ''" />

        <DashboardStudentProgress :stats="data.stats" />

        <div class="chart-grid">
          <DashboardChartDonut
            title="Status log bimbingan saya"
            subtitle="Proporsi log pertemuan yang telah disetujui, menunggu, atau perlu revisi."
            center-label="Total log"
            :segments="guidanceSegments"
            action-to="/guidance"
            action-label="Buka bimbingan"
          />
          <DashboardChartBars
            title="Rekap dokumen Seri B dan bimbingan"
            subtitle="Ringkasan status unggahan B-100 s.d. B-400 serta log bimbingan Anda."
            :rows="studentDocumentBars"
            primary-label="Jumlah dokumen / log"
            empty-text="Belum ada dokumen atau bimbingan yang dicatat."
            action-to="/documents"
            action-label="Dokumen Seri B"
          />
        </div>
      </template>

      <!-- DOSEN: Antrean kerja dosen + Grafik bimbingan mahasiswa -->
      <template v-else-if="data.scope === 'lecturer'">
        <section class="panel workspace-statistics-panel" aria-label="Ringkasan dosen">
          <DashboardMetrics :items="metrics" label="Ringkasan dosen" />
        </section>

        <div class="chart-grid">
          <DashboardChartBars
            title="Antrean tindakan dosen"
            subtitle="Daftar usulan judul, log bimbingan, dokumen Seri B, dan Sempro yang perlu ditindaklanjuti."
            :rows="lecturerQueueBars"
            primary-label="Jumlah antrean"
            action-to="/guidance"
            action-label="Periksa bimbingan"
          />
          <DashboardChartDonut
            title="Status bimbingan mahasiswa"
            subtitle="Distribusi persetujuan seluruh catatan bimbingan mahasiswa bimbingan Anda."
            center-label="Total log"
            :segments="guidanceSegments"
            action-to="/documents"
            action-label="Periksa dokumen"
          />
        </div>
      </template>

      <!-- KOORDINATOR CAPSTONE: Funnel judul + Progres Sempro + Bidang Minat -->
      <template v-else-if="data.scope === 'coordinator' || data.scope === 'koprodi'">
        <section class="panel workspace-statistics-panel" aria-label="Ringkasan koordinator capstone">
          <DashboardMetrics :items="metrics" label="Ringkasan koordinator" />
        </section>

        <div class="chart-grid">
          <DashboardChartDonut
            title="Distribusi status judul capstone"
            subtitle="Pantau usulan yang diajukan dan siap masuk rapat finalisasi."
            center-label="Judul"
            :segments="projectStatusSegments"
            :action-to="data.scope === 'koprodi' ? '/capstone' : '/finalization'"
            :action-label="data.scope === 'koprodi' ? 'Daftar judul' : 'Tabel finalisasi'"
          />
          <DashboardChartDonut
            title="Progres seminar proposal (Sempro)"
            subtitle="Status penjadwalan, revisi pasca-Sempro, dan kelulusan seminar proposal."
            center-label="Sempro"
            :segments="semproStatusSegments"
            action-to="/sempro"
            action-label="Kelola Sempro"
          />
        </div>

        <DashboardChartBars
          title="Pendaftaran judul menurut bidang minat"
          subtitle="Perbandingan jumlah judul terdaftar dan ditetapkan per bidang minat."
          :rows="interestBars"
          primary-label="Terdaftar"
          secondary-label="Sudah ditetapkan"
          primary-color="var(--accent)"
          secondary-color="var(--success)"
          :action-to="data.scope === 'koprodi' ? '/reports' : '/admin/interests'"
          :action-label="data.scope === 'koprodi' ? 'Lihat laporan' : 'Kelola bidang minat'"
        />
      </template>

      <!-- TATA USAHA (TU): Verifikasi SIMAK vs Surat Persetujuan + Administrasi UP/Sempro + Bidang Minat -->
      <template v-else-if="data.scope === 'tu'">
        <section class="panel workspace-statistics-panel" aria-label="Ringkasan tata usaha">
          <DashboardMetrics :items="metrics" label="Ringkasan tata usaha" />
        </section>

        <div class="chart-grid">
          <DashboardChartBars
            title="Pemeriksaan berkas persyaratan UP"
            subtitle="Perbandingan status verifikasi Bukti SIMAK dan Surat Persetujuan Pembimbing."
            :rows="tuVerificationBars"
            primary-label="Bukti SIMAK"
            secondary-label="Surat Persetujuan"
            primary-color="var(--accent)"
            secondary-color="var(--info)"
            action-to="/proposal"
            action-label="Periksa berkas UP"
          />
          <DashboardChartDonut
            title="Kesiapan administrasi UP dan Sempro"
            subtitle="Proporsi berkas UP lengkap beserta status berita acara seminar proposal."
            center-label="Berkas / Sempro"
            :segments="tuSummarySegments"
            action-to="/sempro"
            action-label="Berita acara Sempro"
          />
        </div>

        <DashboardChartBars
          title="Rekap judul capstone per bidang minat"
          subtitle="Data bidang minat untuk administrasi dan ekspor daftar judul prodi."
          :rows="interestBars"
          primary-label="Terdaftar"
          secondary-label="Sudah ditetapkan"
          primary-color="var(--info)"
          secondary-color="var(--success)"
          action-to="/capstone"
          action-label="Daftar & ekspor"
        />
      </template>

      <div class="dashboard-content">
        <DashboardTasks :items="tasks" :primary="primary" />
        <DashboardProjects :projects="data.recent_projects" :personal="personal" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.dashboard-page { width: 100%; container: dashboard / inline-size; }
.dashboard-stack { display: grid; gap: clamp(.75rem, 1.5cqi, 1.25rem); }
.dashboard-stack :deep(.workspace-statistics-panel) { margin: 0; padding: clamp(.875rem, 1.5cqi, 1.5rem); border-radius: 1rem; }
.dashboard-stack :deep(.workspace-stat) { padding-inline-start: clamp(.75rem, 1.5cqi, 1.5rem); }
.dashboard-stack :deep(.workspace-stat dt) { font-size: clamp(.8125rem, 1.1cqi, .875rem); }
.dashboard-stack :deep(.workspace-stat dd) { margin-top: clamp(.25rem, .5cqi, .375rem); font-size: clamp(1.5rem, 2.25cqi, 1.875rem); }
.dashboard-accounts { min-width: 0; }
.dashboard-accounts h2 { font-size: clamp(.9375rem, 1.25cqi, 1rem); font-weight: 600; }
.dashboard-stack :deep(.workspace-panel-header) { padding: clamp(.875rem, 1.25cqi, 1.125rem) clamp(1rem, 1.5cqi, 1.25rem) clamp(.625rem, 1cqi, .75rem); }
.dashboard-account-metrics { padding: .25rem clamp(1rem, 1.5cqi, 1.25rem) clamp(.75rem, 1.25cqi, 1rem); }
.chart-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(.75rem, 1.25cqi, 1rem); align-items: stretch; }
.dashboard-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 28rem), 1fr)); gap: clamp(.75rem, 1.25cqi, 1rem); align-items: start; }
.dashboard-content :deep(.panel) { border-radius: 1rem; }
.dashboard-content :deep(.dashboard-task-list), .dashboard-content :deep(.dashboard-project-list) { padding: 0 clamp(1rem, 1.5cqi, 1.25rem) clamp(1rem, 1.5cqi, 1.25rem); }
.dashboard-content :deep(.dashboard-task-list) { gap: clamp(.625rem, 1.1cqi, .875rem); }
.dashboard-content :deep(.dashboard-task) { gap: clamp(.75rem, 1.25cqi, 1rem); padding-top: clamp(.625rem, 1.1cqi, .875rem); }
.dashboard-content :deep(.dashboard-task h3), .dashboard-content :deep(.dashboard-project-list h3) { font-size: clamp(.9375rem, 1.25cqi, 1rem); }
.dashboard-content :deep(.dashboard-task p), .dashboard-content :deep(.dashboard-project-list p) { margin-top: clamp(.25rem, .5cqi, .375rem); font-size: clamp(.8125rem, 1.1cqi, .875rem); line-height: 1.5; }
.dashboard-content :deep(.empty-state) { padding: clamp(1.5rem, 4cqi, 2.5rem) clamp(1rem, 1.5cqi, 1.25rem); }
.dashboard-content :deep(.empty-state h3) { font-size: clamp(1rem, 1.5cqi, 1.125rem); }
.dashboard-content :deep(.empty-state p) { margin: .5rem auto 0; font-size: clamp(.875rem, 1.25cqi, .9375rem); }
@container dashboard (max-width: 72rem) {
  .dashboard-stack :deep(.workspace-statistics) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(.75rem, 1.5cqi, 1rem) clamp(.5rem, 1.75cqi, 1.25rem); }
  .dashboard-stack :deep(.workspace-stat) { padding-left: 1.25rem; }
  .dashboard-stack :deep(.workspace-stat:nth-child(odd)) { padding-left: 0; border-left: 0; }
}
@container dashboard (max-width: 58rem) { .chart-grid { grid-template-columns: minmax(0, 1fr); } }
@container dashboard (max-width: 44rem) { .dashboard-content :deep(.dashboard-task) { align-items: flex-start; flex-direction: column; gap: clamp(.375rem, 1.5cqi, .5rem); } }
</style>
