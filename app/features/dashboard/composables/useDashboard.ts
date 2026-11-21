import { useAuth } from '~/features/auth/composables/useAuth'
import { capstoneAPI } from '~/features/capstone/composables/useCapstone'
import type { UserStats } from '~/types/user'
import type { ChartBarRow, ChartSegment, DashboardData, DashboardMetric, DashboardScope, DashboardStats, DashboardTask } from '../types'

export const dashboardDefinitions: Record<DashboardScope, { title: string; description: string; metrics: [keyof DashboardStats, string][] }> = {
  student: {
    title: 'Dashboard mahasiswa',
    description: 'Pantau kelompok, pembimbing, progres bimbingan, dokumen lengkap, Sempro, dan Ujian Akhir Anda.',
    metrics: [['projects', 'Topik / Judul'], ['guidance_approved', 'Log disetujui'], ['documents_approved', 'Dokumen disetujui'], ['final_exam_passed', 'Lulus ujian akhir']],
  },
  lecturer: {
    title: 'Dashboard dosen',
    description: 'Tinjau persetujuan judul, log bimbingan, dokumen mahasiswa, Sempro, dan Ujian Akhir.',
    metrics: [['supervised_students', 'Mahasiswa bimbingan'], ['title_pending', 'Judul tertunda'], ['guidance_pending', 'Log perlu diperiksa'], ['sempro_scheduled', 'Sempro dijadwalkan']],
  },
  koprodi: { title: 'Dashboard Koprodi', description: 'Pantau judul, pendaftaran proposal, dan hasil ujian program studi.', metrics: [['projects', 'Judul terdaftar'], ['proposal_ready', 'Proposal lengkap valid'], ['sempro_approved', 'Proposal disetujui'], ['final_exam_passed', 'Lulus ujian akhir']] },
  coordinator: {
    title: 'Dashboard koordinator capstone',
    description: 'Pantau finalisasi pembimbing, seminar proposal, ujian akhir, dan capaian capstone program studi.',
    metrics: [['submitted', 'Menunggu finalisasi'], ['finalized', 'Judul ditetapkan'], ['sempro_scheduled', 'Sempro terjadwal'], ['final_exam_scheduled', 'Ujian akhir terjadwal']],
  },
  tu: {
    title: 'Dashboard tata usaha',
    description: 'Pantau verifikasi administrasi topik, persyaratan UP, syarat Ujian Akhir, dan berita acara.',
    metrics: [['proposals', 'Pendaftaran UP'], ['simak_pending', 'SIMAK menunggu'], ['final_exam_apps', 'Berkas ujian akhir'], ['proposal_ready', 'UP lengkap valid']],
  },
  admin: {
    title: 'Dashboard admin',
    description: 'Pantau akun pengguna, data master, capaian capstone, dan publikasi Expo program studi.',
    metrics: [['projects', 'Judul terdaftar'], ['finalized', 'Judul ditetapkan'], ['final_exam_passed', 'Lulus ujian akhir'], ['expo_published', 'Karya Expo terbit']],
  },
}

export function useDashboard() {
  const auth = useAuth()
  const fetcher = useRequestFetch()
  const summary = useAsyncData('dashboard-summary', () => fetcher<DashboardData>(capstoneAPI + '/dashboard'))
  const admin = computed(() => !!auth.user.value?.roles.includes('ADMIN'))
  const users = useAsyncData('dashboard-user-stats', () => fetcher<UserStats>('/api/v1/users/stats'), { immediate: admin.value })
  const definition = computed(() => summary.data.value ? dashboardDefinitions[summary.data.value.scope] : null)

  const metrics = computed<DashboardMetric[]>(() => {
    const result = summary.data.value
    if (!result || !definition.value) return []
    return definition.value.metrics.map(([key, label]) => ({ label, value: result.stats[key] ?? 0 }))
  })

  const userMetrics = computed<DashboardMetric[]>(() => users.data.value ? [
    { label: 'Total pengguna', value: users.data.value.total },
    { label: 'Mahasiswa', value: users.data.value.students },
    { label: 'Dosen', value: users.data.value.lecturers },
    { label: 'Akun aktif', value: users.data.value.active },
  ] : [])

  const adminRoleSegments = computed<ChartSegment[]>(() => {
    const u = users.data.value
    if (!u) return []
    return [
      { label: 'Mahasiswa', value: u.students, color: 'var(--accent)' },
      { label: 'Dosen', value: u.lecturers_only ?? Math.max(0, u.lecturers - (u.coordinators ?? 0)), color: 'var(--success)' },
      { label: 'Koordinator Capstone', value: u.coordinators ?? 0, color: 'var(--warning)' },
      { label: 'Tata Usaha', value: u.tu ?? 0, color: 'var(--info)' },
      { label: 'Admin', value: u.admins ?? 0, color: 'var(--muted)' },
    ]
  })

  const adminCohortBars = computed<ChartBarRow[]>(() => {
    return (users.data.value?.cohorts || []).map(c => ({
      label: String(c.year),
      primary: c.total,
      secondary: c.active,
    }))
  })

  const projectStatusSegments = computed<ChartSegment[]>(() => {
    const st = summary.data.value?.stats
    if (!st) return []
    return [
      { label: 'Draf', value: st.draft, color: 'var(--muted)' },
      { label: 'Diajukan', value: st.submitted, color: 'var(--info)' },
      { label: 'Perlu revisi', value: st.revision, color: 'var(--warning)' },
      { label: 'Ditetapkan', value: st.finalized, color: 'var(--success)' },
    ]
  })

  const semproStatusSegments = computed<ChartSegment[]>(() => {
    const st = summary.data.value?.stats
    if (!st) return []
    return [
      { label: 'Terjadwal', value: st.sempro_scheduled, color: 'var(--info)' },
      { label: 'Revisi Sempro', value: st.sempro_revision, color: 'var(--warning)' },
      { label: 'Disahkan Lulus', value: st.sempro_approved, color: 'var(--success)' },
      { label: 'Seminar Ulang', value: st.sempro_rejected, color: 'var(--error)' },
    ]
  })

  const guidanceSegments = computed<ChartSegment[]>(() => {
    const st = summary.data.value?.stats
    if (!st) return []
    return [
      { label: 'Disetujui', value: st.guidance_approved, color: 'var(--success)' },
      { label: 'Menunggu review', value: st.guidance_pending, color: 'var(--accent)' },
      { label: 'Perlu revisi', value: st.guidance_revision, color: 'var(--warning)' },
    ]
  })

  const studentDocumentBars = computed<(ChartBarRow & { color?: string })[]>(() => {
    const st = summary.data.value?.stats
    if (!st) return []
    return [
      { label: 'Log disetujui', primary: st.guidance_approved, color: 'var(--success)' },
      { label: 'Dokumen disetujui', primary: st.documents_approved, color: 'var(--accent)' },
      { label: 'Dokumen menunggu', primary: st.documents_pending, color: 'var(--info)' },
      { label: 'Dokumen perlu revisi', primary: st.documents_revision, color: 'var(--warning)' },
    ]
  })

  const lecturerQueueBars = computed<(ChartBarRow & { color?: string })[]>(() => {
    const st = summary.data.value?.stats
    if (!st) return []
    return [
      { label: 'Keputusan judul tertunda', primary: st.title_pending, color: 'var(--accent)' },
      { label: 'Konfirmasi kesediaan tertunda', primary: st.confirmation_pending, color: 'var(--info)' },
      { label: 'Log bimbingan menunggu', primary: st.guidance_pending, color: 'var(--warning)' },
      { label: 'Dokumen mahasiswa menunggu', primary: st.documents_pending, color: 'var(--error)' },
      { label: 'Sempro / Ujian akhir aktif', primary: st.sempro_scheduled + st.sempro_revision + (st.final_exam_scheduled ?? 0), color: 'var(--success)' },
    ]
  })

  const tuVerificationBars = computed<ChartBarRow[]>(() => {
    const st = summary.data.value?.stats
    if (!st) return []
    return [
      { label: 'Valid', primary: st.simak_valid, secondary: st.approval_valid },
      { label: 'Menunggu pemeriksaan', primary: st.simak_pending, secondary: st.approval_pending },
      { label: 'Perlu revisi', primary: st.simak_revision, secondary: st.approval_revision },
    ]
  })

  const tuSummarySegments = computed<ChartSegment[]>(() => {
    const st = summary.data.value?.stats
    if (!st) return []
    const incomplete = Math.max(0, st.proposals - st.proposal_ready)
    return [
      { label: 'UP Lengkap (Siap)', value: st.proposal_ready, color: 'var(--success)' },
      { label: 'UP Belum Lengkap', value: incomplete, color: 'var(--warning)' },
      { label: 'Sempro Terjadwal', value: st.sempro_scheduled + st.sempro_revision, color: 'var(--info)' },
      { label: 'Sempro Disahkan', value: st.sempro_approved, color: 'var(--accent)' },
    ]
  })

  const interestBars = computed<ChartBarRow[]>(() => {
    return (summary.data.value?.interest_summary || []).map(item => ({
      label: item.name,
      primary: item.total,
      secondary: item.finalized,
    }))
  })

  const tasks = computed<DashboardTask[]>(() => {
    const data = summary.data.value
    if (!data) return []
    const stats = data.stats
    if (data.scope === 'student') return [
      {
        title: data.student_group ? `Kelompok ${data.student_group.code}` : '1. Bentuk kelompok capstone',
        detail: data.student_group
          ? `${data.student_group.members.length} anggota · Ketua: ${data.student_group.leader_name || 'Terpilih'}.`
          : 'Langkah pertama: buat kelompok 2–5 mahasiswa, tentukan Ketua, bidang minat, dan pembagian tugas.',
        to: '/groups',
        action: data.student_group ? 'Lihat kelompok' : 'Buat kelompok',
      },
      { title: stats.projects ? 'Usulan topik & seminar topik' : '2. Ajukan usulan topik', detail: stats.revision ? 'Usulan topik perlu diperbaiki sesuai catatan.' : stats.finalized ? 'Pembimbing 1 & 2 telah ditetapkan.' : 'Ajukan usulan topik dari kelompok Anda dan daftar Seminar Kelayakan Topik.', to: '/capstone', action: 'Buka topik & judul' },
      { title: 'Bimbingan & Dokumen Capstone', detail: `${stats.guidance_approved} log disetujui · ${stats.documents_approved}/${stats.documents_uploaded} dokumen (B-Series, Proposal, Laporan) disetujui.`, to: '/documents', action: 'Kelola dokumen' },
      { title: 'Sempro, Ujian Akhir & Expo', detail: (stats.final_exam_passed ?? 0) > 0 ? 'Lulus Ujian Akhir! Siapkan materi Capstone Expo.' : stats.sempro_approved ? 'Lulus Sempro! Lengkapi B-200..B-400 & 11 syarat Ujian Akhir.' : 'Unggah enam persyaratan proposal dan pantau validasi TU. Lengkapi jadwal dan penguji setelah jadwal ujian Anda terbit.', to: stats.sempro_approved ? '/final-exam' : '/sempro', action: stats.sempro_approved ? 'Buka Ujian Akhir' : 'Buka Sempro' },
    ]
    if (data.scope === 'lecturer') return [
      { title: 'Persetujuan judul dan kesediaan', detail: `${stats.title_pending} keputusan judul dan ${stats.confirmation_pending} konfirmasi kesediaan belum dicatat.`, to: '/capstone', action: 'Buka daftar judul' },
      { title: 'Pemeriksaan log & dokumen lengkap', detail: `${stats.guidance_pending} log bimbingan dan ${stats.documents_pending} dokumen (B-Series & Laporan) menunggu pemeriksaan.`, to: '/documents', action: 'Periksa dokumen' },
      { title: 'Seminar proposal & Ujian Akhir', detail: `${stats.sempro_scheduled + stats.sempro_revision} Sempro dan ${stats.final_exam_scheduled ?? 0} Ujian Akhir aktif untuk dinilai per CPMK.`, to: '/final-exam', action: 'Buka Ujian Akhir' },
    ]
    if (data.scope === 'coordinator') return [
      { title: 'Rapat finalisasi judul & pembimbing', detail: `${stats.submitted} judul diajukan. Tetapkan Pembimbing 1 & 2 serta lampirkan Surat Tugas.`, to: '/finalization', action: 'Buka finalisasi' },
      { title: 'Sempro, Ujian Akhir & Revisi', detail: `${stats.sempro_scheduled + stats.sempro_revision} Sempro aktif dan ${stats.final_exam_scheduled ?? 0} Ujian Akhir terjadwal.`, to: '/final-exam', action: 'Kelola Ujian Akhir' },
      { title: 'Monitoring & pelaporan resmi', detail: 'Lihat rekap mahasiswa dan unduh laporan Excel atau PDF.', to: '/reports', action: 'Buka laporan' },
      { title: 'Data Master Akademik', detail: 'Kelola periode akademik, bidang minat, jenis dokumen, dan rubrik CPMK.', to: '/admin/master', action: 'Buka Data Master' },
    ]
    if (data.scope === 'koprodi') return [{ title: 'Pendaftaran proposal', detail: 'Pantau keenam persyaratan dan hasil pemeriksaan TU.', to: '/proposal', action: 'Lihat pendaftaran' }, { title: 'Hasil ujian proposal', detail: 'Pantau penilaian individu dan dokumen ujian.', to: '/sempro', action: 'Lihat ujian' }, { title: 'Laporan program studi', detail: 'Unduh rekap judul dan kemajuan mahasiswa.', to: '/reports', action: 'Buka laporan' }]
    if (data.scope === 'tu') return [
      { title: 'Verifikasi berkas UP & syarat Ujian Akhir', detail: `${stats.simak_pending} SIMAK menunggu dan ${stats.final_exam_apps ?? 0} berkas Ujian Akhir terdaftar.`, to: '/final-exam', action: 'Periksa syarat' },
      { title: 'Pemeriksaan administrasi UP', detail: `${stats.approval_pending} surat persetujuan dan ${stats.proposal_ready} berkas UP lengkap.`, to: '/proposal', action: 'Buka persyaratan UP' },
      { title: 'Berita acara & ekspor laporan', detail: 'Unduh Berita Acara Sempro/Ujian Akhir dan laporan rekapitulasi.', to: '/reports', action: 'Buka pelaporan' },
    ]
    if (data.scope === 'admin') return [
      { title: 'Asisten pedoman', detail: 'Kelola dokumen sumber dan pertanyaan mahasiswa.', to: '/assistant', action: 'Asisten Pedoman' },
      { title: 'Data Master Akademik', detail: 'Konfigurasi periode akademik, bidang minat, jenis dokumen, syarat tahap, & rubrik.', to: '/admin/master', action: 'Kelola Data Master' },
      { title: 'Capstone Expo & Monitoring', detail: `${stats.expo_submitted ?? 0} karya Expo diajukan (${stats.expo_published ?? 0} terbit galeri).`, to: '/expo', action: 'Kelola Expo' },
    ]
    return []
  })

  return {
    summary,
    users,
    admin,
    definition,
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
  }
}
