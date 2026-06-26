-- Fix: replace ivfflat with HNSW index (no memory issues, works with small datasets)

DROP INDEX IF EXISTS idx_knowledge_base_embedding;

CREATE INDEX idx_knowledge_base_embedding ON knowledge_base
  USING hnsw (embedding vector_cosine_ops);
