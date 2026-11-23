export interface DirectoryUser { id: string; full_name: string; nim: string; roles: string[] }
export interface Interest { id: string; name: string; is_active: boolean }

export interface AcademicPeriod {
  id: string; code: string; name: string; semester: string
  start_date: string; end_date: string
  group_open: boolean; topic_open: boolean; sempro_open: boolean; exam_open: boolean; is_active: boolean
}

export interface DocumentType {
  code: string; name: string; category: string; stage: string; scope: string
  description: string; accepted_mime: string; is_required: boolean; is_active: boolean; sort_order: number
}

export interface StageRequirement {
  stage: string; label: string; min_group_members: number; max_group_members: number
  min_sks: number; min_grade: string; min_guidance_logs: number; max_plagiarism_pct: number
  max_assignment_age_days: number; required_doc_codes: string[]; notes: string
}

export interface AssessmentRubricItem {
  id: string; stage: string; cpmk_code: string; ik_code: string; cpmk_title: string
  ik_description: string; weight: number; max_score: number; is_active: boolean; sort_order: number
}

export interface GroupMember {
  student_id: string; student_name: string; nim: string
  is_leader: boolean; responsibility: string; joined_at: string
}

export interface GroupAdvisorBrief {
  student_id: string; student_name: string; slot: number
  candidate_id: string | null; candidate_name: string
  supervisor_id: string | null; supervisor_name: string
  is_external_supervisor?: boolean
  external_supervisor_name?: string
  external_supervisor_institution?: string
  title_status: string; confirmation_status: string
}

export interface CapstoneGroup {
  id: string; code: string; academic_period_id: string; academic_period_name: string
  interest_id: string; interest_name: string; working_title: string; initial_description: string
  leader_id: string; leader_name: string; status: string
  project_id: string | null; project_title: string; project_status: string
  version: number; updated_at: string
  members: GroupMember[]; advisors: GroupAdvisorBrief[]
}

export interface Participant {
  student_id: string; student_name: string; nim: string; is_leader?: boolean; responsibility?: string; slot: number
  candidate_id: string | null; candidate_name: string; supervisor_id: string | null; supervisor_name: string
  is_external_supervisor?: boolean
  external_supervisor_name?: string
  external_supervisor_institution?: string
  title_status: string; confirmation_status: string; note: string
  title_actor: string | null; title_at: string | null; confirmation_actor: string | null; confirmation_at: string | null
}

export interface Project {
  id: string; group_id?: string | null; academic_period_id?: string | null; academic_period_name?: string
  owner_id: string; title: string; summary: string; interest_id: string; interest_name: string
  description_file_id: string | null; signed_description: boolean; status: string; revision_note: string
  topic_verify_status?: string; topic_verify_note?: string; topic_verified_at?: string | null
  assignment_letter_file_id?: string | null; assignment_letter_number?: string; assignment_letter_issued_at?: string | null
  version: number; finalized_at: string | null; updated_at: string; students: Participant[]
}

export interface MemberInput {
  student_id: string; is_leader?: boolean; responsibility?: string
  candidate_1: string | null; candidate_2: string | null
  is_external_supervisor?: boolean
  external_supervisor_name?: string
  external_supervisor_institution?: string
}

export interface ProjectInput {
  group_id?: string | null; academic_period_id?: string | null
  title: string; summary: string; interest_id: string
  description_file_id: string | null; signed_description: boolean
  members: MemberInput[]; version: number
}

export interface TopicSeminar {
  id: string; project_id: string; project_title: string; interest_name: string
  scheduled_at: string | null; location: string
  panelist_1_id: string | null; panelist_1_name: string
  panelist_2_id: string | null; panelist_2_name: string
  status: string; feasibility_notes: string; decision_note: string
  decided_at: string | null; version: number; updated_at: string
}

export interface Guidance {
  id: string; project_id: string; title: string; student_id: string; student_name: string
  supervisor_id: string; supervisor_name: string; meeting_date: string; topic: string
  progress: string; obstacles: string; next_plan: string; status: string; review_note: string
  reviewed_at: string | null; version: number
}

export interface Proposal {
  id: string; project_id: string; title: string; student_id: string; student_name: string; nim: string
  simak_file_id: string; approval_file_id: string; simak_status: string; approval_status: string
  simak_note: string; approval_note: string; simak_reviewed_at: string | null
  approval_reviewed_at: string | null; version: number; submitted_at: string; ready: boolean
  interest_id: string; interest_name: string; supervisor_1_name: string; supervisor_2_name: string
  guidance_approved_count?: number; supervisor_count?: number
  documents: import('./proposal').ProposalDocument[]
}

export type DocumentSeries = string

export interface DocumentVersion {
  id: string; document_id: string; version_no: number; file_id: string; file_name: string
  summary: string; uploaded_by: string; uploaded_by_name: string
  review_status: string; review_note: string; reviewer_name: string; reviewed_at: string | null; created_at: string
}

export interface ProjectDocument {
  id: string; project_id: string; project_title: string
  doc_type_code: string; doc_type_name: string; category: string; stage: string; scope: string
  student_id: string | null; student_name: string
  series: string; file_id: string; file_name: string
  uploaded_by: string; uploaded_by_name: string; summary: string; revision_no: number; status: string
  review_note: string; reviewer_name: string; reviewed_at: string | null; version: number; updated_at: string
  versions: DocumentVersion[]
}

export interface SemproReadiness {
  finalized: boolean; guidance_approved_count: number; proposal_ready: boolean
  b100_status: string; proposal_usulan_status?: string; advisor_approval_count?: number; ready: boolean
}

export interface SemproEvaluation {
  id: string; seminar_id: string; student_id: string; student_name: string; nim: string
  evaluator_id: string; evaluator_name: string; evaluator_role: string
  scores: Record<string, number>; total_score: number; grade_label: string
  recommendation: string; notes: string; version: number; updated_at: string
}

export interface StudentScoreBrief {
  student_id: string; student_name: string; nim: string
  examiner_count: number; supervisor_count: number; average_score: number; grade_label: string
}

export interface SemproAdvisorApproval {
  supervisor_id: string; supervisor_name: string; status: string; note: string; signed_at: string | null
}

export interface RevisionItem {
  id: string; stage: string; seminar_id: string; project_id: string; student_id: string | null
  examiner_id: string; examiner_name: string; note: string; student_response: string
  response_file_id: string | null; status: string; reviewer_note: string; reviewed_at: string | null
  version: number; updated_at: string
}

export interface ProposalSeminar {
  id: string; project_id: string; scheduled_at: string; location: string
  examiner_1_id: string; examiner_1_name: string; examiner_2_id: string; examiner_2_name: string; examiner_3_id: string; examiner_3_name: string
  status: string; outcome_note: string; revision_file_id: string | null; revision_note: string
  revision_submitted_at: string | null; minutes_file_id?: string | null; revision_approved_file_id?: string | null
  schedule_history?: Record<string, unknown>[]; decided_at: string | null; version: number
  evaluations: SemproEvaluation[]; student_summaries: StudentScoreBrief[]
  advisor_approvals?: SemproAdvisorApproval[]; revision_items?: RevisionItem[]
}

export interface SemproItem {
  project_id: string; title: string; interest_name: string; students: Participant[]
  readiness: SemproReadiness; seminar: ProposalSeminar | null
}

export interface FinalExamReadiness {
  sempro_passed: boolean; sempro_rev_approved: boolean; b_series_complete: boolean
  final_report_ready: boolean; plagiarism_ready: boolean; assignment_valid: boolean
  guidance_count: number; students_verified: number; total_students: number; ready: boolean
}

export interface FinalExamApplication {
  id: string; project_id: string; project_title: string; student_id: string; student_name: string; nim: string
  sks_completed: number; min_grade_ok: boolean
  transcript_file_id: string | null; spp_file_id: string | null; biodata_summary: string
  ijazah_file_id: string | null; photo_file_id: string | null; pa_letter_file_id: string | null
  plagiarism_pct: number; plagiarism_file_id: string | null
  advisor_1_approved: boolean; advisor_2_approved: boolean; advisor_note: string; advisor_approved_at: string | null
  tu_status: string; tu_note: string; tu_reviewed_at: string | null
  coordinator_status: string; coordinator_note: string; version: number; updated_at: string
}

export interface FinalExam {
  id: string; project_id: string; scheduled_at: string; location: string
  examiner_1_id: string; examiner_1_name: string; examiner_2_id: string; examiner_2_name: string; examiner_3_id: string; examiner_3_name: string
  status: string; outcome_note: string; minutes_file_id: string | null; revision_approved_file_id: string | null
  schedule_history: Record<string, unknown>[]; decided_at: string | null; version: number
  evaluations: SemproEvaluation[]; student_summaries: StudentScoreBrief[]; revision_items: RevisionItem[]
  attendance?: { lecturer_id: string; confirmed_at: string }[]
}

export interface FinalExamItem {
  project_id: string; title: string; interest_name: string; students: Participant[]
  readiness: FinalExamReadiness; applications: FinalExamApplication[]; exam: FinalExam | null
}

export interface ExpoSubmission {
  id: string; project_id: string; project_title: string; interest_name: string
  title: string; category: string; abstract_id: string; abstract_en: string
  poster_file_id: string | null; video_url: string; repo_url: string; demo_url: string
  journal_title: string; journal_class: string; journal_url: string
  publication_consent: boolean; status: string; review_note: string
  reviewed_at: string | null; published_at: string | null; version: number; updated_at: string
}

export interface KnowledgeSource {
  id: string; code: string; title: string; version_label: string; effective_date: string
  approval_proof: string; status: string; chunk_count: number; last_test_status: string
  activated_at: string | null; updated_at: string
}

export interface ChatCitation {
  source_title: string; version_label: string; section_title: string; page_ref: string; excerpt: string
}

export interface ChatMessage {
  id: string; session_id: string; role: 'USER' | 'ASSISTANT'; content: string
  status: string; citations: ChatCitation[]; created_at: string
}

export interface ChatSession {
  id: string; title: string; updated_at: string; messages: ChatMessage[]
}

export interface MonitoringReport {
  type: 'progress' | 'guidance' | 'outcomes'
  headers: string[]; rows: string[][]; empty: boolean
}

export const CPMK_RUBRIC = [
  { code: 'CPMK-1', title: 'Analisis Persoalan Kompleks', items: [
    { code: 'IK-1a', label: 'Analisis persoalan computing kompleks dan berisiko' },
    { code: 'IK-1b', label: 'Pemahaman prinsip computing (komputasi, komunikasi, desain)' },
    { code: 'IK-1c', label: 'Penerapan disiplin ilmu TI yang relevan' },
  ] },
  { code: 'CPMK-2', title: 'Desain, Implementasi, dan Evaluasi', items: [
    { code: 'IK-2a', label: 'Penerapan ilmu dan teknologi informasi pada studi kasus' },
    { code: 'IK-2b', label: 'Pemenuhan kebutuhan masyarakat melalui solusi TI' },
    { code: 'IK-2c', label: 'Proses desain sistem, pemodelan, kebutuhan, hingga evaluasi' },
  ] },
  { code: 'CPMK-3', title: 'Komunikasi Lisan dan Tulisan', items: [
    { code: 'IK-3a', label: 'Keterampilan komunikasi lisan aktif dan efektif' },
    { code: 'IK-3b', label: 'Penulisan dokumen sistematis dan sesuai tata bahasa' },
  ] },
  { code: 'CPMK-4', title: 'Tanggung Jawab, Legal, dan Etika', items: [
    { code: 'IK-4a', label: 'Pemahaman tanggung jawab profesional TI terhadap masyarakat' },
    { code: 'IK-4b', label: 'Pertimbangan aspek legal seperti hak cipta dan lisensi' },
    { code: 'IK-4c', label: 'Integritas dan etika akademik dalam penyelesaian proyek' },
  ] },
  { code: 'CPMK-5', title: 'Kerja Sama Tim', items: [
    { code: 'IK-5a', label: 'Kontribusi kerja sama tim sesuai peran dan tanggung jawab' },
    { code: 'IK-5b', label: 'Evaluasi dan efektivitas pelaksanaan kerja tim' },
  ] },
  { code: 'CPMK-6', title: 'Kebutuhan Pengguna dan Standar Teknologi', items: [
    { code: 'IK-6a', label: 'Identifikasi dan analisis kebutuhan pengguna secara tepat' },
    { code: 'IK-6b', label: 'Evaluasi dan pemilihan solusi atau standar teknologi tepat guna' },
    { code: 'IK-6c', label: 'Rancangan integrasi dan administrasi sistem yang aman' },
  ] },
] as const

export const labels: Record<string, string> = {
  DRAFT: 'Draf', SUBMITTED: 'Diajukan', REVISION: 'Perlu revisi', FINALIZED: 'Ditetapkan',
  PENDING: 'Menunggu', APPROVED: 'Disetujui', REJECTED: 'Ditolak', VALID: 'Valid',
  MISSING: 'Belum diunggah', SCHEDULED: 'Terjadwal', READY: 'Siap', LOCKED: 'Terkunci',
  REGISTERED: 'Terdaftar', LAYAK: 'Layak', REVISI: 'Perlu revisi', DITOLAK: 'Ditolak',
  OPEN: 'Terbuka', PASSED: 'Lulus', FAILED: 'Mengulang', PUBLISHED: 'Terbit',
  INDEXED: 'Terindeks', ACTIVE: 'Aktif', ARCHIVED: 'Diarsipkan',
  EXAMINER_1: 'Penguji 1', EXAMINER_2: 'Penguji 2', EXAMINER_3: 'Penguji 3', SUPERVISOR: 'Pembimbing',
  ANSWERED: 'Terjawab', INSUFFICIENT_CONTEXT: 'Konteks tidak memadai',
}
