import { getClient } from '../db/connection.js'
import type { WebhookConfig, WebhookHistoryEntry } from '../../shared/types.js'

const rowToDefect = (row: Record<string, unknown>) => ({
  id: Number(row.id),
  title: String(row.title ?? ''),
  description: String(row.description ?? ''),
  severity: String(row.severity ?? ''),
  priority: String(row.priority ?? ''),
  status: String(row.status ?? ''),
  category: String(row.category ?? ''),
  detectedPhase: String(row.detected_phase ?? ''),
  vehicle: String(row.vehicle ?? ''),
  product: String(row.product ?? ''),
  layer: String(row.layer ?? ''),
  component: String(row.component ?? ''),
  reporterId: String(row.reporter_id ?? ''),
  reporterName: String(row.reporter_name ?? ''),
  assigneeId: String(row.assignee_id ?? ''),
  assigneeName: String(row.assignee_name ?? ''),
  rootCause: String(row.root_cause ?? ''),
  correctiveAction: String(row.corrective_action ?? ''),
  createdAt: String(row.created_at ?? ''),
  updatedAt: String(row.updated_at ?? ''),
})

function buildFilteredQuery(config: WebhookConfig) {
  const conditions: string[] = ['deleted_at IS NULL']
  const params: unknown[] = []

  const addInClause = (col: string, csv: string) => {
    const values = csv.split(',').map(v => v.trim()).filter(Boolean)
    if (values.length === 0) return
    conditions.push(`${col} IN (${values.map(() => '?').join(',')})`)
    params.push(...values)
  }

  if (config.filterSeverity) addInClause('severity', config.filterSeverity)
  if (config.filterStatus) addInClause('status', config.filterStatus)
  if (config.filterPriority) addInClause('priority', config.filterPriority)
  if (config.filterVehicle) addInClause('vehicle', config.filterVehicle)
  if (config.filterProduct) addInClause('product', config.filterProduct)

  if (config.dateRange && config.dateRange !== 'all') {
    const now = new Date()
    let since: Date
    switch (config.dateRange) {
      case 'last_24h': since = new Date(now.getTime() - 24 * 60 * 60 * 1000); break
      case 'last_7d':  since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break
      case 'last_30d': since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break
      default: since = new Date(0)
    }
    conditions.push('created_at >= ?')
    params.push(since.toISOString())
  }

  return { where: conditions.join(' AND '), params }
}

function buildInternalPayload(defects: ReturnType<typeof rowToDefect>[], format: string, customKeywords: string) {
  if (format === 'summary') {
    const bySeverity: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    for (const d of defects) {
      bySeverity[d.severity] = (bySeverity[d.severity] || 0) + 1
      byStatus[d.status] = (byStatus[d.status] || 0) + 1
    }
    return {
      keywords: customKeywords || undefined,
      type: 'summary',
      generatedAt: new Date().toISOString(),
      total: defects.length,
      bySeverity,
      byStatus,
      topItems: defects.slice(0, 10).map(d => ({
        id: d.id, title: d.title, severity: d.severity, status: d.status, priority: d.priority,
      })),
    }
  }
  return { keywords: customKeywords || undefined, type: 'full', generatedAt: new Date().toISOString(), total: defects.length, defects }
}

const SEVERITY_ICON: Record<string, string> = {
  Critical: '🔴', Major: '🟠', Minor: '🟡', Trivial: '⚪',
}

function buildDingTalkMarkdown(defects: ReturnType<typeof rowToDefect>[], format: string, customKeywords: string) {
  const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
  const lines: string[] = []

  // Title
  lines.push('# 📋 Smart Defect Management Report')
  lines.push('')

  // Keywords
  if (customKeywords) {
    lines.push(`**Keywords:** ${customKeywords}`)
    lines.push('')
  }

  lines.push(`**Generated:** ${now}`)
  lines.push(`**Total Defects:** ${defects.length}`)
  lines.push('')

  if (format === 'summary') {
    // Summary by severity
    const bySeverity: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    for (const d of defects) {
      bySeverity[d.severity] = (bySeverity[d.severity] || 0) + 1
      byStatus[d.status] = (byStatus[d.status] || 0) + 1
    }

    lines.push('### By Severity')
    for (const [sev, count] of Object.entries(bySeverity)) {
      lines.push(`- ${SEVERITY_ICON[sev] || '⚪'} ${sev}: **${count}**`)
    }
    lines.push('')

    lines.push('### By Status')
    for (const [st, count] of Object.entries(byStatus)) {
      lines.push(`- ${st}: **${count}**`)
    }
    lines.push('')

    // Top items
    const topItems = defects.slice(0, 10)
    if (topItems.length > 0) {
      lines.push('### Top Items')
      for (const d of topItems) {
        lines.push(`- ${SEVERITY_ICON[d.severity] || '⚪'} **[${d.id}]** ${d.title} (${d.priority} / ${d.status})`)
      }
    }
  } else {
    // Full format - list all defects
    lines.push('### Defect List')
    lines.push('')
    for (const d of defects) {
      lines.push(`- ${SEVERITY_ICON[d.severity] || '⚪'} **[${d.id}]** ${d.title}`)
      lines.push(`  - Severity: ${d.severity} | Priority: ${d.priority} | Status: ${d.status}`)
      lines.push(`  - Vehicle: ${d.vehicle || '-'} | Product: ${d.product || '-'}`)
      if (d.assigneeName) lines.push(`  - Assignee: ${d.assigneeName}`)
      lines.push('')
    }
  }

  const text = lines.join('\n')
  // DingTalk robot keyword security checks both title and text fields
  // Put keywords directly in title to ensure keyword match
  const title = customKeywords
    ? `${customKeywords} Defect Report`
    : 'Smart Defect Management Report'

  return {
    msgtype: 'markdown',
    markdown: { title, text },
  }
}

function buildPayload(defects: ReturnType<typeof rowToDefect>[], format: string, customKeywords: string, platform: string) {
  if (platform === 'dingtalk') {
    return buildDingTalkMarkdown(defects, format, customKeywords)
  }
  return buildInternalPayload(defects, format, customKeywords)
}

export async function buildPreviewPayload(config: WebhookConfig) {
  const client = getClient()
  const { where, params } = buildFilteredQuery(config)
  const result = await client.execute({
    sql: `SELECT * FROM defects WHERE ${where} ORDER BY id DESC`,
    args: params as any,
  })
  const defects = result.rows.map(rowToDefect)
  return buildPayload(defects, config.payloadFormat, config.customKeywords, config.platform || 'dingtalk')
}

export async function sendWebhook(config: WebhookConfig): Promise<WebhookHistoryEntry> {
  const client = getClient()
  const { where, params } = buildFilteredQuery(config)
  const now = new Date().toISOString()

  let status: 'success' | 'error' = 'error'
  let httpStatus: number | null = null
  let responseSnippet = ''
  let defectCount = 0

  try {
    const result = await client.execute({
      sql: `SELECT * FROM defects WHERE ${where} ORDER BY id DESC`,
      args: params as any,
    })
    const defects = result.rows.map(rowToDefect)
    defectCount = defects.length

    const payload = buildPayload(defects, config.payloadFormat, config.customKeywords, config.platform || 'dingtalk')

    const res = await fetch(config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    })

    httpStatus = res.status
    const text = await res.text()
    responseSnippet = text.slice(0, 500)
    // DingTalk returns HTTP 200 even on errors — check errcode in response body
    if (!res.ok) {
      status = 'error'
    } else {
      try {
        const json = JSON.parse(text)
        status = (json.errcode === 0 || json.errcode === undefined) ? 'success' : 'error'
      } catch {
        status = 'success'
      }
    }
  } catch (err: any) {
    responseSnippet = (err.message || 'Unknown error').slice(0, 500)
  }

  const historyResult = await client.execute({
    sql: `INSERT INTO webhook_history (triggered_at, status, http_status, response_snippet, defect_count)
          VALUES (?, ?, ?, ?, ?)`,
    args: [now, status, httpStatus, responseSnippet, defectCount],
  })

  return {
    id: Number(historyResult.lastInsertRowid),
    triggeredAt: now,
    status,
    httpStatus,
    responseSnippet,
    defectCount,
  }
}

export function computeNextRun(cronExpr: string): string | null {
  if (!cronExpr) return null
  // Parse simple cron patterns to compute next run
  const parts = cronExpr.split(' ')
  if (parts.length !== 5) return null

  const [min, hour, , , dow] = parts
  const now = new Date()
  const next = new Date(now)
  next.setSeconds(0, 0)

  const targetMin = min === '*' ? now.getMinutes() : parseInt(min, 10)
  const targetHour = hour === '*' ? -1 : hour.startsWith('*/') ? -1 : parseInt(hour, 10)
  const hourStep = hour.startsWith('*/') ? parseInt(hour.slice(2), 10) : 0

  if (hourStep > 0) {
    // e.g. "0 */6 * * *"
    next.setMinutes(targetMin)
    let h = now.getHours()
    const remainder = h % hourStep
    h = h - remainder + hourStep
    if (h === now.getHours() && now.getMinutes() >= targetMin) h += hourStep
    if (h >= 24) { next.setDate(next.getDate() + 1); h = h % 24 }
    next.setHours(h)
  } else if (hour === '*') {
    // e.g. "0 * * * *"
    next.setMinutes(targetMin)
    if (now.getMinutes() >= targetMin) next.setHours(next.getHours() + 1)
  } else if (dow !== '*') {
    // weekly: e.g. "0 9 * * 1"
    const targetDow = parseInt(dow, 10)
    next.setHours(targetHour, targetMin)
    let daysAhead = (targetDow - now.getDay() + 7) % 7
    if (daysAhead === 0 && next <= now) daysAhead = 7
    next.setDate(next.getDate() + daysAhead)
  } else {
    // daily: e.g. "0 9 * * *"
    next.setHours(targetHour, targetMin)
    if (next <= now) next.setDate(next.getDate() + 1)
  }

  return next.toISOString()
}
