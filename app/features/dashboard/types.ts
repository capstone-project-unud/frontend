import type { AcademicPeriod, CapstoneGroup } from '~/features/capstone/types'

export type DashboardScope = 'student' | 'lecturer' | 'coordinator' | 'tu' | 'admin' | 'koprodi'
export interface DashboardStats {
  groups: number; groups_ready: number
  projects: number; draft: number; submitted: number; revision: number; finalized: number; students: number
  supervised_students: number; title_pending: number; confirmation_pending: number
  topic_seminars: number; topic_seminars_layak: number
  guidance: number; guidance_approved: number; guidance_pending: number; guidance_revision: number
  proposals: number; proposal_ready: number
  simak_pending: number; simak_valid: number; simak_revision: number
  approval_pending: number; approval_valid: number; approval_revision: number
  documents_uploaded: number; documents_pending: number; documents_approved: number; documents_revision: number
  sempro_scheduled: number; sempro_revision: number; sempro_approved: number; sempro_rejected: number
  final_exam_apps: number; final_exam_scheduled: number; final_exam_passed: number
  expo_submitted: number; expo_published: number
}
export interface DashboardProject { id: string; title: string; status: string; interest_name: string; updated_at: string }
export interface DashboardInterest { name: string; total: number; finalized: number }
export interface DashboardData {
  scope: DashboardScope
  stats: DashboardStats
  recent_projects: DashboardProject[]
  interest_summary: DashboardInterest[]
  student_group?: CapstoneGroup | null
  active_period?: AcademicPeriod | null
}
export interface DashboardMetric { label: string; value: number }
export interface DashboardTask { title: string; detail: string; to: string; action: string }
export interface ChartSegment { label: string; value: number; color: string }
export interface ChartBarRow { label: string; primary: number; secondary?: number }
