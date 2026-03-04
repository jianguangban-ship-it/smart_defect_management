export type { Defect, DefectCreateInput, DefectUpdateInput, DefectListQuery, PaginatedResponse, DefectStats } from '../../shared/types'
export type { WebhookConfig, WebhookConfigInput, WebhookPreviewInput, WebhookHistoryEntry, WebhookPlatform, PayloadFormat, SchedulePreset, DateRangePreset } from '../../shared/types'
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  type: ToastType
  message: string
  duration: number
}
