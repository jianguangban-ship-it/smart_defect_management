import { createClient } from '@libsql/client'
import { mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(__dirname, '..', '..', 'data')
try { mkdirSync(dataDir, { recursive: true }) } catch {}

const DB_PATH = resolve(dataDir, 'defects.db')
const client = createClient({ url: `file:${DB_PATH}` })

// Create table
await client.executeMultiple(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS defects (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT NOT NULL,
    description     TEXT DEFAULT '',
    severity        TEXT DEFAULT 'Minor',
    priority        TEXT DEFAULT 'P2',
    status          TEXT DEFAULT 'Open',
    category        TEXT DEFAULT 'Other',
    detected_phase  TEXT DEFAULT 'Design',
    vehicle         TEXT DEFAULT '',
    product         TEXT DEFAULT '',
    layer           TEXT DEFAULT '',
    component       TEXT DEFAULT '',
    reporter_id     TEXT NOT NULL,
    reporter_name   TEXT NOT NULL,
    assignee_id     TEXT DEFAULT '',
    assignee_name   TEXT DEFAULT '',
    root_cause      TEXT DEFAULT '',
    corrective_action TEXT DEFAULT '',
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL,
    deleted_at      TEXT
  );
`)

// Clear existing data
await client.execute('DELETE FROM defects')

const severities = ['Critical', 'Major', 'Minor', 'Trivial'] as const
const priorities = ['P0', 'P1', 'P2', 'P3'] as const
const statuses = ['Open', 'In Progress', 'Fixed', 'Verified', 'Closed', 'Rejected'] as const
const categories = ['HW Design', 'SW Design', 'System Design', 'Interface', 'Safety', 'Other'] as const
const phases = ['Concept', 'Design', 'Implementation', 'Test', 'Production'] as const
const vehicles = ['GWM_DE09', 'GWM_EC15S', 'GWM_B26-A', 'GWM_EC15G', 'Platform'] as const
const products = ['EPS', 'IBC', 'IBC1.1', 'IBC2.0', 'EMB', 'ERC', 'MC01'] as const
const layers = ['SYS', 'SW', 'HW', 'ME'] as const
const components = ['CAN_Driver', 'LIN_Stack', 'Diag_Module', 'PWM_Controller', 'Flash_Manager', 'OS_Task', 'PID_Control', 'CDD_MotCtrl', 'Calibration'] as const

interface Person { id: string; name: string }
const reporters: Person[] = [
  { id: 'GW00336650', name: '张伟 (Zhang Wei)' },
  { id: 'GW00322181', name: '吴亮亮 (Wu Liangliang)' },
  { id: 'GW00199494', name: '牛作硕 (Niu Zuoxiang)' },
  { id: 'GW00345678', name: '李明 (Li Ming)' },
  { id: 'GW00356789', name: '王芳 (Wang Fang)' },
]

const assignees: Person[] = [
  { id: 'GW00322181', name: '吴亮亮 (Wu Liangliang)' },
  { id: 'GW00199494', name: '牛作硕 (Niu Zuoxiang)' },
  { id: 'GW00345678', name: '李明 (Li Ming)' },
  { id: 'GW00356789', name: '王芳 (Wang Fang)' },
  { id: 'GW00367890', name: '赵刚 (Zhao Gang)' },
  { id: 'GW00378901', name: '陈静 (Chen Jing)' },
]

const seedDefects = [
  { title: 'CAN driver timeout on GWM_DE09 platform', description: 'CAN communication drops after 30 minutes of continuous operation. Timeout occurs in CAN_Driver module, causing DTC 0xC073 to be set.', severity: 'Critical', priority: 'P0', status: 'In Progress', category: 'SW Design', phase: 'Test', vehicle: 'GWM_DE09', product: 'IBC', layer: 'SW', component: 'CAN_Driver' },
  { title: 'EPS alarm threshold calibration mismatch', description: 'Motor temperature alarm triggers at 85°C instead of configured 95°C. Calibration parameter CW_TempAlarm_Threshold not properly loaded after ECU reset.', severity: 'Major', priority: 'P1', status: 'Open', category: 'HW Design', phase: 'Test', vehicle: 'GWM_EC15S', product: 'EPS', layer: 'HW', component: 'Calibration' },
  { title: 'LIN stack frame collision in diagnostic mode', description: 'When entering UDS diagnostic session (0x02), LIN schedule table conflicts with normal communication frames.', severity: 'Major', priority: 'P1', status: 'Fixed', category: 'Interface', phase: 'Implementation', vehicle: 'GWM_B26-A', product: 'IBC1.1', layer: 'SW', component: 'LIN_Stack' },
  { title: 'PWM duty cycle overflow on motor control', description: 'At high RPM conditions (>6000 RPM), PWM duty cycle calculation exceeds 100% causing motor controller shutdown.', severity: 'Critical', priority: 'P0', status: 'Open', category: 'SW Design', phase: 'Test', vehicle: 'GWM_DE09', product: 'EMB', layer: 'SW', component: 'PWM_Controller' },
  { title: 'Flash memory sector erase incomplete during OTA', description: 'During OTA update, flash sector erase operation returns success but data verification fails. Occurs intermittently (~2% failure rate).', severity: 'Major', priority: 'P1', status: 'In Progress', category: 'SW Design', phase: 'Test', vehicle: 'Platform', product: 'IBC2.0', layer: 'SW', component: 'Flash_Manager' },
  { title: 'OS task priority inversion in safety-critical path', description: 'Priority inversion detected between Motor_Control_Task (P=10) and Communication_Task (P=5) when accessing shared CAN buffer. Violates ASIL-D timing requirement.', severity: 'Critical', priority: 'P0', status: 'Open', category: 'Safety', phase: 'Design', vehicle: 'GWM_EC15G', product: 'EPS', layer: 'SW', component: 'OS_Task' },
  { title: 'Diagnostic module NRC handling incorrect for service 0x27', description: 'SecurityAccess service returns NRC 0x35 (invalidKey) instead of NRC 0x36 (exceededNumberOfAttempts) after 3 failed attempts.', severity: 'Minor', priority: 'P2', status: 'Fixed', category: 'SW Design', phase: 'Test', vehicle: 'GWM_DE09', product: 'IBC', layer: 'SW', component: 'Diag_Module' },
  { title: 'PID controller oscillation at low speed range', description: 'Current control PID shows oscillation when motor speed < 100 RPM. Kp gain needs retuning for low-speed operating point.', severity: 'Minor', priority: 'P2', status: 'Open', category: 'SW Design', phase: 'Test', vehicle: 'GWM_EC15S', product: 'EPS', layer: 'SW', component: 'PID_Control' },
  { title: 'CDD motor control phase alignment error', description: 'Phase alignment calibration drifts after temperature cycling test (-40°C to 125°C). Maximum phase error exceeds ±5° specification.', severity: 'Major', priority: 'P1', status: 'Verified', category: 'HW Design', phase: 'Test', vehicle: 'GWM_B26-A', product: 'EMB', layer: 'HW', component: 'CDD_MotCtrl' },
  { title: 'System-level voltage monitoring range mismatch', description: 'Battery voltage monitoring reports 0V for voltages below 6V instead of actual value. ADC conversion range needs adjustment.', severity: 'Major', priority: 'P1', status: 'Open', category: 'System Design', phase: 'Design', vehicle: 'Platform', product: 'IBC', layer: 'SYS', component: 'Calibration' },
  { title: 'CAN bus-off recovery time exceeds specification', description: 'Bus-off recovery takes 800ms instead of specified 500ms maximum. ISO 11898 compliance issue.', severity: 'Minor', priority: 'P2', status: 'Closed', category: 'Interface', phase: 'Test', vehicle: 'GWM_DE09', product: 'IBC1.1', layer: 'SW', component: 'CAN_Driver' },
  { title: 'ERC module current sensing noise immunity', description: 'Current measurement fluctuates ±5A in high EMI environment. Requires hardware filter redesign.', severity: 'Major', priority: 'P1', status: 'Open', category: 'HW Design', phase: 'Test', vehicle: 'GWM_EC15G', product: 'ERC', layer: 'HW', component: 'CDD_MotCtrl' },
  { title: 'Memory leak in diagnostic session handling', description: 'Heap memory increases by ~64 bytes per diagnostic session open/close cycle. After 1000 cycles, available heap drops below safety threshold.', severity: 'Major', priority: 'P1', status: 'In Progress', category: 'SW Design', phase: 'Test', vehicle: 'Platform', product: 'IBC', layer: 'SW', component: 'Diag_Module' },
  { title: 'MC01 motor phase current imbalance', description: 'Phase C current is consistently 3% lower than phases A and B. Gate driver timing mismatch suspected.', severity: 'Minor', priority: 'P2', status: 'Open', category: 'HW Design', phase: 'Test', vehicle: 'GWM_DE09', product: 'MC01', layer: 'HW', component: 'CDD_MotCtrl' },
  { title: 'Safety watchdog timeout too aggressive', description: 'Alive counter check in safety monitor triggers false watchdog reset during heavy CAN bus load. Window needs widening from 5ms to 10ms.', severity: 'Major', priority: 'P0', status: 'Fixed', category: 'Safety', phase: 'Test', vehicle: 'GWM_EC15S', product: 'EPS', layer: 'SW', component: 'OS_Task' },
  { title: 'Flash write protection not activated after update', description: 'After successful firmware update, flash write protection is not re-enabled, leaving ECU vulnerable to unintended writes.', severity: 'Critical', priority: 'P0', status: 'Open', category: 'Safety', phase: 'Implementation', vehicle: 'Platform', product: 'IBC2.0', layer: 'SW', component: 'Flash_Manager' },
  { title: 'LIN slave NAD assignment conflict', description: 'Two LIN slaves respond to same NAD (0x01) causing bus arbitration issues. Configuration table needs update.', severity: 'Minor', priority: 'P3', status: 'Open', category: 'Interface', phase: 'Design', vehicle: 'GWM_B26-A', product: 'IBC', layer: 'SW', component: 'LIN_Stack' },
  { title: 'Calibration data checksum algorithm mismatch', description: 'CRC32 implementation in bootloader uses different polynomial than application. Causes valid calibration data to be rejected.', severity: 'Major', priority: 'P1', status: 'In Progress', category: 'SW Design', phase: 'Implementation', vehicle: 'GWM_DE09', product: 'EMB', layer: 'SW', component: 'Calibration' },
  { title: 'IBC brake torque request resolution insufficient', description: 'Brake torque request has 0.5 Nm resolution but vehicle dynamics controller requires 0.1 Nm. Interface specification update needed.', severity: 'Minor', priority: 'P2', status: 'Rejected', category: 'System Design', phase: 'Concept', vehicle: 'GWM_EC15G', product: 'IBC', layer: 'SYS', component: 'CDD_MotCtrl' },
  { title: 'PWM frequency jitter on EMB actuator', description: 'PWM output frequency shows ±50 Hz jitter at 20kHz target. Timer prescaler configuration needs optimization.', severity: 'Trivial', priority: 'P3', status: 'Open', category: 'SW Design', phase: 'Test', vehicle: 'GWM_EC15S', product: 'EMB', layer: 'SW', component: 'PWM_Controller' },
  { title: 'NVM block management fragmentation', description: 'After 10000 write cycles, NVM block management shows fragmentation reducing available space by 15%. Garbage collection needed.', severity: 'Minor', priority: 'P2', status: 'Open', category: 'SW Design', phase: 'Production', vehicle: 'Platform', product: 'IBC', layer: 'SW', component: 'Flash_Manager' },
  { title: 'AUTOSAR RTE port interface version mismatch', description: 'SWC MotorControl uses RTE port interface v2.1 but generated RTE expects v2.0. Compilation fails after AUTOSAR configuration change.', severity: 'Trivial', priority: 'P3', status: 'Fixed', category: 'SW Design', phase: 'Implementation', vehicle: 'GWM_DE09', product: 'EPS', layer: 'SW', component: 'OS_Task' },
  { title: 'Connector pin assignment error on debug port', description: 'Hardware debug connector pins 3 and 4 are swapped compared to specification. Requires PCB revision.', severity: 'Minor', priority: 'P2', status: 'Open', category: 'HW Design', phase: 'Design', vehicle: 'GWM_B26-A', product: 'MC01', layer: 'HW', component: 'CDD_MotCtrl' },
  { title: 'EMB clamp force calculation overflow at -40°C', description: 'Integer overflow in clamp force calculation at extreme cold temperatures due to negative offset compensation. Requires int32 to int64 upgrade.', severity: 'Critical', priority: 'P0', status: 'In Progress', category: 'Safety', phase: 'Test', vehicle: 'GWM_EC15G', product: 'EMB', layer: 'SW', component: 'PID_Control' },
  { title: 'DTC snapshot data recording incomplete', description: 'Extended data record for DTC 0xD001 missing vehicle speed and engine RPM. UDS ReadDTCInformation returns empty snapshot.', severity: 'Minor', priority: 'P2', status: 'Open', category: 'SW Design', phase: 'Test', vehicle: 'GWM_DE09', product: 'IBC1.1', layer: 'SW', component: 'Diag_Module' },
]

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(daysBack: number): string {
  const d = new Date()
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack))
  d.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60))
  return d.toISOString()
}

for (const [i, def] of seedDefects.entries()) {
  const reporter = randomItem(reporters)
  const assignee = randomItem(assignees)
  const createdAt = randomDate(60)
  const updatedAt = new Date(new Date(createdAt).getTime() + Math.random() * 7 * 86400000).toISOString()

  await client.execute({
    sql: `INSERT INTO defects (title, description, severity, priority, status, category, detected_phase, vehicle, product, layer, component, reporter_id, reporter_name, assignee_id, assignee_name, root_cause, corrective_action, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', '', ?, ?)`,
    args: [
      def.title, def.description, def.severity, def.priority, def.status,
      def.category, def.phase, def.vehicle, def.product, def.layer, def.component,
      reporter.id, reporter.name, assignee.id, assignee.name,
      createdAt, updatedAt,
    ],
  })
}

console.log(`Seeded ${seedDefects.length} defects into ${DB_PATH}`)
process.exit(0)
