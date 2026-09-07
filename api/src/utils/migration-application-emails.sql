-- Migration: Application Emails and Career Management Enhancement
CREATE TABLE IF NOT EXISTS application_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  template VARCHAR(100),
  sent_by UUID REFERENCES users(id),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'sent'
);

-- Index for speedy retrieval of an applicant's email history
CREATE INDEX IF NOT EXISTS idx_application_emails_app_id ON application_emails(application_id);
CREATE INDEX IF NOT EXISTS idx_application_emails_sent_at ON application_emails(sent_at DESC);

-- Ensure applications has index on job_id and created_at
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
