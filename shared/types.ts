// ─── Enums ───────────────────────────────────────────────
export const SEVERITIES = ['Critical', 'Major', 'Minor', 'Trivial'] as const
export type Severity = (typeof SEVERITIES)[number]

export const PRIORITIES = ['P0', 'P1', 'P2', 'P3'] as const
export type Priority = (typeof PRIORITIES)[number]

export const STATUSES = ['Open', 'In Progress', 'Fixed', 'Verified', 'Closed', 'Rejected'] as const
export type DefectStatus = (typeof STATUSES)[number]

export const CATEGORIES = ['HW Design', 'SW Design', 'System Design', 'Interface', 'Safety', 'Other'] as const
export type Category = (typeof CATEGORIES)[number]

export const DETECTED_PHASES = ['Concept', 'Design', 'Implementation', 'Test', 'Production'] as const
export type DetectedPhase = (typeof DETECTED_PHASES)[number]

// ─── Defect Model ────────────────────────────────────────
export interface Defect {
  id: number
  title: string
  description: string
  severity: Severity
  priority: Priority
  status: DefectStatus
  category: Category
  detectedPhase: DetectedPhase
  vehicle: string
  product: string
  layer: string
  component: string
  reporterId: string
  reporterName: string
  assigneeId: string
  assigneeName: string
  rootCause: string
  correctiveAction: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

// ─── API Request/Response ────────────────────────────────
export interface DefectCreateInput {
  title: string
  description?: string
  severity?: Severity
  priority?: Priority
  status?: DefectStatus
  category?: Category
  detectedPhase?: DetectedPhase
  vehicle?: string
  product?: string
  layer?: string
  component?: string
  reporterId: string
  reporterName: string
  assigneeId?: string
  assigneeName?: string
  rootCause?: string
  correctiveAction?: string
}

export interface DefectUpdateInput extends Partial<DefectCreateInput> {}

export interface DefectListQuery {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
  severity?: Severity
  priority?: Priority
  status?: DefectStatus
  category?: Category
  detectedPhase?: DetectedPhase
  vehicle?: string
  product?: string
  assigneeId?: string
  reporterId?: string
  dateFrom?: string
  dateTo?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface DefectStats {
  total: number
  byStatus: Record<string, number>
  bySeverity: Record<string, number>
  byCategory: Record<string, number>
  byPhase: Record<string, number>
  byPriority: Record<string, number>
  recentTrend: { date: string; count: number }[]
}
