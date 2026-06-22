-- Add settings table for dynamic site configuration
-- Run this in Supabase SQL editor

CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed default contact settings
INSERT INTO settings (key, value) VALUES ('contact_email', 'admin@firatech.systems') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('contact_telegram', 'https://t.me/fira_tech_solution') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('contact_whatsapp', 'https://wa.me/251912345678') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('contact_phone', '+251912345678') ON CONFLICT (key) DO NOTHING;
-- Structured contact channels (preferred format: JSON array of {label, value})
INSERT INTO settings (key, value) VALUES ('contact_channels', '[{"label":"telegram","value":"https://t.me/fira_tech_solution"},{"label":"whatsapp","value":"https://wa.me/251912345678"},{"label":"phone","value":"+251912345678"},{"label":"email","value":"admin@firatech.systems"}]') ON CONFLICT (key) DO NOTHING;
