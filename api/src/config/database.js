import pg from 'pg'
import { config } from '../config/index.js'

const pool = new pg.Pool(config.database)

pool.on('error', (err) => {
  console.error('Unexpected database error:', err)
  process.exit(1)
})

export const db = {
  query: (text, params) => pool.query(text, params),
  
  getClient: () => pool.connect(),
  
  transaction: async (callback) => {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  },
}

export default db
