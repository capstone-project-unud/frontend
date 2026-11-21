export const proposalDocuments = [
 { kind: 'simak', label: 'Screenshot SIMAK berstatus diterima', accept: '.pdf,.png,.jpg,.jpeg' },
 { kind: 'approval', label: 'Surat persetujuan pembimbing', accept: '.pdf' },
 { kind: 'english', label: 'Sertifikat kemampuan bahasa Inggris', accept: '.pdf,.png,.jpg,.jpeg' },
 { kind: 'proposal', label: 'Proposal', accept: '.pdf' },
 { kind: 'b100', label: 'Dokumen B100', accept: '.pdf' },
 { kind: 'b200', label: 'Dokumen B200', accept: '.pdf' },
] as const
export type ProposalKind = typeof proposalDocuments[number]['kind']
export interface ProposalDocument { kind: ProposalKind; file_id: string; status: string; note: string; reviewer: string | null; reviewed_at: string | null }
export const panelLabels: Record<string, string> = { SUPERVISOR_1: 'Pembimbing 1', SUPERVISOR_2: 'Pembimbing 2', EXAMINER_1: 'Penguji 1', EXAMINER_2: 'Penguji 2', EXAMINER_3: 'Penguji 3' }
export interface ProposalPolicy { name: string; indicator_weights: Record<string, number>; panel_weights: Record<string, number>; letter_bands: { minimum: number; letter: string }[] }
export interface PublishedPolicy { id: string; name: string; rules: ProposalPolicy; created_at: string }
export interface ExamEvaluation { evaluator_id: string; scores: Record<string, number>; total: number; recommendation: string; notes: string; version: number; updated_at: string }
export interface ProposalExam {
 id: string; application_id: string; project_id: string; student_id: string; student_name: string; nim: string; title: string
 scheduled_at: string; location: string; version: number; panel: { id: string; name: string; role: string }[]
 policy_id: string | null; policy: ProposalPolicy | null; evaluations: ExamEvaluation[]
 attendance: { lecturer_id: string; confirmed_at: string }[]; final_score: number | null; letter: string; category: string; outcome: string
}
