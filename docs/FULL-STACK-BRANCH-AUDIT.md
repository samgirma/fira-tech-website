# Full-Stack Branch Audit

## Branch: `full-stack`

---

## Directory Structure

```
/
├── admin-app/           # React Native/Expo mobile admin application
├── fira-tech-website/   # Main web application (frontend + backend + API)
├── .gitignore
└── Fira-Tech-Solutions-Phase-1.md
```

---

## fira-tech-website/

### Framework & Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI primitives
- **State**: React Query (TanStack Query)
- **Routing**: React Router DOM v6
- **Backend**: Express.js (dev server)
- **Production API**: Vercel Serverless Functions (api/ directory)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + JWT (HTTP-only cookies)
- **Storage**: Cloudinary (image uploads)
- **AI Chat**: Groq / Gemini / OpenAI (multi-provider fallback)

### Pages (Frontend)
| Page | Route | Description |
|------|-------|-------------|
| Index | `/` | Homepage with Hero, About, Services, Community sections |
| Blogs | `/blogs` | Blog listing page |
| BlogDetail | `/blog/:slug` | Individual blog post |
| Careers | `/careers` | Job listings |
| FeedbackPage | `/feedback` | Client satisfaction survey |
| NotFound | `*` | 404 page |

### Components
- `Navbar.tsx` - Navigation bar
- `HeroSection.tsx` - Landing hero
- `AboutSection.tsx` - About section
- `ServicesSection.tsx` - Services display
- `CommunitySection.tsx` - Community stats
- `ContactSection.tsx` - Contact form
- `Footer.tsx` - Footer with social links
- `ChatAssistant.tsx` - AI chat widget
- `CommentsSection.tsx` - Blog comments
- `SectionSlideshow.tsx` - Slideshow component
- `ErrorBoundary.tsx` - Error handling

### API Endpoints (Serverless - Vercel)

#### Public
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/blogs` | GET | List published blogs |
| `/api/comments` | POST | Submit blog comment |
| `/api/jobs` | GET | List active jobs |
| `/api/contact` | POST | Submit contact message |
| `/api/settings` | GET | Get public settings |
| `/api/social-links` | GET | Get active social links |
| `/api/site-stats` | GET | Get site statistics |
| `/api/chat` | POST | AI chatbot |
| `/api/satisfaction` | GET/POST | Satisfaction survey |
| `/api/satisfaction/validate-link` | GET | Validate survey link |
| `/api/upload` | POST | Image upload (Cloudinary) |

#### Admin (requires JWT auth)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Admin login |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/logout` | POST | Admin logout |
| `/api/auth/register` | POST | Register admin |
| `/api/admin/blogs` | GET/POST/DELETE | Manage blogs |
| `/api/admin/comments` | GET/PUT/DELETE | Manage comments |
| `/api/admin/jobs` | GET/POST/PUT/DELETE/PATCH | Manage jobs |
| `/api/admin/settings` | GET/PUT | Manage settings |
| `/api/admin/social-links` | GET/POST/PUT/DELETE | Manage social links |
| `/api/admin/contact` | GET/PUT/DELETE | Manage contact messages |
| `/api/admin/site-stats` | GET/PUT | Manage site stats |
| `/api/admin/satisfaction` | GET/DELETE | Manage satisfaction responses |
| `/api/admin/satisfaction/generate-link` | POST | Generate survey link |
| `/api/admin/satisfaction/links` | GET | List survey links |

### Database Tables (Supabase)
- `profiles` - User profiles (id, email, name, role)
- `blogs` - Blog posts (title, content, slug, author_id, published)
- `comments` - Blog comments (content, author, email, blog_id, approved)
- `jobs` - Job listings (title, description, department, location, type, experience, remote, is_active)
- `contact_messages` - Contact form submissions
- `settings` - Key-value settings store
- `social_links` - Social media links
- `knowledge_base` - AI chat knowledge base (with vector embeddings)

### Environment Variables
```
VITE_SUPABASE_URL          # Supabase URL (frontend)
VITE_SUPABASE_ANON_KEY     # Supabase anon key (frontend)
SUPABASE_URL               # Supabase URL (server)
SUPABASE_SERVICE_ROLE_KEY  # Supabase service role key (server)
JWT_SECRET                 # JWT signing secret
OPENAI_API_KEY             # OpenAI API key (optional)
GEMINI_API_KEY             # Google Gemini API key (optional)
GROQ_API_KEY               # Groq API key (optional)
CLOUDINARY_CLOUD_NAME      # Cloudinary cloud name
CLOUDINARY_API_KEY         # Cloudinary API key
CLOUDINARY_API_SECRET      # Cloudinary API secret
CHAT_ENABLE_RULES          # Enable chat filtering rules
```

### Deployment
- **Platform**: Vercel
- **Build**: `vite build`
- **Output**: `dist/`
- **API**: Vercel Serverless Functions (api/ directory)
- **SPA Routing**: Rewrites to index.html

---

## admin-app/

### Framework & Stack
- **Framework**: React Native + Expo (SDK 56)
- **Navigation**: React Navigation (Native Stack + Bottom Tabs)
- **Auth**: Supabase Auth + SecureStore
- **Database**: Supabase (direct client)

### Screens
| Screen | Description |
|--------|-------------|
| LoginScreen | Admin login |
| DashboardScreen | Admin dashboard |
| BlogsScreen | Blog management |
| CommentsScreen | Comment moderation |
| JobsScreen | Job listing management |
| MessagesScreen | Contact message management |
| SettingsScreen | Site settings |
| SocialLinksScreen | Social link management |
| StatsScreen | Site statistics + satisfaction |

### Services
- `supabase.ts` - Supabase client with SecureStore persistence

### Environment Variables
```
EXPO_PUBLIC_SUPABASE_URL       # Supabase URL
EXPO_PUBLIC_SUPABASE_ANON_KEY  # Supabase anon key
```

### Key Observations
- This is a **React Native mobile app**, not a web application
- Uses Expo SecureStore for token persistence
- Connects directly to Supabase (no intermediate API)
- Should be preserved as-is (renamed to `mobile-app/`)

---

## Security Notes

1. **Frontend exposes**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (intended - anon key is public)
2. **Server-side secrets**: `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, API keys - these are in Vercel env vars, not committed
3. **JWT secret fallback**: `server.js` has `process.env.JWT_SECRET || 'dev-secret-change-in-production'` - production should always set this
4. **CORS**: Currently uses `cors()` with no restrictions in dev server - production uses Vercel headers

---

## Migration Classification

### Frontend (→ public-website/)
- `src/` directory (components, pages, hooks, lib, assets)
- `public/` directory
- `index.html`
- `package.json` (frontend dependencies)
- `vite.config.ts`
- `tailwind.config.ts`
- `postcss.config.js`
- `tsconfig*.json`
- `components.json`

### Backend/API (→ api/)
- `api/` directory (Vercel serverless functions)
- `lib/` directory (shared utilities: jwt.ts, supabase.ts, supabaseAdmin.ts)
- `server.js` (Express dev server)
- `supabase/` directory (migrations, seeds)
- Backend-related dependencies from package.json

### Shared
- `vercel.json` (deployment config)
- `.env.example` (environment documentation)
