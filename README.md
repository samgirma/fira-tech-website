# Fira Tech Solutions Platform

Monorepo for the Fira Tech Solutions digital platform.

## Architecture

```
FIRA TECH PLATFORM

                    API
          api.firatech.systems
                   │
      ┌────────────┼────────────┐
      │            │            │
      ▼            ▼            ▼
Public Website  Admin Site  Mobile App
firatech.systems admin.firatech React Native
```

## Directory Structure

```
/
├── public-website/      # Public-facing website
├── admin-site/          # Internal web administration system
├── api/                 # Shared backend API
├── mobile-app/          # React Native admin application
├── docs/                # Architecture documentation
├── README.md
└── .gitignore
```

## Services

### public-website
- **URL**: https://firatech.systems
- **Stack**: React + TypeScript + Vite + Tailwind CSS
- **Purpose**: Public company website, blog, careers, contact

### admin-site
- **URL**: https://admin.firatech.systems
- **Stack**: React + TypeScript + Vite
- **Purpose**: Internal administration dashboard (Phase 2+)

### api
- **URL**: https://api.firatech.systems
- **Stack**: Node.js + Express + Supabase
- **Purpose**: Shared backend API for all clients

### mobile-app
- **Platform**: iOS + Android
- **Stack**: React Native + Expo
- **Purpose**: Mobile admin application

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies for each service
cd public-website && npm install
cd ../admin-site && npm install
cd ../api && npm install
cd ../mobile-app && npm install
```

### Running Locally

```bash
# Public Website (port 5173)
cd public-website
npm run dev

# API Server (port 3000)
cd api
npm run dev

# Admin Site (port 3001)
cd admin-site
npm run dev

# Mobile App
cd mobile-app
npm start
```

### Building

```bash
# Public Website
cd public-website && npm run build

# Admin Site
cd admin-site && npm run build

# API
cd api && npm run build
```

## Environment Variables

See `.env.example` in each service directory for required configuration.

### Key Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `SUPABASE_URL` | API | Supabase project URL |
| `SUPABASE_ANON_KEY` | API, Public, Admin | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | API | Supabase service role key |
| `JWT_SECRET` | API | JWT signing secret |
| `VITE_API_BASE_URL` | Public, Admin | API endpoint URL |

## Documentation

- [Full-Stack Branch Audit](docs/FULL-STACK-BRANCH-AUDIT.md)
- [Current Database](docs/CURRENT-DATABASE.md)
- [API Migration Plan](docs/API-MIGRATION.md)

## Deployment

Each service is independently deployable to Vercel:

| Service | Vercel Project | Root Directory |
|---------|---------------|----------------|
| Public Website | firatech-systems | `public-website` |
| Admin Site | admin-firatech | `admin-site` |
| API | api-firatech | `api` |

## License

Private - Fira Tech Solutions
