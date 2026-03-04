import type { FastifyPluginAsync } from 'fastify'
import { getClient } from '../db/connection.js'
import { sendWebhook, computeNextRun, buildPreviewPayload } from '../webhook/sender.js'
import { getWebhookConfig, rowToConfig, reschedule } from '../webhook/scheduler.js'
import { SCHEDULE_PRESETS, type WebhookConfigInput, type WebhookPreviewInput } from '../../shared/types.js'

export const webhookRoutes: FastifyPluginAsync = async (app) => {

  // ─── GET config ──────────────────────────────────────────
  app.get('/webhook/config', async () => {
    const config = await getWebhookConfig()
    if (!config) {
      return {
        id: 0,
        url: '',
        platform: 'dingtalk',
        payloadFormat: 'full',
        schedule: 'disabled',
        filterSeverity: '',
        filterStatus: '',
        filterPriority: '',
        filterVehicle: '',
        filterProduct: '',
        dateRange: 'all',
        customKeywords: '',
        nextRunAt: null,
        createdAt: '',
        updatedAt: '',
      }
    }
    return config
  })

  // ─── PUT config (upsert) ────────────────────────────────
  app.put('/webhook/config', async (req) => {
    const body = req.body as WebhookConfigInput
    const now = new Date().toISOString()
    const cronExpr = SCHEDULE_PRESETS[body.schedule] || ''
    const nextRunAt = cronExpr ? computeNextRun(cronExpr) : null

    const client = getClient()
    await client.execute({
      sql: `INSERT OR REPLACE INTO webhook_config
            (id, url, platform, payload_format, schedule, filter_severity, filter_status, filter_priority, filter_vehicle, filter_product, date_range, custom_keywords, next_run_at, created_at, updated_at)
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM webhook_config WHERE id = 1), ?), ?)`,
      args: [
        body.url,
        body.platform || 'dingtalk',
        body.payloadFormat,
        body.schedule,
        body.filterSeverity || '',
        body.filterStatus || '',
        body.filterPriority || '',
        body.filterVehicle || '',
        body.filterProduct || '',
        body.dateRange || 'all',
        body.customKeywords || '',
        nextRunAt,
        now,
        now,
      ],
    })

    const config = await getWebhookConfig()
    if (config) reschedule(config)

    return config
  })

  // ─── POST preview payload ────────────────────────────────
  app.post('/webhook/preview', async (req) => {
    const body = (req.body || {}) as WebhookPreviewInput
    const configForPreview = {
      id: 0,
      url: '',
      platform: body.platform || 'dingtalk',
      payloadFormat: body.payloadFormat || 'full',
      schedule: 'disabled' as const,
      filterSeverity: body.filterSeverity ?? '',
      filterStatus: body.filterStatus ?? '',
      filterPriority: body.filterPriority ?? '',
      filterVehicle: body.filterVehicle ?? '',
      filterProduct: body.filterProduct ?? '',
      dateRange: (body.dateRange || 'all') as 'all' | 'last_24h' | 'last_7d' | 'last_30d',
      customKeywords: body.customKeywords ?? '',
      nextRunAt: null,
      createdAt: '',
      updatedAt: '',
    }
    const payload = await buildPreviewPayload(configForPreview)
    return payload
  })

  // ─── POST test (uses request body for live form values) ──
  app.post('/webhook/test', async (req, reply) => {
    const body = (req.body || {}) as Partial<WebhookConfigInput>
    // Use form body if provided, otherwise fall back to saved config
    const saved = await getWebhookConfig()
    const url = body.url || saved?.url
    if (!url) {
      return reply.code(400).send({ error: 'No webhook URL configured' })
    }
    const config: WebhookConfig = {
      id: saved?.id ?? 0,
      url,
      platform: (body.platform || saved?.platform || 'dingtalk') as any,
      payloadFormat: (body.payloadFormat || saved?.payloadFormat || 'full') as any,
      schedule: (body.schedule || saved?.schedule || 'disabled') as any,
      filterSeverity: body.filterSeverity ?? saved?.filterSeverity ?? '',
      filterStatus: body.filterStatus ?? saved?.filterStatus ?? '',
      filterPriority: body.filterPriority ?? saved?.filterPriority ?? '',
      filterVehicle: body.filterVehicle ?? saved?.filterVehicle ?? '',
      filterProduct: body.filterProduct ?? saved?.filterProduct ?? '',
      dateRange: (body.dateRange || saved?.dateRange || 'all') as any,
      customKeywords: body.customKeywords ?? saved?.customKeywords ?? '',
      nextRunAt: saved?.nextRunAt ?? null,
      createdAt: saved?.createdAt ?? '',
      updatedAt: saved?.updatedAt ?? '',
    }
    const result = await sendWebhook(config)
    return result
  })

  // ─── POST send-raw (send edited payload directly) ───────
  app.post('/webhook/send-raw', async (req, reply) => {
    const { url, payload } = req.body as { url?: string; payload?: unknown }
    if (!url) {
      return reply.code(400).send({ error: 'No webhook URL provided' })
    }
    if (!payload) {
      return reply.code(400).send({ error: 'No payload provided' })
    }

    const now = new Date().toISOString()
    let status: 'success' | 'error' = 'error'
    let httpStatus: number | null = null
    let responseSnippet = ''

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      })

      httpStatus = res.status
      const text = await res.text()
      responseSnippet = text.slice(0, 500)

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

    const client = getClient()
    const historyResult = await client.execute({
      sql: `INSERT INTO webhook_history (triggered_at, status, http_status, response_snippet, defect_count)
            VALUES (?, ?, ?, ?, ?)`,
      args: [now, status, httpStatus, responseSnippet, 0],
    })

    return {
      id: Number(historyResult.lastInsertRowid),
      triggeredAt: now,
      status,
      httpStatus,
      responseSnippet,
      defectCount: 0,
    }
  })

  // ─── GET history ─────────────────────────────────────────
  app.get('/webhook/history', async () => {
    const client = getClient()
    const result = await client.execute(
      'SELECT * FROM webhook_history ORDER BY id DESC LIMIT 20'
    )
    return result.rows.map(row => ({
      id: Number(row.id),
      triggeredAt: String(row.triggered_at ?? ''),
      status: String(row.status ?? ''),
      httpStatus: row.http_status != null ? Number(row.http_status) : null,
      responseSnippet: String(row.response_snippet ?? ''),
      defectCount: Number(row.defect_count ?? 0),
    }))
  })
}
