CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  icon VARCHAR(100),
  features JSONB DEFAULT '[]',
  deliverables JSONB DEFAULT '[]',
  technologies TEXT[],
  process JSONB DEFAULT '[]',
  faq JSONB DEFAULT '[]',
  hero_image VARCHAR(500),
  category VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  seo_title VARCHAR(255),
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_featured ON services(featured);
