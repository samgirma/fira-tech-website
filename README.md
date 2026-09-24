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
Public Website  Admin Site
firatech.systems admin.firatech
```

## Directory Structure

```
/
├── public-website/      # Public-facing website
├── admin-site/          # Internal web administration system
├── api/                 # Shared backend API
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
- **Stack**: Node.js + Express + Supabase (PostgreSQL)
- **Purpose**: Shared backend API for all clients

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
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | API | PostgreSQL (Supabase) connection |
| `JWT_SECRET` | API | JWT signing secret |
| `CORS_ORIGINS` | API | Allowed origins (public + admin domains) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | API | Image & CV upload storage |
| `VITE_API_BASE_URL` | Public, Admin | API endpoint URL |

## Documentation

- [Deployment](DEPLOYMENT.md)
- [Full-Stack Branch Audit](docs/FULL-STACK-BRANCH-AUDIT.md)
- [Current Database](docs/CURRENT-DATABASE.md)
- [API Migration Plan](docs/API-MIGRATION.md)

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full Vercel setup (three independent
projects from this one repo). Summary:

| Service | Production URL | Root Directory |
|---------|----------------|----------------|
| Public Website | https://firatech.systems | `public-website` |
| Admin Site | https://admin.firatech.systems | `admin-site` |
| API | https://api.firatech.systems | `api` |

## License

Private - Fira Tech Solutions
