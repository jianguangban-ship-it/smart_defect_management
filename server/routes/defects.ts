import type { FastifyPluginAsync } from 'fastify'
import { eq, like, and, isNull, sql, desc, asc, or } from 'drizzle-orm'
import { getDb, getClient } from '../db/connection.js'
import { defects } from '../db/schema.js'
import type { DefectCreateInput, DefectUpdateInput } from '../../shared/types.js'

export const defectRoutes: FastifyPluginAsync = async (app) => {

  // ─── LIST (paginated, filtered, sorted) ────────────────
  app.get('/defects', async (req, reply) => {
    const q = req.query as Record<string, string | undefined>
    const page = Math.max(1, parseInt(q.page || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(q.limit || '20', 10)))
    const offset = (page - 1) * limit
    const sortField = q.sort || 'id'
    const sortOrder = q.order === 'asc' ? 'ASC' : 'DESC'

    // Build WHERE conditions
    const conditions: string[] = ['deleted_at IS NULL']
    const params: unknown[] = []

    if (q.search) {
      conditions.push('(title LIKE ? OR description LIKE ? OR component LIKE ?)')
      const s = `%${q.search}%`
      params.push(s, s, s)
    }
    if (q.severity) { conditions.push('severity = ?'); params.push(q.severity) }
    if (q.priority) { conditions.push('priority = ?'); params.push(q.priority) }
    if (q.status) { conditions.push('status = ?'); params.push(q.status) }
    if (q.category) { conditions.push('category = ?'); params.push(q.category) }
    if (q.detectedPhase) { conditions.push('detected_phase = ?'); params.push(q.detectedPhase) }
    if (q.vehicle) { conditions.push('vehicle = ?'); params.push(q.vehicle) }
    if (q.product) { conditions.push('product = ?'); params.push(q.product) }
    if (q.assigneeId) { conditions.push('assignee_id = ?'); params.push(q.assigneeId) }
    if (q.reporterId) { conditions.push('reporter_id = ?'); params.push(q.reporterId) }
    if (q.dateFrom) { conditions.push('created_at >= ?'); params.push(q.dateFrom) }
    if (q.dateTo) { conditions.push('created_at <= ?'); params.push(q.dateTo) }

    const where = conditions.join(' AND ')

    // Map sortField to column name
    const columnMap: Record<string, string> = {
      id: 'id', title: 'title', severity: 'severity', priority: 'priority',
      status: 'status', category: 'category', detectedPhase: 'detected_phase',
      createdAt: 'created_at', updatedAt: 'updated_at',
      assigneeName: 'assignee_name', reporterName: 'reporter_name',
    }
    const col = columnMap[sortField] || 'id'

    const client = getClient()

    const countResult = await client.execute({
      sql: `SELECT count(*) as total FROM defects WHERE ${where}`,
      args: params as any,
    })
    const total = Number(countResult.rows[0].total)

    const dataResult = await client.execute({
      sql: `SELECT * FROM defects WHERE ${where} ORDER BY ${col} ${sortOrder} LIMIT ? OFFSET ?`,
      args: [...params, limit, offset] as any,
    })

    const data = dataResult.rows.map(rowToDefect)

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  })

  // ─── STATS ─────────────────────────────────────────────
  app.get('/defects/stats', async () => {
    const client = getClient()

    const [totalR, statusR, severityR, categoryR, phaseR, priorityR, trendR] = await Promise.all([
      client.execute('SELECT count(*) as total FROM defects WHERE deleted_at IS NULL'),
      client.execute('SELECT status, count(*) as cnt FROM defects WHERE deleted_at IS NULL GROUP BY status'),
      client.execute('SELECT severity, count(*) as cnt FROM defects WHERE deleted_at IS NULL GROUP BY severity'),
      client.execute('SELECT category, count(*) as cnt FROM defects WHERE deleted_at IS NULL GROUP BY category'),
      client.execute('SELECT detected_phase, count(*) as cnt FROM defects WHERE deleted_at IS NULL GROUP BY detected_phase'),
      client.execute('SELECT priority, count(*) as cnt FROM defects WHERE deleted_at IS NULL GROUP BY priority'),
      client.execute("SELECT date(created_at) as date, count(*) as count FROM defects WHERE deleted_at IS NULL GROUP BY date(created_at) ORDER BY date DESC LIMIT 30"),
    ])

    return {
      total: Number(totalR.rows[0].total),
      byStatus: groupToRecord(statusR.rows, 'status', 'cnt'),
      bySeverity: groupToRecord(severityR.rows, 'severity', 'cnt'),
      byCategory: groupToRecord(categoryR.rows, 'category', 'cnt'),
      byPhase: groupToRecord(phaseR.rows, 'detected_phase', 'cnt'),
      byPriority: groupToRecord(priorityR.rows, 'priority', 'cnt'),
      recentTrend: trendR.rows.map(r => ({ date: String(r.date), count: Number(r.count) })),
    }
  })

  // ─── GET SINGLE ────────────────────────────────────────
  app.get('/defects/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const client = getClient()
    const result = await client.execute({
      sql: 'SELECT * FROM defects WHERE id = ? AND deleted_at IS NULL',
      args: [parseInt(id, 10)],
    })
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Defect not found' })
    }
    return rowToDefect(result.rows[0])
  })

  // ─── CREATE ────────────────────────────────────────────
  app.post('/defects', async (req, reply) => {
    const body = req.body as DefectCreateInput
    if (!body.title || !body.reporterId || !body.reporterName) {
      return reply.code(400).send({ error: 'title, reporterId, and reporterName are required' })
    }

    const now = new Date().toISOString()
    const client = getClient()
    const result = await client.execute({
      sql: `INSERT INTO defects (title, description, severity, priority, status, category, detected_phase, vehicle, product, layer, component, reporter_id, reporter_name, assignee_id, assignee_name, root_cause, corrective_action, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        body.title,
        body.description || '',
        body.severity || 'Minor',
        body.priority || 'P2',
        body.status || 'Open',
        body.category || 'Other',
        body.detectedPhase || 'Design',
        body.vehicle || '',
        body.product || '',
        body.layer || '',
        body.component || '',
        body.reporterId,
        body.reporterName,
        body.assigneeId || '',
        body.assigneeName || '',
        body.rootCause || '',
        body.correctiveAction || '',
        now,
        now,
      ],
    })

    const newId = Number(result.lastInsertRowid)
    const created = await client.execute({ sql: 'SELECT * FROM defects WHERE id = ?', args: [newId] })
    return reply.code(201).send(rowToDefect(created.rows[0]))
  })

  // ─── UPDATE ────────────────────────────────────────────
  app.put('/defects/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = req.body as DefectUpdateInput
    const client = getClient()

    // Check existence
    const existing = await client.execute({
      sql: 'SELECT id FROM defects WHERE id = ? AND deleted_at IS NULL',
      args: [parseInt(id, 10)],
    })
    if (existing.rows.length === 0) {
      return reply.code(404).send({ error: 'Defect not found' })
    }

    const fieldMap: Record<string, string> = {
      title: 'title', description: 'description', severity: 'severity',
      priority: 'priority', status: 'status', category: 'category',
      detectedPhase: 'detected_phase', vehicle: 'vehicle', product: 'product',
      layer: 'layer', component: 'component', reporterId: 'reporter_id',
      reporterName: 'reporter_name', assigneeId: 'assignee_id',
      assigneeName: 'assignee_name', rootCause: 'root_cause',
      correctiveAction: 'corrective_action',
    }

    const sets: string[] = []
    const args: unknown[] = []

    for (const [key, col] of Object.entries(fieldMap)) {
      if ((body as any)[key] !== undefined) {
        sets.push(`${col} = ?`)
        args.push((body as any)[key])
      }
    }

    if (sets.length === 0) {
      return reply.code(400).send({ error: 'No fields to update' })
    }

    sets.push('updated_at = ?')
    args.push(new Date().toISOString())
    args.push(parseInt(id, 10))

    await client.execute({
      sql: `UPDATE defects SET ${sets.join(', ')} WHERE id = ?`,
      args: args as any,
    })

    const updated = await client.execute({ sql: 'SELECT * FROM defects WHERE id = ?', args: [parseInt(id, 10)] })
    return rowToDefect(updated.rows[0])
  })

  // ─── DELETE (soft by default, hard with ?hard=true) ────
  app.delete('/defects/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const q = req.query as Record<string, string | undefined>
    const client = getClient()
    const idNum = parseInt(id, 10)

    const existing = await client.execute({
      sql: 'SELECT id FROM defects WHERE id = ?',
      args: [idNum],
    })
    if (existing.rows.length === 0) {
      return reply.code(404).send({ error: 'Defect not found' })
    }

    if (q.hard === 'true') {
      await client.execute({ sql: 'DELETE FROM defects WHERE id = ?', args: [idNum] })
      return { message: 'Defect permanently deleted', id: idNum }
    } else {
      await client.execute({
        sql: 'UPDATE defects SET deleted_at = ?, updated_at = ? WHERE id = ?',
        args: [new Date().toISOString(), new Date().toISOString(), idNum],
      })
      return { message: 'Defect soft-deleted', id: idNum }
    }
  })
}

// ─── Helpers ─────────────────────────────────────────────

function rowToDefect(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    title: String(row.title ?? ''),
    description: String(row.description ?? ''),
    severity: String(row.severity ?? 'Minor'),
    priority: String(row.priority ?? 'P2'),
    status: String(row.status ?? 'Open'),
    category: String(row.category ?? 'Other'),
    detectedPhase: String(row.detected_phase ?? 'Design'),
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
    deletedAt: row.deleted_at ? String(row.deleted_at) : null,
  }
}

function groupToRecord(rows: Record<string, unknown>[], keyCol: string, valCol: string): Record<string, number> {
  const result: Record<string, number> = {}
  for (const row of rows) {
    result[String(row[keyCol])] = Number(row[valCol])
  }
  return result
}
