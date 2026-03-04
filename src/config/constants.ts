import { SEVERITIES, PRIORITIES, STATUSES, CATEGORIES, DETECTED_PHASES } from '../../shared/types'
export { SEVERITIES, PRIORITIES, STATUSES, CATEGORIES, DETECTED_PHASES }

export const VEHICLE_OPTIONS = [
  'Platform', 'GWM', 'GWM_DE09', 'GWM_EC15S', 'GWM_EC15G',
  'GWM_EC15SG', 'GWM_B26-A', 'GWM_B26-G'
]

export const PRODUCT_OPTIONS = [
  'EPS', 'IBC', 'IBC1.1',
  'IBC1.2', 'IBC2.0', 'EMB', 'ERC', 'MC01', 'HEM', 'EDC'
]

export const LAYER_OPTIONS = ['SYS', 'SW', 'HW', 'ME']

export const DEFAULT_COMPONENT_OPTIONS = [
  'CAN_Driver', 'LIN_Stack', 'Diag_Module', 'PWM_Controller',
  'Flash_Manager', 'OS_Task', 'Calibration', 'CDD_MotCtrl', 'PID_Control'
]

export const SEVERITY_COLORS: Record<string, string> = {
  Critical: '#f85149',
  Major: '#e3b341',
  Minor: '#58a6ff',
  Trivial: '#768390',
}

export const PRIORITY_COLORS: Record<string, string> = {
  P0: '#f85149',
  P1: '#e3b341',
  P2: '#58a6ff',
  P3: '#768390',
}

export const STATUS_COLORS: Record<string, string> = {
  Open: '#58a6ff',
  'In Progress': '#e3b341',
  Fixed: '#3fb950',
  Verified: '#a371f7',
  Closed: '#768390',
  Rejected: '#f85149',
}
