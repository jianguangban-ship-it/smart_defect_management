import { createClient, type Client } from '@libsql/client'
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql'
import { mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import * as schema from './schema.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(__dirname, '..', '..', 'data')
const DB_PATH = resolve(dataDir, 'defects.db')

let db: LibSQLDatabase<typeof schema>
let client: Client

export async function initDb() {
  try { mkdirSync(dataDir, { recursive: true }) } catch {}

  client = createClient({ url: `file:${DB_PATH}` })
  db = drizzle(client, { schema })

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

    CREATE TABLE IF NOT EXISTS webhook_config (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      url              TEXT DEFAULT '',
      platform         TEXT DEFAULT 'dingtalk',
      payload_format   TEXT DEFAULT 'full',
      schedule         TEXT DEFAULT 'disabled',
      filter_severity  TEXT DEFAULT '',
      filter_status    TEXT DEFAULT '',
      filter_priority  TEXT DEFAULT '',
      filter_vehicle   TEXT DEFAULT '',
      filter_product   TEXT DEFAULT '',
      date_range       TEXT DEFAULT 'all',
      custom_keywords  TEXT DEFAULT '',
      next_run_at      TEXT,
      created_at       TEXT NOT NULL,
      updated_at       TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS webhook_history (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      triggered_at      TEXT NOT NULL,
      status            TEXT NOT NULL,
      http_status       INTEGER,
      response_snippet  TEXT DEFAULT '',
      defect_count      INTEGER DEFAULT 0
    );
  `)

  // Migrations — add columns that may not exist yet
  try {
    await client.execute(`ALTER TABLE webhook_config ADD COLUMN platform TEXT DEFAULT 'dingtalk'`)
  } catch { /* column already exists */ }

  console.log(`Database initialized at ${DB_PATH}`)
  return db
}

export function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDb() first.')
  return db
}

export function getClient() {
  if (!client) throw new Error('Database not initialized. Call initDb() first.')
  return client
}
