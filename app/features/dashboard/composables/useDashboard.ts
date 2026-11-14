import { useAuth } from '~/features/auth/composables/useAuth'
import { capstoneAPI } from '~/features/capstone/composables/useCapstone'
import type { UserStats } from '~/types/user'
import type { DashboardData, DashboardMetric, DashboardScope, DashboardStats, DashboardTask } from '../types'

const definitions: Record<DashboardScope, { title: string; description: string; metrics: [keyof DashboardStats, string][] }> = {
 student: { title: 'Dashboard mahasiswa', description: 'Pantau judul, bimbingan, dan kelengkapan berkas ujian proposal Anda.', metrics: [['projects', 'Judul saya'], ['finalized', 'Judul ditetapkan'], ['guidance', 'Log bimbingan'], ['proposal_ready', 'Berkas UP lengkap']] },
 lecturer: { title: 'Dashboard dosen', description: 'Tinjau usulan yang terkait dengan Anda dan log mahasiswa bimbingan.', metrics: [['supervised_students', 'Mahasiswa bimbingan'], ['title_pending', 'Keputusan judul tertunda'], ['confirmation_pending', 'Konfirmasi tertunda'], ['guidance_pending', 'Log perlu diperiksa']] },
 coordinator: { title: 'Dashboard koordinator TA', description: 'Pantau usulan, keputusan pembimbing, dan kesiapan finalisasi judul.', metrics: [['submitted', 'Menunggu finalisasi'], ['finalized', 'Judul ditetapkan'], ['students', 'Mahasiswa terdaftar'], ['confirmation_pending', 'Konfirmasi tertunda']] },
 tu: { title: 'Dashboard tata usaha', description: 'Pantau pendaftaran UP dan pemeriksaan masing-masing berkas persyaratan.', metrics: [['proposals', 'Pendaftaran UP'], ['simak_pending', 'Bukti SIMAK menunggu'], ['approval_pending', 'Surat menunggu'], ['proposal_ready', 'Kedua berkas valid']] },
 admin: { title: 'Dashboard admin', description: 'Pantau akun pengguna dan proses pendaftaran capstone program studi.', metrics: [['projects', 'Judul terdaftar'], ['submitted', 'Judul diajukan'], ['finalized', 'Judul ditetapkan'], ['students', 'Mahasiswa dalam kelompok']] },
 koprodi: { title: 'Dashboard Koprodi', description: 'Pantau pendaftaran dan penetapan judul menurut bidang minat program studi.', metrics: [['projects', 'Judul terdaftar'], ['submitted', 'Judul diajukan'], ['finalized', 'Judul ditetapkan'], ['students', 'Mahasiswa terdaftar']] },
}
export function useDashboard() {
 const auth = useAuth()
 const fetcher = useRequestFetch()
 const summary = useAsyncData('dashboard-summary', () => fetcher<DashboardData>(capstoneAPI + '/dashboard'))
 const admin = computed(() => !!auth.user.value?.roles.includes('ADMIN'))
 const users = useAsyncData('dashboard-user-stats', () => fetcher<UserStats>('/api/v1/users/stats'), { immediate: admin.value })
 const definition = computed(() => summary.data.value ? definitions[summary.data.value.scope] : null)
 const metrics = computed<DashboardMetric[]>(() => {
  const result = summary.data.value
  if (!result || !definition.value) return []
  return definition.value.metrics.map(([key, label]) => ({ label, value: result.stats[key] }))
 })
 const userMetrics = computed<DashboardMetric[]>(() => users.data.value ? [
  { label: 'Total pengguna', value: users.data.value.total }, { label: 'Mahasiswa', value: users.data.value.students },
  { label: 'Dosen', value: users.data.value.lecturers }, { label: 'Akun aktif', value: users.data.value.active },
 ] : [])
 const tasks = computed<DashboardTask[]>(() => {
  const data = summary.data.value; if (!data) return []
  const stats = data.stats
  if (data.scope === 'student') return [
   { title: stats.projects ? 'Pendaftaran judul' : 'Daftarkan kelompok Anda', detail: stats.revision ? 'Judul perlu diperbaiki sesuai catatan koordinator.' : stats.finalized ? 'Judul dan pembimbing sudah ditetapkan.' : 'Lengkapi deskripsi yang disahkan, anggota, dan calon pembimbing masing-masing.', to: '/capstone', action: 'Lihat judul saya' },
   { title: 'Bimbingan', detail: `${stats.guidance_pending} log menunggu pemeriksaan pembimbing.`, to: '/guidance', action: 'Buka log bimbingan' },
   { title: 'Persyaratan UP', detail: stats.proposal_ready ? 'Kedua berkas sudah divalidasi TU.' : 'Unggah bukti SIMAK berstatus diterima dan surat persetujuan pembimbing.', to: '/proposal', action: 'Buka persyaratan UP' },
  ]
  if (data.scope === 'lecturer') return [
   { title: 'Persetujuan judul dan kesediaan', detail: `${stats.title_pending} keputusan judul dan ${stats.confirmation_pending} konfirmasi kesediaan belum dicatat. Keduanya merupakan keputusan terpisah.`, to: '/capstone', action: 'Buka daftar judul' },
   { title: 'Pemeriksaan bimbingan', detail: `${stats.guidance_pending} log pertemuan dengan Anda menunggu pemeriksaan.`, to: '/guidance', action: 'Periksa log bimbingan' },
  ]
  if (data.scope === 'coordinator') return [
   { title: 'Rapat finalisasi judul', detail: `${stats.submitted} judul diajukan. Tetapkan pembimbing per mahasiswa dan catat dua keputusan secara terpisah.`, to: '/finalization', action: 'Buka tabel finalisasi' },
   { title: 'Daftar dan ekspor', detail: 'Lihat deskripsi dan unduh seluruh data atau hasil filter bidang minat.', to: '/capstone', action: 'Buka daftar judul' },
   { title: 'Bidang minat', detail: 'Perbarui pilihan bidang minat resmi untuk formulir pendaftaran.', to: '/admin/interests', action: 'Kelola bidang minat' },
  ]
  if (data.scope === 'tu') return [
   { title: 'Verifikasi berkas UP', detail: `${stats.simak_pending} bukti SIMAK dan ${stats.approval_pending} surat persetujuan menunggu pemeriksaan.`, to: '/proposal', action: 'Periksa berkas UP' },
   { title: 'Daftar judul', detail: 'Buka informasi pendaftaran dan unduh Excel berdasarkan bidang minat atau seluruh data.', to: '/capstone', action: 'Buka daftar judul' },
  ]
  if (data.scope === 'admin') return [
   { title: 'Akun dan peran', detail: 'Kelola akun mahasiswa, dosen, koordinator TA, tata usaha, dan admin.', to: '/admin/users', action: 'Kelola pengguna' },
   { title: 'Bidang minat', detail: 'Siapkan pilihan bidang minat sebelum mahasiswa mengajukan judul.', to: '/admin/interests', action: 'Kelola bidang minat' },
  ]
  return [{ title: 'Pemantauan program studi', detail: 'Lihat daftar judul dan unduh rekap. Kewenangan finalisasi memerlukan peran Koordinator TA yang diberikan secara terpisah.', to: '/capstone', action: 'Buka daftar judul' }]
 })
 return { summary, users, admin, definition, metrics, userMetrics, tasks }
}
