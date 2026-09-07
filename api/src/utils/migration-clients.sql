-- ============================================
-- Fira Tech Database Migration - Clients & Knowledge Base
-- ============================================

-- 1. Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Create CLIENTS table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  source VARCHAR(100) DEFAULT 'website',
  service_interested VARCHAR(255),
  estimated_value DECIMAL(12,2),
  stage VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (stage IN ('new', 'contacted', 'proposal_sent', 'won', 'active', 'archived')),
  owner_id UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_stage ON clients(stage);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- 3. Migrate existing CUSTOMERS into CLIENTS (as stage 'active')
INSERT INTO clients (id, name, company, email, phone, source, notes, stage, created_at, updated_at)
SELECT 
  id,
  name,
  company,
  email,
  phone,
  'existing_customer',
  notes,
  'active',
  created_at,
  updated_at
FROM customers
ON CONFLICT (id) DO NOTHING;

-- 4. Migrate existing LEADS into CLIENTS
INSERT INTO clients (name, company, email, phone, source, service_interested, estimated_value, stage, owner_id, notes, created_at, updated_at)
SELECT 
  name,
  company,
  email,
  phone,
  COALESCE(source, 'website'),
  service_interested,
  estimated_value,
  CASE 
    WHEN status = 'new' THEN 'new'
    WHEN status = 'contacted' THEN 'contacted'
    WHEN status IN ('proposal', 'negotiation') THEN 'proposal_sent'
    WHEN status = 'won' THEN 'won'
    WHEN status = 'lost' THEN 'archived'
    ELSE 'contacted'
  END,
  owner_id,
  notes,
  created_at,
  updated_at
FROM leads;

-- 5. Add client_id columns to projects, revenue, and invoices
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);
UPDATE projects SET client_id = customer_id WHERE client_id IS NULL AND customer_id IS NOT NULL;

ALTER TABLE revenue ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);
UPDATE revenue SET client_id = customer_id WHERE client_id IS NULL AND customer_id IS NOT NULL;

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);
UPDATE invoices SET client_id = customer_id WHERE client_id IS NULL AND customer_id IS NOT NULL;

-- 6. Create KNOWLEDGE BASE table with pgvector if not exists
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  title TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  embedding vector(1536),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_active ON knowledge_base(is_active);

-- Keyword fallback search function
CREATE OR REPLACE FUNCTION search_knowledge_base_keyword(
  search_terms text,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  category varchar,
  title text,
  content text,
  keywords text[],
  rank_score float
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.category,
    kb.title,
    kb.content,
    kb.keywords,
    (
      CASE WHEN kb.title ILIKE '%' || search_terms || '%' THEN 2.0 ELSE 0.0 END +
      CASE WHEN kb.content ILIKE '%' || search_terms || '%' THEN 1.0 ELSE 0.0 END +
      CASE WHEN search_terms = ANY(kb.keywords) THEN 1.5 ELSE 0.0 END
    )::float AS rank_score
  FROM knowledge_base kb
  WHERE kb.is_active = true
    AND (
      kb.title ILIKE '%' || search_terms || '%'
      OR kb.content ILIKE '%' || search_terms || '%'
      OR search_terms = ANY(kb.keywords)
    )
  ORDER BY rank_score DESC
  LIMIT match_count;
END;
$$;

-- Semantic vector search function
CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  match_threshold float DEFAULT 0.3
)
RETURNS TABLE (
  id uuid,
  category varchar,
  title text,
  content text,
  keywords text[],
  similarity float
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.category,
    kb.title,
    kb.content,
    kb.keywords,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE kb.is_active = true
    AND kb.embedding IS NOT NULL
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 7. Drop empty audit_log table if exists
DROP TABLE IF EXISTS audit_log;
