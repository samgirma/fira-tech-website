// scripts/seed-knowledge-base.mjs
// Generates embeddings and seeds the knowledge_base table in Supabase
// Usage: node scripts/seed-knowledge-base.mjs
// Requires: OPENAI_API_KEY or GEMINI_API_KEY in .env.local

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { resolve } from 'path';
import { config } from 'dotenv';

config({ path: resolve(import.meta.dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

if (!OPENAI_API_KEY && !GEMINI_API_KEY) {
  console.error('Set at least one of OPENAI_API_KEY or GEMINI_API_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const entries = [
  {
    category: 'company',
    title: 'Fira Tech Solutions Overview',
    content: 'Fira Tech Solutions is a community-first software engineering startup based in Adama, Ethiopia. The company mission is to bridge the gap between traditional business frameworks and modern technology by engineering high-impact digital solutions specifically optimized for local communities and the broader Ethiopian market. Fira Tech operates under a strict Kinship First philosophy — digital expansion should empower local businesses rather than displace them.',
    keywords: ['company', 'about', 'overview', 'mission', 'fira', 'tech', 'solutions', 'adama', 'ethiopia', 'community', 'kinship'],
  },
  {
    category: 'values',
    title: 'Rooted in Community',
    content: 'Every digital product built by Fira Tech is designed to solve an immediate bottleneck faced by local merchants, transit systems, or community members in Adama. The company puts community impact first in every decision.',
    keywords: ['community', 'local', 'adama', 'merchants', 'bottleneck', 'impact'],
  },
  {
    category: 'values',
    title: 'Local-Global Vision',
    content: 'Fira Tech takes local talents and community-driven ideas and elevates them to meet world-class global software engineering standards. We bridge Ethiopian innovation with global technology excellence.',
    keywords: ['local', 'global', 'vision', 'talent', 'standards', 'world-class'],
  },
  {
    category: 'values',
    title: 'Kinship First',
    content: 'Building strong, mutual relationships with local partners ensures technology serves human collaboration. Every client is treated as family, receiving the care and dedication that kinship brings. Technology should empower people, not replace them.',
    keywords: ['kinship', 'family', 'relationships', 'partners', 'human', 'collaboration'],
  },
  {
    category: 'values',
    title: 'Collaborative Spirit',
    content: 'Working hand-in-hand with ecosystem partners and community developers to build open, accessible digital frameworks. True innovation comes from working together.',
    keywords: ['collaborative', 'spirit', 'partners', 'ecosystem', 'developers', 'open'],
  },
  {
    category: 'services',
    title: 'E-Commerce and Digital Storefronts',
    content: 'Fira Tech helps traditional local market vendors migrate their inventories into light, lightning-fast web layouts that do not drain user data packages. Our e-commerce solutions are optimized for Ethiopian connectivity conditions — fast loading, low data usage, and mobile-first design. We build custom online stores, inventory management systems, and digital payment integrations.',
    keywords: ['ecommerce', 'e-commerce', 'store', 'shop', 'storefront', 'inventory', 'web', 'vendors', 'data', 'mobile'],
  },
  {
    category: 'services',
    title: 'FinTech and Mobile Wallet Integration',
    content: 'Specialized deployment of local mobile wallet integrations including Telebirr and CBE Birr payment gateways to allow cashless transaction handling for local businesses. Fira Tech builds fintech solutions optimized for the Ethiopian market, including payment processing, digital wallets, transaction tracking, and financial dashboards.',
    keywords: ['fintech', 'payment', 'telebirr', 'cbe', 'birr', 'wallet', 'cashless', 'transaction', 'finance', 'mobile money'],
  },
  {
    category: 'services',
    title: 'Digital Ticketing and Transport Automation',
    content: 'Engineering seamless booking networks featuring interactive seat maps and automated QR-code ticket verifications tailored directly for Ethiopian cross-country and regional transport operators. Fira Tech builds digital ticketing systems, booking platforms, seat selection interfaces, and QR verification for transport companies.',
    keywords: ['ticketing', 'transport', 'booking', 'seat', 'map', 'qr', 'code', 'bus', 'travel', 'automation', 'ethiopian transport'],
  },
  {
    category: 'services',
    title: 'Custom Enterprise Software',
    content: 'Designing specialized software solutions for corporate partners, educational hubs, and community enterprises seeking localized digital management workflows. From custom CRMs to internal tools, Fira Tech builds enterprise software tailored to Ethiopian business needs.',
    keywords: ['enterprise', 'custom', 'software', 'corporate', 'crm', 'workflow', 'management', 'business', 'educational'],
  },
  {
    category: 'location',
    title: 'Fira Tech Location',
    content: 'Fira Tech Solutions is based in Adama, Ethiopia. The office serves as the central hub for all development and community operations. Fira Tech serves clients locally in Adama, across Ethiopia, and internationally.',
    keywords: ['location', 'adama', 'ethiopia', 'office', 'where', 'based', 'hub'],
  },
  {
    category: 'location',
    title: 'Contacting Support',
    content: 'For official business proposals, technical errors, or data requests, users can reach out via the official communication channels listed in the website Footer Quick Links. Contact options include Telegram, WhatsApp, phone, and email. The AI chat assistant is also available 24/7 for immediate automated support.',
    keywords: ['contact', 'support', 'help', 'email', 'phone', 'telegram', 'whatsapp', 'reach', 'inquiry'],
  },
  {
    category: 'location',
    title: 'Public Comments System',
    content: 'Users can submit feedback, reviews, and community questions directly through the homepage comments portal. To maintain a safe environment, all public entries pass through an administrative moderation queue before appearing live.',
    keywords: ['comments', 'feedback', 'reviews', 'questions', 'moderation', 'submit', 'public'],
  },
  {
    category: 'admin',
    title: 'AI Chat Assistant',
    content: 'A floating AI chat assistant is available on the platform 24/7. It provides immediate, automated support regarding Fira Tech services, office navigation, and business inquiries. The assistant uses a knowledge base to answer questions accurately about Fira Tech operations.',
    keywords: ['ai', 'chat', 'assistant', 'bot', 'automated', 'support', '24/7'],
  },
  {
    category: 'admin',
    title: 'Admin Dashboard',
    content: 'Authorized administrators manage platform content, toggle blog visibility states, and approve or delete user-submitted feedback via the secure admin authentication panel. The admin panel includes screens for managing blogs, comments, jobs, messages, and platform settings.',
    keywords: ['admin', 'dashboard', 'manage', 'content', 'blog', 'moderate', 'approve', 'settings'],
  },
  {
    category: 'technology',
    title: 'Technology Stack',
    content: 'Fira Tech uses modern technology optimized for Ethiopian connectivity conditions. Frontend: React, Next.js, TypeScript, Tailwind CSS. Backend: Node.js, Supabase (PostgreSQL, Auth, Storage). Mobile: React Native, Expo, Flutter. Payment: Telebirr, CBE Birr integrations. Architecture: Offline-first, low-bandwidth optimized, mobile-first.',
    keywords: ['tech', 'stack', 'react', 'nextjs', 'typescript', 'supabase', 'nodejs', 'mobile', 'offline', 'low-bandwidth'],
  },
  {
    category: 'faq',
    title: 'Frequently Asked Questions',
    content: 'Q: How long does a typical project take? A: MVPs take 4-8 weeks, full platforms 3-6 months. Q: Do you work with startups? A: Yes, we have startup-friendly packages. Q: What payment methods do you support? A: Telebirr, CBE Birr, bank transfer, and international payments. Q: How do I contact support? A: Via Telegram, WhatsApp, phone, or email listed in the footer. Q: Can I leave feedback? A: Yes, through the public comments section on the homepage.',
    keywords: ['faq', 'questions', 'answers', 'help', 'support', 'common', 'timeline', 'payment', 'contact'],
  },
];

let openaiClient = null;
let geminiClient = null;

if (GEMINI_API_KEY) {
  geminiClient = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log('Using Gemini for embeddings (text-embedding-004)');
} else if (OPENAI_API_KEY) {
  openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
  console.log('Using OpenAI for embeddings (text-embedding-3-small)');
}

async function generateEmbedding(text) {
  if (geminiClient) {
    const model = geminiClient.getGenerativeModel({ model: 'gemini-embedding-001' });
    const res = await model.embedContent(text);
    return res.embedding.values.slice(0, 1536);
  }

  if (openaiClient) {
    const res = await openaiClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536,
    });
    return res.data[0].embedding;
  }

  throw new Error('No embedding provider configured');
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log(`\nSeeding ${entries.length} knowledge base entries...\n`);

  // Clear existing entries first
  const { error: deleteError } = await supabase
    .from('knowledge_base')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteError) {
    console.error('Error clearing existing entries:', deleteError.message);
    console.log('Continuing with insert...\n');
  } else {
    console.log('Cleared existing entries.\n');
  }

  let success = 0;
  let failed = 0;

  for (const entry of entries) {
    try {
      const text = `${entry.title}\n\n${entry.content}`;
      const embedding = await generateEmbedding(text);

      const { error } = await supabase
        .from('knowledge_base')
        .insert({
          category: entry.category,
          title: entry.title,
          content: entry.content,
          keywords: entry.keywords,
          embedding: '[' + embedding.join(',') + ']',
          is_active: true,
        });

      if (error) throw error;
      success++;
      console.log(`  [${success}/${entries.length}] ${entry.title}`);

      await sleep(100);
    } catch (err) {
      failed++;
      console.error(`  [FAILED] ${entry.title}: ${err.message}`);
    }
  }

  console.log(`\nDone: ${success} inserted, ${failed} failed.\n`);
}

main().catch(console.error);
