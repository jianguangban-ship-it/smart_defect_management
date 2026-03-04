import type { Severity, Priority, DefectStatus, Category, DetectedPhase } from '../../shared/types'

export interface DefectFormState {
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
}

export type ViewType = 'defects' | 'dashboard' | 'settings'
