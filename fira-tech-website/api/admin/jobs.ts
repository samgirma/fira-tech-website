import { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (req.method === 'GET') {
      const { data: jobs, error } = await supabase
        .from('jobs').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return res.status(200).json(jobs || [])
    }

    if (req.method === 'POST') {
      const { title, description, department, location, type, experience, remote } = req.body
      if (!title || !description || !department || !location) {
        return res.status(400).json({ error: 'Missing required fields: title, description, department, location' })
      }

      const { data: job, error } = await supabase
        .from('jobs').insert({ title, description, department, location, type, experience, remote, is_active: true })
        .select().single()
      if (error) throw error
      return res.status(201).json(job)
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body
      if (!id) return res.status(400).json({ error: 'Job ID is required' })

      const { data: job, error } = await supabase
        .from('jobs').update(updates).eq('id', id).select().single()
      if (error) throw error
      if (!job) return res.status(404).json({ error: 'Job not found' })
      return res.status(200).json(job)
    }

    if (req.method === 'DELETE') {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'Job ID is required' })

      const { error, count } = await supabase.from('jobs').delete().eq('id', id as string)
      if (error) throw error
      return res.status(200).json({ message: 'Job deleted successfully' })
    }

    if (req.method === 'PATCH') {
      const { id } = req.body
      if (!id) return res.status(400).json({ error: 'Job ID is required' })

      const { data: job } = await supabase.from('jobs').select('is_active').eq('id', id).single()
      if (!job) return res.status(404).json({ error: 'Job not found' })

      const { data: updated, error } = await supabase
        .from('jobs').update({ is_active: !job.is_active }).eq('id', id).select().single()
      if (error) throw error
      return res.status(200).json(updated)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin Jobs API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
