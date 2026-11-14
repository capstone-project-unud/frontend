import * as XLSX from 'xlsx'
import type { User } from '~/types/user'

export interface ParsedStudentRow {
  nim: string
  full_name: string
  email: string
  admission_year: number
  phone: string
  password: string
  isValid: boolean
  errorReason?: string
}

export function downloadStudentTemplate() {
  const headers = ['NIM', 'Nama Lengkap', 'Email Institusi', 'Angkatan', 'Nomor Telepon', 'Kata Sandi Awal']
  const sampleRows = [
    ['2205551001', 'I Putu Gede Mahardika', 'mahardika@student.unud.ac.id', 2022, '081234567890', 'SandiRahasia123!'],
    ['2205551002', 'Ni Kadek Ayu Lestari', 'ayulestari@student.unud.ac.id', 2022, '081234567891', 'SandiRahasia123!'],
    ['2205551003', 'I Made Bagus Wicaksana', 'baguswicaksana@student.unud.ac.id', 2022, '081234567892', 'SandiRahasia123!'],
  ]

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows])

  // Format kolom agar rapi dan nyaman dibaca saat dibuka di Microsoft Excel
  ws['!cols'] = [
    { wch: 16 }, // NIM
    { wch: 32 }, // Nama Lengkap
    { wch: 36 }, // Email Institusi
    { wch: 12 }, // Angkatan
    { wch: 18 }, // Nomor Telepon
    { wch: 22 }, // Kata Sandi Awal
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template Mahasiswa')
  XLSX.writeFile(wb, 'Template_Import_Mahasiswa_Capstone.xlsx')
}

export function exportStudentsToExcel(students: User[]) {
  const headers = ['NIM', 'Nama Lengkap', 'Email', 'Angkatan', 'Nomor Telepon', 'Status Akun', 'Terdaftar Pada']
  const rows = students.map(s => [
    s.nim || '',
    s.full_name,
    s.email,
    s.admission_year || '',
    s.phone || '',
    s.is_active ? 'Aktif' : 'Nonaktif',
    s.created_at ? s.created_at.split('T')[0] : '',
  ])

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  ws['!cols'] = [
    { wch: 16 }, // NIM
    { wch: 32 }, // Nama Lengkap
    { wch: 36 }, // Email
    { wch: 12 }, // Angkatan
    { wch: 18 }, // Nomor Telepon
    { wch: 14 }, // Status Akun
    { wch: 16 }, // Terdaftar Pada
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Daftar Mahasiswa')
  const dateStr = new Date().toISOString().split('T')[0]
  XLSX.writeFile(wb, `Data_Mahasiswa_Capstone_${dateStr}.xlsx`)
}

// Alias untuk kompatibilitas
export const exportStudentsToCsv = exportStudentsToExcel

export async function parseStudentFile(file: File): Promise<ParsedStudentRow[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return []

  const worksheet = workbook.Sheets[sheetName]
  if (!worksheet) return []

  // Baca seluruh baris dalam bentuk array 2 dimensi
  const data = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' })
  if (data.length < 2) return []

  const headerRow = data[0]
  if (!Array.isArray(headerRow)) return []

  const headers = headerRow.map(h => String(h ?? '').trim().toLowerCase())

  // Deteksi indeks kolom secara fleksibel
  const nimIdx = headers.findIndex(h => h.includes('nim'))
  const nameIdx = headers.findIndex(h => h.includes('nama') || h.includes('name'))
  const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('surel'))
  const yearIdx = headers.findIndex(h => h.includes('angkatan') || h.includes('year') || h.includes('tahun'))
  const phoneIdx = headers.findIndex(h => h.includes('telepon') || h.includes('telp') || h.includes('phone') || h.includes('hp'))
  const passIdx = headers.findIndex(h => h.includes('sandi') || h.includes('password') || h.includes('pass'))

  const currentYear = new Date().getFullYear()
  const results: ParsedStudentRow[] = []

  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    if (!Array.isArray(row)) continue
    if (row.length === 0 || row.every(val => !String(val ?? '').trim())) continue

    const nimRaw = nimIdx >= 0 ? row[nimIdx] : ''
    const nim = String(nimRaw ?? '').trim()

    const nameRaw = nameIdx >= 0 ? row[nameIdx] : ''
    const full_name = String(nameRaw ?? '').trim()

    const emailRaw = emailIdx >= 0 ? row[emailIdx] : ''
    const email = String(emailRaw ?? '').trim().toLowerCase()

    const yearRaw = yearIdx >= 0 ? row[yearIdx] : ''
    const parsedYear = parseInt(String(yearRaw ?? '').trim(), 10)
    const admission_year = parsedYear || currentYear

    const phoneRaw = phoneIdx >= 0 ? row[phoneIdx] : ''
    const phone = String(phoneRaw ?? '').trim()

    const passRaw = passIdx >= 0 ? row[passIdx] : ''
    let password = String(passRaw ?? '').trim()

    if (!password && nim) {
      password = `Capstone#${nim}`
    }

    const errors: string[] = []
    if (!nim) errors.push('NIM wajib diisi')
    if (!full_name || full_name.length < 2) errors.push('Nama minimal 2 karakter')
    if (!email || !email.includes('@')) errors.push('Format email tidak valid')
    if (!admission_year || admission_year < 2000 || admission_year > currentYear + 1) {
      errors.push('Tahun angkatan tidak valid')
    }
    if (password && password.length < 12) {
      errors.push('Kata sandi minimal 12 karakter')
    }

    results.push({
      nim,
      full_name,
      email,
      admission_year,
      phone,
      password,
      isValid: errors.length === 0,
      errorReason: errors.join(', '),
    })
  }

  return results
}
