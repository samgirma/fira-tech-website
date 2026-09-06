# Fira Command - Admin Architecture

## Overview

Fira Command is the internal administration platform for Fira Tech Solutions, designed as a founder-oriented business operating system.

**URL**: https://admin.firatech.systems

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State**: React Query (TanStack Query)
- **Routing**: React Router DOM v6
- **Auth**: Cookie-based JWT (via API)

## Directory Structure

```
admin-site/
├── src/
│   ├── app/                    # App-level configuration
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── layout/             # App shell, sidebar, topbar
│   │   ├── charts/             # Chart components
│   │   └── shared/             # Shared components
│   ├── features/
│   │   ├── auth/               # Authentication
│   │   ├── dashboard/          # Overview/Dashboard
│   │   ├── my-day/             # Daily priorities
│   │   ├── leads/              # Sales leads
│   │   ├── customers/          # Customer management
│   │   ├── requests/           # Service requests
│   │   ├── proposals/          # Proposal management
│   │   ├── projects/           # Project management
│   │   ├── tasks/              # Task management
│   │   ├── website/            # Website CMS
│   │   ├── portfolio/          # Portfolio management
│   │   ├── blog/               # Blog management
│   │   ├── products/           # Product management
│   │   ├── careers/            # Job listings
│   │   ├── applications/       # Job applications
│   │   ├── finance/            # Revenue/Expenses/Invoices
│   │   ├── analytics/          # Business analytics
│   │   ├── insights/           # Founder insights
│   │   ├── goals/              # Goal tracking
│   │   └── settings/           # Application settings
│   ├── services/               # API client
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities
│   ├── types/                  # TypeScript types
│   └── styles/                 # Global styles
```

## Authentication

The admin site uses cookie-based JWT authentication via the existing API:

1. **Login**: `POST /api/auth/login` → Sets `auth-token` HTTP-only cookie
2. **Session**: `GET /api/auth/me` → Validates cookie, returns user profile
3. **Logout**: `POST /api/auth/logout` → Clears cookie

### Security Model

- Tokens stored as HTTP-only cookies (not localStorage)
- SameSite=Strict for CSRF protection
- 1-hour token expiry
- Role-based access (ADMIN role required)
- API enforces authorization server-side

## API Integration

The admin site communicates with the API at:

- **Development**: `http://localhost:3000`
- **Production**: `https://api.firatech.systems`

### API Client

Located at `src/services/api.ts`, provides typed methods for all API endpoints.

## Navigation Structure

```
OVERVIEW
  ├── Overview
  └── My Day

BUSINESS
  ├── Leads
  ├── Customers
  ├── Requests
  └── Proposals

OPERATIONS
  ├── Projects
  └── Tasks

CONTENT
  ├── Website
  ├── Portfolio
  ├── Blog
  ├── Testimonials
  └── Media

PRODUCTS
  ├── Products
  └── Roadmap

PEOPLE
  ├── Careers
  └── Applications

MONEY
  ├── Revenue
  ├── Expenses
  └── Invoices

INSIGHTS
  ├── Analytics
  ├── Insights
  └── Goals

SYSTEM
  ├── Notifications
  ├── Settings
  └── Audit Log
```

## Design System

### Colors

- **Brand**: Blue palette (primary actions)
- **Gold**: Accent color (highlights)
- **Surface**: Gray scale (backgrounds, text)

### Components

Reusable component classes defined in `src/index.css`:

- `.card` - Card container
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.input` - Form input
- `.badge` - Status badge
- `.table` - Data table
- `.skeleton` - Loading skeleton

## Key Features

### Phase A (Implemented)
- ✅ Application shell with collapsible sidebar
- ✅ Authentication (login/logout)
- ✅ Design system with Tailwind
- ✅ Navigation with section grouping
- ✅ Global search (Ctrl+K)
- ✅ Quick create menu
- ✅ Profile menu

### Phase B (Implemented)
- ✅ Founder dashboard with business snapshot
- ✅ My Day with priority tasks
- ✅ Project health overview
- ✅ Recent activity feed
- ✅ Founder insights

### Phase C (Implemented)
- ✅ Leads with Kanban/Table views
- ✅ Pipeline visualization

### Remaining Phases
- Phase D: Tasks management
- Phase E: Website CMS, Portfolio, Blog, Testimonials, Media
- Phase F: Products, Careers, Applications
- Phase G: Finance (Revenue, Expenses, Invoices)
- Phase H: Analytics, Goals, Insights
- Phase I: Settings, Audit, Permissions

## Responsive Design

- **Desktop**: 1280px+ (optimized for 1440px)
- **Tablet**: 768px+
- **Mobile**: 360px+

The sidebar collapses on smaller screens. Mobile navigation prioritizes key founder actions.

## Performance

- Code splitting by feature
- Lazy loading of routes
- Skeleton loading states
- React Query for API caching
- Optimistic updates where safe

## Security

- No secrets exposed in browser code
- API enforces authorization
- HTTP-only cookies for tokens
- CORS restricted to allowed origins
- Input validation on forms
