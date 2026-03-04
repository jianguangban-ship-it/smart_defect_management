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

// ─── Webhook Types ──────────────────────────────────────
export type WebhookPlatform = 'dingtalk' | 'wecom' | 'feishu' | 'custom'
export type PayloadFormat = 'full' | 'summary'
export type SchedulePreset = 'disabled' | 'every_hour' | 'every_6h' | 'daily_9' | 'weekly_mon_9'
export type DateRangePreset = 'last_24h' | 'last_7d' | 'last_30d' | 'all'

export const SCHEDULE_PRESETS: Record<SchedulePreset, string> = {
  disabled: '',
  every_hour: '0 * * * *',
  every_6h: '0 */6 * * *',
  daily_9: '0 9 * * *',
  weekly_mon_9: '0 9 * * 1',
}

export interface WebhookConfig {
  id: number
  url: string
  platform: WebhookPlatform
  payloadFormat: PayloadFormat
  schedule: SchedulePreset
  filterSeverity: string
  filterStatus: string
  filterPriority: string
  filterVehicle: string
  filterProduct: string
  dateRange: DateRangePreset
  customKeywords: string
  nextRunAt: string | null
  createdAt: string
  updatedAt: string
}

export interface WebhookConfigInput {
  url: string
  platform: WebhookPlatform
  payloadFormat: PayloadFormat
  schedule: SchedulePreset
  filterSeverity?: string
  filterStatus?: string
  filterPriority?: string
  filterVehicle?: string
  filterProduct?: string
  dateRange?: DateRangePreset
  customKeywords?: string
}

export interface WebhookPreviewInput {
  platform?: WebhookPlatform
  payloadFormat?: PayloadFormat
  filterSeverity?: string
  filterStatus?: string
  filterPriority?: string
  filterVehicle?: string
  filterProduct?: string
  dateRange?: DateRangePreset
  customKeywords?: string
}

export interface WebhookHistoryEntry {
  id: number
  triggeredAt: string
  status: 'success' | 'error'
  httpStatus: number | null
  responseSnippet: string
  defectCount: number
}
