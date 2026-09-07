import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { db } from '../config/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function runMigration() {
  console.log('Running clients & knowledge_base migration...')
  try {
    const sql = readFileSync(join(__dirname, 'migration-clients.sql'), 'utf-8')
    await db.query(sql)
    console.log('✅ Migration completed successfully!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Migration failed:', err)
    process.exit(1)
  }
}

runMigration()
