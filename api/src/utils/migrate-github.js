import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { db } from '../config/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function migrateGithub() {
  console.log('Running GitHub integration migration...')
  
  try {
    const schema = readFileSync(join(__dirname, 'github-schema.sql'), 'utf-8')
    await db.query(schema)
    console.log('✅ GitHub migration completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ GitHub migration failed:', error.message)
    process.exit(1)
  }
}

migrateGithub()
