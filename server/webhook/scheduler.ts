import cron, { type ScheduledTask } from 'node-cron'
import { getClient } from '../db/connection.js'
import { sendWebhook, computeNextRun } from './sender.js'
import { SCHEDULE_PRESETS, type WebhookConfig, type SchedulePreset } from '../../shared/types.js'

let activeTask: ScheduledTask | null = null

function rowToConfig(row: Record<string, unknown>): WebhookConfig {
  return {
    id: Number(row.id),
    url: String(row.url ?? ''),
    platform: (row.platform as any) || 'dingtalk',
    payloadFormat: (row.payload_format as any) || 'full',
    schedule: (row.schedule as any) || 'disabled',
    filterSeverity: String(row.filter_severity ?? ''),
    filterStatus: String(row.filter_status ?? ''),
    filterPriority: String(row.filter_priority ?? ''),
    filterVehicle: String(row.filter_vehicle ?? ''),
    filterProduct: String(row.filter_product ?? ''),
    dateRange: (row.date_range as any) || 'all',
    customKeywords: String(row.custom_keywords ?? ''),
    nextRunAt: row.next_run_at ? String(row.next_run_at) : null,
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  }
}

export { rowToConfig }

export async function getWebhookConfig(): Promise<WebhookConfig | null> {
  const client = getClient()
  const result = await client.execute('SELECT * FROM webhook_config WHERE id = 1')
  if (result.rows.length === 0) return null
  return rowToConfig(result.rows[0])
}

export function reschedule(config: WebhookConfig) {
  if (activeTask) {
    activeTask.stop()
    activeTask = null
  }

  const cronExpr = SCHEDULE_PRESETS[config.schedule]
  if (!cronExpr || !config.url) return

  activeTask = cron.schedule(cronExpr, async () => {
    try {
      console.log('[webhook] Scheduled send triggered')
      const fresh = await getWebhookConfig()
      if (fresh && fresh.url) {
        await sendWebhook(fresh)
        // Update next_run_at
        const nextRun = computeNextRun(cronExpr)
        if (nextRun) {
          const client = getClient()
          await client.execute({
            sql: 'UPDATE webhook_config SET next_run_at = ? WHERE id = 1',
            args: [nextRun],
          })
        }
      }
    } catch (err) {
      console.error('[webhook] Scheduled send failed:', err)
    }
  })

  console.log(`[webhook] Scheduled with cron: ${cronExpr}`)
}

export async function initScheduler() {
  const config = await getWebhookConfig()
  if (config && config.schedule !== 'disabled' && config.url) {
    reschedule(config)
  }
  console.log('[webhook] Scheduler initialized')
}
