export interface DirectoryUser { id: string; full_name: string; nim: string; roles: string[] }
export interface Interest { id: string; name: string; is_active: boolean }
export interface Participant {
 student_id: string; student_name: string; nim: string; slot: number
 candidate_id: string | null; candidate_name: string; supervisor_id: string | null; supervisor_name: string
 title_status: string; confirmation_status: string; note: string
 title_actor: string | null; title_at: string | null; confirmation_actor: string | null; confirmation_at: string | null
}
export interface Project {
 id: string; owner_id: string; title: string; summary: string; interest_id: string; interest_name: string
 description_file_id: string | null; signed_description: boolean; status: string; revision_note: string
 version: number; finalized_at: string | null; updated_at: string; students: Participant[]
}
export interface MemberInput { student_id: string; candidate_1: string | null; candidate_2: string | null }
export interface ProjectInput { title: string; summary: string; interest_id: string; description_file_id: string | null; signed_description: boolean; members: MemberInput[]; version: number }
export interface Guidance {
 id: string; project_id: string; title: string; student_id: string; student_name: string; supervisor_id: string; supervisor_name: string
 meeting_date: string; topic: string; progress: string; obstacles: string; next_plan: string; status: string; review_note: string; reviewed_at: string | null; version: number
}
export interface Proposal {
 id: string; project_id: string; title: string; student_id: string; student_name: string; nim: string
 simak_file_id: string; approval_file_id: string; simak_status: string; approval_status: string; simak_note: string; approval_note: string
 simak_reviewed_at: string | null; approval_reviewed_at: string | null; version: number; submitted_at: string; ready: boolean
}
export const labels: Record<string, string> = { DRAFT: 'Draf', SUBMITTED: 'Diajukan', REVISION: 'Perlu revisi', FINALIZED: 'Ditetapkan', PENDING: 'Menunggu', APPROVED: 'Disetujui', REJECTED: 'Ditolak', VALID: 'Valid' }
