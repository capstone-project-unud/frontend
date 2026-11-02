export type Role = 'ADMIN' | 'MAHASISWA' | 'DOSEN' | 'KOPRODI'
export interface User {
  id: string
  full_name: string
  email: string
  roles: Role[]
  is_active: boolean
  nim: string | null
  admission_year: number | null
  nip: string | null
  nidn: string | null
  phone: string
  expertise: string
  study_program: string
  last_login_at: string | null
  created_at: string
  updated_at: string
}
export interface UserInput {
  full_name: string
  email: string
  roles: Role[]
  nim: string | null
  admission_year: number | null
  nip: string | null
  nidn: string | null
  phone: string
  expertise: string
  password?: string
  is_active?: boolean
}
export interface UserList { items: User[]; total: number; page: number; limit: number }
export interface UserStats { total: number; active: number; students: number; lecturers: number }
