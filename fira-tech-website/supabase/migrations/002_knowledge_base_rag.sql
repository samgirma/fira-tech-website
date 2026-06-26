-- Knowledge base table with pgvector for RAG
-- Run this in Supabase SQL editor

-- Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge base table
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  title TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  embedding vector(1536),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_active ON knowledge_base(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON knowledge_base
  USING hnsw (embedding vector_cosine_ops);

-- RLS
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active knowledge base" ON knowledge_base
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage knowledge base" ON knowledge_base
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function for semantic search
CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  match_threshold float DEFAULT 0.5
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
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function for keyword search (fallback)
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
