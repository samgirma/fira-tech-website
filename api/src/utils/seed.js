import bcrypt from 'bcryptjs'
import { db } from '../config/database.js'

async function seed() {
  console.log('Seeding database...')
  
  try {
    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10)
    
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', ['admin@firatech.systems'])
    
    let adminId
    if (existingUser.rows.length === 0) {
      const result = await db.query(
        `INSERT INTO users (email, password_hash, name, role) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        ['admin@firatech.systems', passwordHash, 'Sam Gimyr', 'ADMIN']
      )
      adminId = result.rows[0].id
      console.log('✅ Created admin user: admin@firatech.systems / admin123')
    } else {
      adminId = existingUser.rows[0].id
      console.log('ℹ️  Admin user already exists')
    }

    // Create sample customers
    const customers = [
      { name: 'ABC Trading', email: 'info@abctrading.com', company: 'ABC Trading PLC' },
      { name: 'Tech Solutions', email: 'contact@techsolutions.com', company: 'Tech Solutions Ethiopia' },
      { name: 'StartUp Inc', email: 'hello@startupinc.com', company: 'StartUp Inc' },
      { name: 'Green Farm', email: 'info@greenfarm.com', company: 'Green Farm Agriculture' },
      { name: 'City Hospital', email: 'admin@cityhospital.com', company: 'City Hospital' },
    ]

    const customerIds = []
    for (const c of customers) {
      const existing = await db.query('SELECT id FROM customers WHERE name = $1', [c.name])
      if (existing.rows.length === 0) {
        const result = await db.query(
          'INSERT INTO customers (name, email, company) VALUES ($1, $2, $3) RETURNING id',
          [c.name, c.email, c.company]
        )
        customerIds.push(result.rows[0].id)
      } else {
        customerIds.push(existing.rows[0].id)
      }
    }
    console.log('✅ Created sample customers')

    // Create sample leads
    const leads = [
      { name: 'Ahmed Hassan', company: 'Ethio Tech', email: 'ahmed@ethiotech.com', status: 'new', estimated_value: 150000 },
      { name: 'Sara Bekele', company: 'Digital Solutions', email: 'sara@digitalsolutions.com', status: 'contacted', estimated_value: 200000 },
      { name: 'Mike Johnson', company: 'Global Corp', email: 'mike@globalcorp.com', status: 'qualified', estimated_value: 350000 },
      { name: 'Fatima Ali', company: 'Innovation Hub', email: 'fatima@innovationhub.com', status: 'proposal', estimated_value: 180000 },
      { name: 'David Chen', company: 'Asia Trade', email: 'david@asiatrade.com', status: 'negotiation', estimated_value: 500000 },
    ]

    for (const l of leads) {
      const existing = await db.query('SELECT id FROM leads WHERE email = $1', [l.email])
      if (existing.rows.length === 0) {
        await db.query(
          `INSERT INTO leads (name, company, email, status, estimated_value, owner_id) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [l.name, l.company, l.email, l.status, l.estimated_value, adminId]
        )
      }
    }
    console.log('✅ Created sample leads')

    // Create sample projects
    const projects = [
      { name: 'Fira Retail', customer_idx: 0, status: 'active', progress: 73, budget: 250000, revenue: 185000 },
      { name: 'E-commerce Platform', customer_idx: 1, status: 'active', progress: 45, budget: 400000, revenue: 150000 },
      { name: 'Mobile App', customer_idx: 2, status: 'active', progress: 90, budget: 150000, revenue: 135000 },
      { name: 'Farm Management System', customer_idx: 3, status: 'planning', progress: 10, budget: 180000, revenue: 0 },
    ]

    const projectIds = []
    for (const p of projects) {
      const existing = await db.query('SELECT id FROM projects WHERE name = $1', [p.name])
      if (existing.rows.length === 0) {
        const result = await db.query(
          `INSERT INTO projects (name, customer_id, status, progress, budget, revenue, technologies) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [p.name, customerIds[p.customer_idx], p.status, p.progress, p.budget, p.revenue, ['React', 'Node.js', 'PostgreSQL']]
        )
        projectIds.push(result.rows[0].id)
      } else {
        projectIds.push(existing.rows[0].id)
      }
    }
    console.log('✅ Created sample projects')

    // Create sample tasks
    const tasks = [
      { title: 'Follow up with ABC Trading', priority: 'high', status: 'todo', project_idx: 0 },
      { title: 'Review mobile app proposal', priority: 'high', status: 'todo', project_idx: 2 },
      { title: 'Send invoice to Tech Solutions', priority: 'medium', status: 'todo', project_idx: 1 },
      { title: 'Update portfolio with new project', priority: 'medium', status: 'in-progress' },
      { title: 'Write blog post about AI services', priority: 'low', status: 'todo' },
    ]

    for (const t of tasks) {
      const existing = await db.query('SELECT id FROM tasks WHERE title = $1', [t.title])
      if (existing.rows.length === 0) {
        await db.query(
          `INSERT INTO tasks (title, project_id, assigned_to, priority, status) 
           VALUES ($1, $2, $3, $4, $5)`,
          [t.title, t.project_idx !== undefined ? projectIds[t.project_idx] : null, adminId, t.priority, t.status]
        )
      }
    }
    console.log('✅ Created sample tasks')

    // Create sample jobs
    const jobs = [
      { title: 'Full Stack Developer', department: 'Engineering', location: 'Addis Ababa', type: 'FULL_TIME', experience: 'MID' },
      { title: 'UI/UX Designer', department: 'Design', location: 'Remote', type: 'FULL_TIME', experience: 'SENIOR' },
      { title: 'Marketing Intern', department: 'Marketing', location: 'Addis Ababa', type: 'INTERNSHIP', experience: 'ENTRY' },
    ]

    for (const j of jobs) {
      const existing = await db.query('SELECT id FROM jobs WHERE title = $1', [j.title])
      if (existing.rows.length === 0) {
        await db.query(
          `INSERT INTO jobs (title, department, location, type, experience, description) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [j.title, j.department, j.location, j.type, j.experience, `Join our team as ${j.title}. This is a great opportunity to grow with Fira Tech Solutions.`]
        )
      }
    }
    console.log('✅ Created sample jobs')

    // Create sample settings
    const settings = [
      { key: 'contact_email', value: 'info@firatech.systems' },
      { key: 'contact_phone', value: '+251-XXX-XXX-XXX' },
      { key: 'company_name', value: 'Fira Tech Solutions' },
      { key: 'company_tagline', value: 'Innovation. Community. Value.' },
    ]

    for (const s of settings) {
      await db.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
        [s.key, s.value]
      )
    }
    console.log('✅ Created default settings')

    console.log('\n🎉 Seed completed successfully!')
    console.log('\nAdmin login: admin@firatech.systems / admin123')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error.message)
    process.exit(1)
  }
}

seed()
