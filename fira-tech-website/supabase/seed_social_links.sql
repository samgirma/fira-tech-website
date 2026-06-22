-- Seed social links for Fira Tech
-- Run this after applying 001_initial_schema.sql migration (which now includes social_links table)

INSERT INTO social_links (platform, url, icon, label, sort_order, is_active)
VALUES
  ('github', 'https://github.com/fira-tech', 'Github', 'GitHub', 1, true),
  ('linkedin', 'https://linkedin.com/company/fira-tech', 'Linkedin', 'LinkedIn', 2, true),
  ('telegram', 'https://t.me/firatech', 'Send', 'Telegram', 3, true)
ON CONFLICT (platform) DO UPDATE SET
  url = EXCLUDED.url,
  icon = EXCLUDED.icon,
  label = EXCLUDED.label,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
