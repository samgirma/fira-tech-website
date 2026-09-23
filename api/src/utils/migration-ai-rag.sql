-- ============================================
-- AI & RAG SUBSYSTEM MIGRATION
-- ============================================

-- Ensure vector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge Chunks for Vector Semantic Search
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type VARCHAR(50) NOT NULL, -- 'service' | 'portfolio' | 'blog' | 'faq' | 'company_info'
  source_id VARCHAR(100),
  content TEXT NOT NULL,
  embedding VECTOR(1536) NOT NULL,
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);

-- AI Usage and Operational Cost Log
CREATE TABLE IF NOT EXISTS ai_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL,
  feature VARCHAR(100) NOT NULL,
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  estimated_cost_usd NUMERIC(10, 6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_usage_log_created_at_idx ON ai_usage_log(created_at);

-- Public Chatbot Conversation & Inquiries Log
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100),
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  matched_chunk_ids TEXT[],
  lead_captured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_logs_session_idx ON chat_logs(session_id);

-- FAQ Table for Company Answers & RAG Indexing
CREATE TABLE IF NOT EXISTS faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Applications table AI scoring & structured analysis columns
ALTER TABLE applications ADD COLUMN IF NOT EXISTS ai_score INT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS ai_analysis JSONB;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ;
