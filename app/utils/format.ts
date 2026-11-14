import type { Role } from '~/types/user'

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase()
}
export const roleLabels: Record<Role, string> = { ADMIN: 'Admin', DOSEN: 'Dosen', MAHASISWA: 'Mahasiswa', KOPRODI: 'Koprodi', KOORDINATOR_TA: 'Koordinator TA', TU: 'Tata usaha' }
export function dateTime(value: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Makassar' }).format(new Date(value))
}
export function apiMessage(error: unknown) {
  const e = error as { data?: { error?: { message?: string }; statusMessage?: string }; message?: string }
  return e.data?.error?.message || e.data?.statusMessage || 'Permintaan gagal. Periksa koneksi lalu coba kembali.'
}
