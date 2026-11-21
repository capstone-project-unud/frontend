export type ShowcaseCategory = 'SOFTWARE' | 'HARDWARE' | 'ALGORITMA' | 'DOKUMEN_STRATEGIS'

export interface ShowcaseMember {
  name: string
  nim: string
  is_leader: boolean
  responsibility: string
}

export interface ShowcaseMetricItem {
  label: string
  value: string
  score_pct: number
}

export interface ShowcasePosterContent {
  problem_summary: string
  architecture_nodes: string[]
  architecture_summary: string
  test_highlights: ShowcaseMetricItem[]
  conclusion: string
}

export interface ShowcaseWork {
  id: string
  project_id: string
  group_code: string
  academic_period_name: string
  title: string
  category: ShowcaseCategory
  category_label: string
  interest_name: string
  abstract_id: string
  abstract_en: string
  supervisors: [string, string]
  members: ShowcaseMember[]
  poster: ShowcasePosterContent
  video_url: string
  repo_url: string
  demo_url: string
  journal_title: string
  journal_class: string
  published_at: string
  is_mock_preview: boolean
}
