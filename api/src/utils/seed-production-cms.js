import { db } from '../config/database.js'

async function seedProductionCMS() {
  console.log('Seeding production CMS data and knowledge base...')

  try {
    // 1. Knowledge Base
    await db.query(`
      INSERT INTO knowledge_base (category, title, content, keywords) VALUES
      ('company', 'Fira Tech Solutions Overview',
       'Fira Tech Solutions is a software engineering agency based in Adama, Ethiopia, founded by a dedicated full-stack engineer. The company builds high-impact digital solutions, custom web and mobile applications, retail SaaS, and cloud platforms with world-class engineering standards and deep community roots.',
       ARRAY['company', 'about', 'overview', 'mission', 'fira', 'tech', 'solutions', 'adama', 'ethiopia', 'founder']),
      ('services', 'Services Offered by Fira Tech',
       'Fira Tech Solutions provides full-cycle software development services including: Custom Software Development, Web Applications, Mobile Apps (iOS & Android via React Native/Expo and Flutter), Cloud Infrastructure, E-Commerce & Retail SaaS, and API Integrations including Telebirr and CBE Birr payment gateways.',
       ARRAY['services', 'custom software', 'web', 'mobile', 'apps', 'cloud', 'ecommerce', 'telebirr', 'cbe birr', 'saas']),
      ('pricing', 'Pricing and Engagement Approach',
       'We offer flexible engagement models tailored to client needs: fixed-scope milestone projects (ideal for MVPs and defined platforms), monthly retainers for ongoing feature delivery, and dedicated engineering sprints. Initial project consultations are complimentary.',
       ARRAY['pricing', 'cost', 'quote', 'retainer', 'milestone', 'budget', 'engagement', 'consultation']),
      ('process', 'How We Start a Project',
       'Starting a project with Fira Tech is straightforward: 1) Fill out our Start a Project form or send an email. 2) We schedule a 30-minute discovery consultation to understand your requirements and goals. 3) We deliver a tailored proposal with clear milestones, architecture, and timeline. 4) Development begins with transparent weekly updates.',
       ARRAY['start a project', 'process', 'steps', 'discovery', 'proposal', 'timeline', 'how to start', 'onboarding']),
      ('contact', 'How to Reach Fira Tech',
       'You can reach us through our website contact form, via email at contact@firatech.systems or info@firatech.systems, by phone at +251 91 234 5678, or connect on Telegram and LinkedIn. Our central office is located in Adama, Ethiopia, and we work with clients globally.',
       ARRAY['contact', 'email', 'phone', 'location', 'adama', 'telegram', 'reach', 'support', 'office'])
      ON CONFLICT (title) DO UPDATE SET 
        content = EXCLUDED.content,
        keywords = EXCLUDED.keywords,
        category = EXCLUDED.category,
        updated_at = NOW();
    `)
    console.log('✓ Knowledge base seeded')

    // 2. Portfolio Projects
    await db.query(`
      INSERT INTO portfolio_projects (
        title, slug, client_name, category, short_description, full_description, 
        problem, solution, results, technologies, demo_url, featured, status, completion_date
      ) VALUES
      (
        'BROS Technology — Modern Tech E-Commerce Platform',
        'bros-technology',
        'BROS Technology',
        'E-Commerce & Retail SaaS',
        'Premier modern tech e-commerce platform and electronics marketplace in Ethiopia with real-time inventory sync.',
        'BROS Technology (broslaptop.com) is one of Ethiopia''s premier computer hardware and electronics retailers. Fira Tech engineered their digital flagship storefront, featuring a lightning-fast catalog, multi-currency display, spec comparisons, and streamlined checkout optimized for low-bandwidth mobile devices.',
        'Traditional Ethiopian retail e-commerce is plagued by slow loading speeds, heavy data consumption on mobile networks, and lack of real-time inventory synchronization across store locations.',
        'Engineered an ultra-light React frontend with Vite, Tailwind CSS, smart image pipelines on Cloudinary, optimized REST caching, and mobile-friendly touch interactions.',
        '65% reduction in initial payload, 40% increase in mobile inquiries, and sub-second page transitions across mobile networks.',
        ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'Cloudinary', 'REST API'],
        'https://broslaptop.com',
        true,
        'published',
        '2026-03-15'
      ),
      (
        'Bera Computer — Enterprise IT Retail & Inventory ERP',
        'bera-computer',
        'Bera Computer PLC',
        'Custom Enterprise Software',
        'Full-stack warehouse inventory control, warranty tracking, and multi-branch POS management system.',
        'A comprehensive business management platform built for Bera Computer to streamline inventory intake, wholesale distribution, point-of-sale invoicing, and warranty lifecycle tracking across multiple branches in Adama and Addis Ababa.',
        'Manual stock tracking caused inventory discrepancies, delayed warranty verification for corporate clients, and lost sales due to untracked warehouse movements.',
        'Built a custom ERP suite with barcode scanning integration, automated sales receipts, branch transfer requisitions, and daily profit-and-loss reporting.',
        'Zero inventory drift over six months of operation, checkout time reduced from 3 minutes to 15 seconds, and complete digital traceability of warranty claims.',
        ARRAY['TypeScript', 'React', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS'],
        'https://firatech.systems/work/bera-computer',
        true,
        'published',
        '2026-06-20'
      ),
      (
        'PayVerify — Digital Payment Verification & Reconciliation',
        'payverify',
        'FinTech Community Hub',
        'FinTech & Automation',
        'Automated payment confirmation and SMS/receipt reconciliation for Telebirr and bank transfers.',
        'A specialized utility for merchant payment verification, ensuring instant proof of payment validation without manual screenshot checking.',
        'Merchants were suffering losses from falsified SMS receipts and fraudulent mobile money transaction screenshots during rush hours.',
        'Developed an automated verification service that matches reference IDs and payment notifications against verified merchant accounts.',
        'Processed over 15,000 verified transactions with zero fraud incidents reported by participating merchants.',
        ARRAY['Node.js', 'TypeScript', 'PostgreSQL', 'Express', 'Tailwind CSS'],
        'https://firatech.systems/work/payverify',
        true,
        'published',
        '2026-07-10'
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        client_name = EXCLUDED.client_name,
        category = EXCLUDED.category,
        short_description = EXCLUDED.short_description,
        full_description = EXCLUDED.full_description,
        problem = EXCLUDED.problem,
        solution = EXCLUDED.solution,
        results = EXCLUDED.results,
        technologies = EXCLUDED.technologies,
        demo_url = EXCLUDED.demo_url,
        featured = EXCLUDED.featured,
        status = EXCLUDED.status,
        completion_date = EXCLUDED.completion_date,
        updated_at = NOW();
    `)
    console.log('✓ Portfolio case studies seeded')

    // 3. Services
    await db.query(`
      INSERT INTO services (
        title, slug, short_description, description, icon, features, technologies, category, display_order, status, featured
      ) VALUES
      (
        'Custom Software Development',
        'custom-software-development',
        'Tailored software systems built to solve your unique operational bottlenecks.',
        'We design and build bespoke software solutions that map precisely to how your business operates. From internal workflows and business operating systems to complex multi-stakeholder platforms.',
        'Code',
        '["Workflow automation", "Bespoke database architectures", "Secure internal dashboards", "Role-based management", "API development & integration"]'::jsonb,
        ARRAY['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
        'Development',
        1,
        'published',
        true
      ),
      (
        'Web Platforms & E-Commerce',
        'web-platforms-ecommerce',
        'Blazing fast, conversion-focused websites and digital storefronts.',
        'High-performance web applications and e-commerce platforms engineered for speed, search visibility, and frictionless mobile experiences across any device.',
        'Globe',
        '["Sub-second page loads", "Bilingual product catalogs", "Local payment gateway integration", "Automated SEO & OpenGraph", "Mobile-first responsive design"]'::jsonb,
        ARRAY['React', 'Next.js', 'Vite', 'Tailwind CSS', 'Telebirr', 'CBE Birr'],
        'Web',
        2,
        'published',
        true
      ),
      (
        'Mobile App Development',
        'mobile-app-development',
        'Intuitive iOS and Android apps designed for reliability and offline resilience.',
        'Cross-platform mobile applications engineered with React Native and Flutter, providing native responsiveness, offline-first data synchronization, and elegant gesture interactions.',
        'Smartphone',
        '["iOS & Android support", "Offline-first sync capabilities", "Push notification pipelines", "Local device biometric auth", "Clean modern user experience"]'::jsonb,
        ARRAY['React Native', 'Expo', 'Flutter', 'TypeScript'],
        'Mobile',
        3,
        'published',
        true
      ),
      (
        'Cloud Infrastructure & DevOps',
        'cloud-infrastructure-devops',
        'Secure, scalable server architectures that keep your applications online 24/7.',
        'Modern cloud deployments with automated CI/CD pipelines, database clustering, automatic backups, rate-limiting, and hardened security layers.',
        'Cloud',
        '["Automated GitHub CI/CD", "SSL/TLS & DDoS protection", "PostgreSQL connection pooling", "Containerized environments", "Real-time monitoring & logging"]'::jsonb,
        ARRAY['Linux', 'Docker', 'GitHub Actions', 'PostgreSQL', 'Pino', 'Helmet'],
        'Infrastructure',
        4,
        'published',
        true
      ),
      (
        'Retail SaaS & ERP Solutions',
        'retail-saas-erp',
        'Smart inventory, POS invoicing, and multi-branch retail management.',
        'Turnkey management platforms for electronics retailers, wholesalers, and transit operators looking to modernize their stock tracking and sales operations.',
        'ShoppingBag',
        '["Multi-branch inventory sync", "Fast point-of-sale checkout", "Barcode scanner compatibility", "Real-time revenue & expense ledger", "Automated tax receipts"]'::jsonb,
        ARRAY['PostgreSQL', 'Node.js', 'React', 'Tailwind CSS'],
        'Enterprise',
        5,
        'published',
        true
      ),
      (
        'FinTech & Payment Integration',
        'fintech-payment-integration',
        'Seamless integration with Telebirr, CBE Birr, and international payment gateways.',
        'Specialized payment modules that automate transaction confirmation, invoice reconciliation, and merchant payout flows.',
        'CreditCard',
        '["Telebirr QR & API", "CBE Birr mobile banking", "Bank transfer webhook verification", "Encrypted transaction logs", "Instant payment confirmation"]'::jsonb,
        ARRAY['Node.js', 'Express', 'REST API', 'Webhooks'],
        'FinTech',
        6,
        'published',
        true
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        short_description = EXCLUDED.short_description,
        description = EXCLUDED.description,
        icon = EXCLUDED.icon,
        features = EXCLUDED.features,
        technologies = EXCLUDED.technologies,
        category = EXCLUDED.category,
        display_order = EXCLUDED.display_order,
        status = EXCLUDED.status,
        featured = EXCLUDED.featured;
    `)
    console.log('✓ Services seeded')

    // 4. Testimonials
    await db.query(`
      INSERT INTO testimonials (customer_name, position, company, content, rating, featured, published)
      VALUES
      (
        'Binyam Tadesse',
        'Managing Director',
        'BROS Technology',
        'Fira Tech rebuilt our entire digital catalog and online ordering system. Our customers frequently compliment the speed and ease of finding laptop specs. The inventory sync has saved our staff countless hours.',
        5,
        true,
        true
      ),
      (
        'Bereket Girma',
        'Operations Lead',
        'Bera Computer PLC',
        'Working with Fira Tech was exceptional. The ERP software built for our store handles our inventory and invoicing without a glitch. The system was delivered on schedule and with great attention to detail.',
        5,
        true,
        true
      ),
      (
        'Samuel K.',
        'Founder & CEO',
        'Horn Innovation Hub',
        'Fira Tech represents the future of technology craftsmanship in Ethiopia: rooted in our community, deeply disciplined, and executing with world-class engineering standards.',
        5,
        true,
        true
      )
      ON CONFLICT DO NOTHING;
    `)
    console.log('✓ Testimonials seeded')

    // 5. Blogs / Insights
    await db.query(`
      INSERT INTO blogs (title, slug, content, excerpt, category, tags, published, published_at)
      VALUES
      (
        'Building High-Performance Web Platforms for Low-Bandwidth Networks',
        'building-high-performance-web-platforms-low-bandwidth',
        'In emerging markets like Ethiopia, web performance is not just a luxury—it is an accessibility requirement. Millions of users access the internet primarily through mobile devices on 3G and 4G networks where every megabyte costs real money and round-trip latency can exceed 300 milliseconds.\n\nWhen engineering platforms like BROS Technology, we adopted a performance budget of less than 200KB for the initial compressed bundle. By leveraging modern tree-shaking, responsive WebP image pipelines, Brotli compression, and pre-rendered static assets, we delivered load times under 1.2 seconds on standard mobile connections.\n\nModern software engineering should empower everyone, regardless of hardware or connection tier.',
        'How we design and build lightweight, resilient web applications optimized for Ethiopian mobile networks and data-conscious users.',
        'Engineering',
        ARRAY['Performance', 'Web Development', 'Ethiopia', 'Architecture'],
        true,
        NOW() - INTERVAL '10 days'
      ),
      (
        'The Oda Tree Philosophy: Merging Heritage with Digital Innovation',
        'oda-tree-philosophy-heritage-digital-innovation',
        'In Oromo culture, the Oda tree is a sacred assembly place—a symbol of wisdom, justice, community dialogue, and enduring growth. Under its vast canopy, elders and citizens gather to deliberate, resolve problems, and chart collective paths forward.\n\nAt Fira Tech Solutions, we adopted the Oda tree not merely as a logo, but as the governing architectural philosophy of our agency. Technology must be rooted in community reality. Rather than imposing foreign paradigms that disrupt local commerce, we build digital tools that nurture and strengthen local merchants, transit systems, and schools.\n\nInnovation is strongest when it knows its roots.',
        'Why the Oda tree inspires our commitment to community-first technology, human craftsmanship, and sustainable software.',
        'Culture & Vision',
        ARRAY['Oda Tree', 'Culture', 'Philosophy', 'Community Tech'],
        true,
        NOW() - INTERVAL '5 days'
      ),
      (
        'From Solo Founder to Modern Agency: Building Fira Tech with Discipline',
        'from-solo-founder-to-modern-agency',
        'Operating as a solo founder requires relentless focus on leverage. Every line of code, every database query, and every client interaction must be organized for maximum clarity and zero wasted motion.\n\nBy building our own internal operating platform—Fira Command—and integrating it tightly with our public presence, GitHub repositories, and automated pipelines, we deliver enterprise-grade quality at startup agility. As our client volume expands, the foundation is set to scale into a world-class engineering team.',
        'Insights from building a software agency from the ground up in Adama with modern full-stack tools.',
        'Founder Notes',
        ARRAY['Startup', 'Solo Founder', 'Productivity', 'Fira Command'],
        true,
        NOW() - INTERVAL '2 days'
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        excerpt = EXCLUDED.excerpt,
        category = EXCLUDED.category,
        tags = EXCLUDED.tags,
        published = EXCLUDED.published,
        published_at = EXCLUDED.published_at;
    `)
    console.log('✓ Blog posts seeded')

    // 6. Settings & Social Links
    await db.query(`
      INSERT INTO settings (key, value, updated_at) VALUES
      ('company_name', 'Fira Tech Solutions', NOW()),
      ('company_tagline', 'Technology Meets Heritage', NOW()),
      ('company_description', 'Designing and building digital products, software platforms, and technology solutions. Based in Adama, Ethiopia, serving communities globally.', NOW()),
      ('company_email', 'contact@firatech.systems', NOW()),
      ('company_phone', '+251 91 234 5678', NOW()),
      ('company_location', 'Adama, Ethiopia', NOW()),
      ('company_website', 'https://firatech.systems', NOW()),
      ('stat_projects', '50+', NOW()),
      ('stat_years', '5+', NOW()),
      ('stat_clients', '30+', NOW()),
      ('stat_rating', '4.9', NOW()),
      ('founder_name', 'Samuel Girma', NOW()),
      ('founder_role', 'Founder & Lead Engineer', NOW()),
      ('founder_bio', 'Full-stack software engineer dedicated to building resilient technology infrastructure, modern e-commerce platforms, and community-first digital solutions.', NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

      INSERT INTO social_links (platform, url, icon, label, sort_order, is_active) VALUES
      ('github', 'https://github.com/Fira-Tech-Solutions', 'Github', 'GitHub', 1, true),
      ('linkedin', 'https://linkedin.com/company/fira-tech-solutions', 'Linkedin', 'LinkedIn', 2, true),
      ('telegram', 'https://t.me/firatechsolutions', 'MessageCircle', 'Telegram', 3, true),
      ('website', 'https://firatech.systems', 'Globe', 'Website', 4, true)
      ON CONFLICT (platform) DO UPDATE SET url = EXCLUDED.url, icon = EXCLUDED.icon, label = EXCLUDED.label, is_active = EXCLUDED.is_active;
    `)
    console.log('✓ Site settings & social links seeded')

    console.log('🎉 Production CMS data seeded successfully!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Error seeding production CMS data:', err)
    process.exit(1)
  }
}

seedProductionCMS()
