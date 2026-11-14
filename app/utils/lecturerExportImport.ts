import * as XLSX from 'xlsx'
import type { Role, User } from '~/types/user'

export interface ParsedLecturerRow {
  nip: string
  nidn: string
  full_name: string
  email: string
  phone: string
  expertise: string
  is_koprodi: boolean
  password: string
  isValid: boolean
  errorReason?: string
}

export function downloadLecturerTemplate() {
  const headers = [
    'NIP',
    'NIDN',
    'Nama Lengkap & Gelar',
    'Email Institusi',
    'Nomor Telepon',
    'Bidang Keahlian',
    'Peran Koprodi',
    'Kata Sandi Awal',
  ]

  const sampleRows = [
    [
      '198203152008121002',
      '0015038201',
      'Dr. Ir. I Made Dwi Putra, S.T., M.T.',
      'madedwi@unud.ac.id',
      '081234567890',
      'Tata Kelola Teknologi Informasi',
      'Ya',
      'SandiDosen123!',
    ],
    [
      '198507202012122001',
      '0020078502',
      'Dr. Ni Putu Sutramiani, S.Kom., M.T.',
      'sutramiani@unud.ac.id',
      '081234567891',
      'Data Science',
      'Tidak',
      'SandiDosen123!',
    ],
    [
      '198811052015041003',
      '0005118803',
      'I Gede Surya Rahayuda, S.Kom., M.Kom.',
      'suryarahayuda@unud.ac.id',
      '081234567892',
      'Sistem Informasi',
      'Tidak',
      'SandiDosen123!',
    ],
  ]

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows])

  // Format kolom agar rapi dan nyaman dibaca saat dibuka di Microsoft Excel
  ws['!cols'] = [
    { wch: 24 }, // NIP
    { wch: 16 }, // NIDN
    { wch: 38 }, // Nama Lengkap & Gelar
    { wch: 32 }, // Email Institusi
    { wch: 18 }, // Nomor Telepon
    { wch: 40 }, // Bidang Keahlian
    { wch: 16 }, // Peran Koprodi
    { wch: 20 }, // Kata Sandi Awal
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template Dosen')
  XLSX.writeFile(wb, 'Template_Import_Dosen_Capstone.xlsx')
}

export function exportLecturersToExcel(lecturers: User[]) {
  const headers = [
    'NIP',
    'NIDN',
    'Nama Lengkap & Gelar',
    'Email Institusi',
    'Nomor Telepon',
    'Bidang Keahlian',
    'Peran',
    'Status Akun',
    'Terdaftar Pada',
  ]

  const rows = lecturers.map((d) => {
    const rolesText = d.roles.includes('KOPRODI') ? 'Dosen & Koprodi' : 'Dosen'
    return [
      d.nip || '',
      d.nidn || '',
      d.full_name,
      d.email,
      d.phone || '',
      d.expertise || '',
      rolesText,
      d.is_active ? 'Aktif' : 'Nonaktif',
      d.created_at ? d.created_at.split('T')[0] : '',
    ]
  })

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  ws['!cols'] = [
    { wch: 24 }, // NIP
    { wch: 16 }, // NIDN
    { wch: 38 }, // Nama Lengkap
    { wch: 32 }, // Email
    { wch: 18 }, // Nomor Telepon
    { wch: 40 }, // Bidang Keahlian
    { wch: 18 }, // Peran
    { wch: 14 }, // Status Akun
    { wch: 16 }, // Terdaftar Pada
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Daftar Dosen')
  const dateStr = new Date().toISOString().split('T')[0]
  XLSX.writeFile(wb, `Data_Dosen_Capstone_${dateStr}.xlsx`)
}

export async function parseLecturerFile(file: File): Promise<ParsedLecturerRow[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return []

  const worksheet = workbook.Sheets[sheetName]
  if (!worksheet) return []

  const data = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' })
  if (data.length < 2) return []

  const headerRow = data[0]
  if (!Array.isArray(headerRow)) return []

  const headers = headerRow.map(h => String(h ?? '').trim().toLowerCase())

  // Deteksi indeks kolom secara fleksibel
  const nipIdx = headers.findIndex(h => h.includes('nip'))
  const nidnIdx = headers.findIndex(h => h.includes('nidn'))
  const nameIdx = headers.findIndex(h => h.includes('nama') || h.includes('name'))
  const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('surel'))
  const phoneIdx = headers.findIndex(h => h.includes('telepon') || h.includes('telp') || h.includes('phone') || h.includes('hp'))
  const expIdx = headers.findIndex(h => h.includes('keahlian') || h.includes('expertise') || h.includes('bidang') || h.includes('riset'))
  const koprodiIdx = headers.findIndex(h => h.includes('koprodi') || h.includes('koordinator'))
  const passIdx = headers.findIndex(h => h.includes('sandi') || h.includes('password') || h.includes('pass'))

  const results: ParsedLecturerRow[] = []

  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    if (!Array.isArray(row) || row.every(val => String(val ?? '').trim() === '')) {
      continue
    }

    const nip = nipIdx >= 0 ? String(row[nipIdx] ?? '').trim() : ''
    const nidn = nidnIdx >= 0 ? String(row[nidnIdx] ?? '').trim() : ''
    const fullName = nameIdx >= 0 ? String(row[nameIdx] ?? '').trim() : ''
    const email = emailIdx >= 0 ? String(row[emailIdx] ?? '').trim().toLowerCase() : ''
    const phone = phoneIdx >= 0 ? String(row[phoneIdx] ?? '').trim() : ''
    const expertise = expIdx >= 0 ? String(row[expIdx] ?? '').trim() : ''
    const koprodiRaw = koprodiIdx >= 0 ? String(row[koprodiIdx] ?? '').trim().toLowerCase() : ''
    const isKoprodi = ['ya', 'yes', 'true', '1', 'koprodi'].includes(koprodiRaw)
    const password = passIdx >= 0 ? String(row[passIdx] ?? '').trim() : ''

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    let isValid = true
    let errorReason = ''

    if (!fullName || fullName.length < 2) {
      isValid = false
      errorReason = 'Nama lengkap & gelar wajib diisi (minimal 2 karakter).'
    } else if (fullName.length > 150) {
      isValid = false
      errorReason = 'Nama lengkap maksimal 150 karakter.'
    } else if (!email || !emailRegex.test(email)) {
      isValid = false
      errorReason = 'Format email institusi tidak valid.'
    } else if (nip && nip.length > 30) {
      isValid = false
      errorReason = 'NIP maksimal 30 karakter.'
    } else if (nidn && nidn.length > 30) {
      isValid = false
      errorReason = 'NIDN maksimal 30 karakter.'
    } else if (phone && phone.length > 30) {
      isValid = false
      errorReason = 'Nomor telepon maksimal 30 karakter.'
    } else if (expertise && expertise.length > 2000) {
      isValid = false
      errorReason = 'Bidang keahlian maksimal 2000 karakter.'
    } else if (password && password.length < 12) {
      isValid = false
      errorReason = 'Kata sandi awal minimal 12 karakter.'
    } else if (password && password.length > 72) {
      isValid = false
      errorReason = 'Kata sandi awal maksimal 72 karakter.'
    }

    results.push({
      nip,
      nidn,
      full_name: fullName,
      email,
      phone,
      expertise,
      is_koprodi: isKoprodi,
      password: password || 'SandiDosen123!',
      isValid,
      errorReason: errorReason || undefined,
    })
  }

  return results
}

