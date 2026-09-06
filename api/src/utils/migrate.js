import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { db } from '../config/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function migrate() {
  console.log('Running database migration...')
  
  try {
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8')
    await db.query(schema)
    console.log('✅ Migration completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

migrate()
