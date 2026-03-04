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
  `)

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
