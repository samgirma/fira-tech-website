-- Knowledge base seed data for RAG
-- Business-focused Fira Tech knowledge base
-- Run this after the migration and after generating embeddings

INSERT INTO knowledge_base (category, title, content, keywords, embedding) VALUES

-- ============================================
-- COMPANY OVERVIEW
-- ============================================
('company', 'Fira Tech Solutions Overview',
'Fira Tech Solutions is a community-first software engineering startup based in Adama, Ethiopia. The company mission is to bridge the gap between traditional business frameworks and modern technology by engineering high-impact digital solutions specifically optimized for local communities and the broader Ethiopian market. Fira Tech operates under a strict Kinship First philosophy — digital expansion should empower local businesses rather than displace them.',
ARRAY['company', 'about', 'overview', 'mission', 'fira', 'tech', 'solutions', 'adama', 'ethiopia', 'community', 'kinship', 'who', 'what']),

-- ============================================
-- CORE VALUES
-- ============================================
('values', 'Rooted in Community',
'Every digital product built by Fira Tech is designed to solve an immediate bottleneck faced by local merchants, transit systems, or community members in Adama. The company puts community impact first in every decision.',
ARRAY['community', 'local', 'adama', 'merchants', 'bottleneck', 'impact', 'people']),

('values', 'Local-Global Vision',
'Fira Tech takes local talents and community-driven ideas and elevates them to meet world-class global software engineering standards. We bridge Ethiopian innovation with global technology excellence.',
ARRAY['local', 'global', 'vision', 'talent', 'standards', 'world-class', 'excellence']),

('values', 'Kinship First',
'Building strong, mutual relationships with local partners ensures technology serves human collaboration. Every client is treated as family, receiving the care and dedication that kinship brings. Technology should empower people, not replace them.',
ARRAY['kinship', 'family', 'relationships', 'partners', 'human', 'collaboration', 'care']),

('values', 'Collaborative Spirit',
'Working hand-in-hand with ecosystem partners and community developers to build open, accessible digital frameworks. True innovation comes from working together.',
ARRAY['collaborative', 'spirit', 'partners', 'ecosystem', 'developers', 'open', 'together']),

-- ============================================
-- SERVICES
-- ============================================
('services', 'E-Commerce and Digital Storefronts',
'Fira Tech helps traditional local market vendors migrate their inventories into light, lightning-fast web layouts that do not drain user data packages. Our e-commerce solutions are optimized for Ethiopian connectivity conditions — fast loading, low data usage, and mobile-first design. We build custom online stores, inventory management systems, and digital payment integrations.',
ARRAY['ecommerce', 'e-commerce', 'store', 'shop', 'storefront', 'inventory', 'web', 'online', 'market', 'vendors', 'data', 'mobile']),

('services', 'FinTech and Mobile Wallet Integration',
'Specialized deployment of local mobile wallet integrations including Telebirr and CBE Birr payment gateways to allow cashless transaction handling for local businesses. Fira Tech builds fintech solutions optimized for the Ethiopian market, including payment processing, digital wallets, transaction tracking, and financial dashboards.',
ARRAY['fintech', 'payment', 'telebirr', 'cbe', 'birr', 'wallet', 'cashless', 'transaction', 'finance', 'money', 'mobile money']),

('services', 'Digital Ticketing and Transport Automation',
'Engineering seamless booking networks featuring interactive seat maps and automated QR-code ticket verifications tailored directly for Ethiopian cross-country and regional transport operators. Fira Tech builds digital ticketing systems, booking platforms, seat selection interfaces, and QR verification for transport companies.',
ARRAY['ticketing', 'transport', 'booking', 'seat', 'map', 'qr', 'code', 'bus', 'travel', 'automation', 'verification', 'ethiopian transport']),

('services', 'Custom Enterprise Software',
'Designing specialized software solutions for corporate partners, educational hubs, and community enterprises seeking localized digital management workflows. From custom CRMs to internal tools, Fira Tech builds enterprise software tailored to Ethiopian business needs.',
ARRAY['enterprise', 'custom', 'software', 'corporate', 'crm', 'workflow', 'management', 'business', 'partner', 'educational']),

-- ============================================
-- LOCATION & CONTACT
-- ============================================
('location', 'Fira Tech Location',
'Fira Tech Solutions is based in Adama, Ethiopia. The office serves as the central hub for all development and community operations. Fira Tech serves clients locally in Adama, across Ethiopia, and internationally.',
ARRAY['location', 'adama', 'ethiopia', 'office', 'where', 'based', 'address', 'hub']),

('location', 'Contacting Support',
'For official business proposals, technical errors, or data requests, users can reach out via the official communication channels listed in the website Footer Quick Links. Contact options include Telegram, WhatsApp, phone, and email. The AI chat assistant is also available 24/7 for immediate automated support.',
ARRAY['contact', 'support', 'help', 'email', 'phone', 'telegram', 'whatsapp', 'reach', 'inquiry', 'reach out']),

('location', 'Public Comments System',
'Users can submit feedback, reviews, and community questions directly through the homepage comments portal. To maintain a safe environment, all public entries pass through an administrative moderation queue before appearing live.',
ARRAY['comments', 'feedback', 'reviews', 'questions', 'moderation', 'submit', 'public']),

-- ============================================
-- ADMIN & OPERATIONS
-- ============================================
('admin', 'AI Chat Assistant',
'A floating AI chat assistant is available on the platform 24/7. It provides immediate, automated support regarding Fira Tech services, office navigation, and business inquiries. The assistant uses a knowledge base to answer questions accurately about Fira Tech operations.',
ARRAY['ai', 'chat', 'assistant', 'bot', 'automated', 'support', '24/7', 'help']),

('admin', 'Admin Dashboard',
'Authorized administrators manage platform content, toggle blog visibility states, and approve or delete user-submitted feedback via the secure admin authentication panel. The admin panel includes screens for managing blogs, comments, jobs, messages, and platform settings.',
ARRAY['admin', 'dashboard', 'manage', 'content', 'blog', 'moderate', 'approve', 'settings', 'panel']),

-- ============================================
-- TECHNOLOGY
-- ============================================
('technology', 'Technology Stack',
'Fira Tech uses modern technology optimized for Ethiopian connectivity conditions. Frontend: React, Next.js, TypeScript, Tailwind CSS. Backend: Node.js, Supabase (PostgreSQL, Auth, Storage). Mobile: React Native, Expo, Flutter. Payment: Telebirr, CBE Birr integrations. Architecture: Offline-first, low-bandwidth optimized, mobile-first.',
ARRAY['tech', 'stack', 'react', 'nextjs', 'typescript', 'supabase', 'nodejs', 'mobile', 'offline', 'low-bandwidth']),

-- ============================================
-- FAQ
-- ============================================
('faq', 'Frequently Asked Questions',
'Q: How long does a typical project take? A: MVPs take 4-8 weeks, full platforms 3-6 months. Q: Do you work with startups? A: Yes, we have startup-friendly packages. Q: What payment methods do you support? A: Telebirr, CBE Birr, bank transfer, and international payments. Q: How do I contact support? A: Via Telegram, WhatsApp, phone, or email listed in the footer. Q: Can I leave feedback? A: Yes, through the public comments section on the homepage.',
ARRAY['faq', 'questions', 'answers', 'help', 'support', 'common', 'timeline', 'payment', 'contact'])
ON CONFLICT (title) DO NOTHING;
