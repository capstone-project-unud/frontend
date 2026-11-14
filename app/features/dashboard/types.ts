export type DashboardScope = 'student' | 'lecturer' | 'coordinator' | 'tu' | 'admin' | 'koprodi'
export interface DashboardStats {
 projects: number; draft: number; submitted: number; revision: number; finalized: number; students: number
 supervised_students: number; title_pending: number; confirmation_pending: number; guidance: number; guidance_pending: number
 proposals: number; proposal_ready: number; simak_pending: number; approval_pending: number
}
export interface DashboardProject { id: string; title: string; status: string; interest_name: string; updated_at: string }
export interface DashboardInterest { name: string; total: number; finalized: number }
export interface DashboardData { scope: DashboardScope; stats: DashboardStats; recent_projects: DashboardProject[]; interest_summary: DashboardInterest[] }
export interface DashboardMetric { label: string; value: number }
export interface DashboardTask { title: string; detail: string; to: string; action: string }
