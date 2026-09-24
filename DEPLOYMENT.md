# Deployment — Vercel

The platform is three independently deployed units that share one Git repo:

| Unit | Directory | Production URL | Purpose |
|------|-----------|----------------|---------|
| `public-website` | `public-website/` | https://firatech.systems | Public marketing site (SPA) |
| `admin-site` | `admin-site/` | https://admin.firatech.systems | Internal admin "Fira Command" (SPA) |
| `api` | `api/` | https://api.firatech.systems | Shared Express API |

Each unit is **its own Vercel project** with a Root Directory pointing at the
corresponding folder. All three live in this single repo (one GitHub repo →
three Vercel projects).

---

## 1. public-website

- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Root directory** (Vercel Project Settings): `public-website`
- **SPA routing**: handled by `public-website/vercel.json` (all routes → `/index.html`); existing `public/` assets (`sitemap.xml`, `robots.txt`, icons) still take precedence because real files are served before rewrites.

### Env vars (set in the Vercel project)

| Variable | Example | Note |
|----------|---------|------|
| `VITE_API_BASE_URL` | `https://api.firatech.systems` | Baked into the bundle at build time. Must be set before the first production build. |

---

## 2. admin-site

- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Root directory**: `admin-site`
- **SPA routing**: handled by `admin-site/vercel.json` (deep routes like `/clients/pipeline` rewrite to `/index.html`).

### Env vars

| Variable | Example | Note |
|----------|---------|------|
| `VITE_API_BASE_URL` | `https://api.firatech.systems` | Baked into the bundle at build time. |

Auth uses HTTP-only cookies from the API; the admin origin must be listed in the
API's `CORS_ORIGINS`.

---

## 3. api

- **Runtime**: Node (plain JavaScript ESM, no build step)
- **Config**: `api/vercel.json` already routes all requests to `src/server.js`.
  `src/server.js` exports the Express app for the serverless runtime and only
  calls `app.listen()` when **not** running on Vercel.
- **Root directory**: `api`
- Node version is selected from `engines.node` (`>=20`) in `api/package.json`.

### Env vars (set in the Vercel project)

| Variable | Example | Required |
|----------|---------|----------|
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | Supabase transaction pooler values | ✅ |
| `JWT_SECRET` | long random string | ✅ |
| `CORS_ORIGINS` | `https://firatech.systems,https://admin.firatech.systems` | ✅ |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary account | ✅ for image + CV upload |
| `OPENAI_API_KEY` / `GEMINI_API_KEY` / `GROQ_API_KEY` | at least one for `/api/chat` | depends on feature |
| `CHAT_ENABLE_RULES` | `true` | optional |
| `AI_MONTHLY_CAP_USD` | `25.00` | optional |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` | SMTP credentials | for admin email features |
| `GITHUB_APP_ID` / `GITHUB_APP_PRIVATE_KEY` / `GITHUB_INSTALLATION_ID` / `GITHUB_WEBHOOK_SECRET` / `GITHUB_ORG_NAME` | GitHub App | for GitHub integration |

> CV (resume) uploads are now stored in Cloudinary (`resource_type: raw`,
> folder `fira-tech/resumes`) — the serverless filesystem is read-only, so the
> old local `uploads/resumes/` disk writes no longer occur. The committed legacy
> PDFs under `api/uploads/` are still served via `GET /uploads/*`.

---

## Deploying

### Option A — Git integration (recommended)

1. Connect the repo to Vercel.
2. Create **three** projects, each with its Root Directory set to `public-website`,
   `admin-site`, and `api`.
3. Set the env vars above per project (add to **Production**; add the same with
   staging values to Preview if you want working previews).
4. Configure Production Branch (e.g. `main` or `implementation`) as desired.
5. Push to the branch — each project builds and deploys independently.

### Option B — Vercel CLI

```bash
npx vercel deploy --prod --cwd public-website
npx vercel deploy --prod --cwd admin-site
npx vercel deploy --prod --cwd api
```

Ensure env vars are set per project (`vercel env add ...` or via the dashboard).

---

## Verified before this commit

- `npm run build` passes for `public-website` and `admin-site` (both emit `dist/`).
- `node --check src/server.js` and `node --check src/routes/public.js` pass.
- SPA rewrites added via `vercel.json` for both web units.
- API `app.listen` gated on `process.env.VERCEL`.

## Known non-blocking notes

- Both web bundles exceed Vite's 500 kB chunk warning (admin ~900 kB). Deploy
  works; consider route-level code splitting later.
- `express-rate-limit` is in-memory per serverless invocation — it stays as a
  soft rate limit, not a hard global one.
- `dotenv` is configured to read `.env.local`/`.env`; on Vercel those files are
  absent, so config falls through to the injected environment variables.