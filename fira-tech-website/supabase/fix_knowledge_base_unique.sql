-- Quick fix: add unique constraint to knowledge_base.title
-- Run this in Supabase SQL editor if the table already exists without the constraint

ALTER TABLE knowledge_base ADD CONSTRAINT knowledge_base_title_unique UNIQUE (title);
