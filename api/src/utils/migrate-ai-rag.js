import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { db } from '../config/database.js'
import { logger } from './logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, 'migration-ai-rag.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    logger.info('Running AI & RAG Subsystem Migration...')
    await db.query(sql)
    logger.info('✅ AI & RAG Subsystem Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    logger.error({ err: error }, '❌ AI & RAG Migration failed')
    console.error('Migration error:', error)
    process.exit(1)
  }
}

runMigration()
