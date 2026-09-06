# API Migration Plan

## Overview

This document tracks the migration of data access from direct Supabase calls to the centralized API.

---

## Current Architecture (Direct Access)

```
Public Website ──→ Supabase (direct)
Mobile App ──→ Supabase (direct)
```

## Target Architecture (API Gateway)

```
Public Website ──→ API ──→ Supabase
Admin Site ──→ API ──→ Supabase
Mobile App ──→ API ──→ Supabase
```

---

## Migration Status by Feature

### Blogs

| Aspect | Current | Target | Status |
|--------|---------|--------|--------|
| List published | Direct Supabase query | `GET /api/blogs` | ✅ Exists |
| Create (admin) | Direct Supabase query | `POST /api/admin/blogs` | ✅ Exists |
| Delete (admin) | Direct Supabase query | `DELETE /api/admin/blogs` | ✅ Exists |
| Frontend calls | `supabase.from('blogs').select()` | `fetch('/api/blogs')` | ❌ Not migrated |

**Action Required**: Update frontend to use API endpoints instead of direct Supabase queries.

---

### Comments

| Aspect | Current | Target | Status |
|--------|---------|--------|--------|
| Submit comment | Direct Supabase query | `POST /api/comments` | ✅ Exists |
| List (admin) | Direct Supabase query | `GET /api/admin/comments` | ✅ Exists |
| Approve (admin) | Direct Supabase query | `PUT /api/admin/comments` | ✅ Exists |
| Delete (admin) | Direct Supabase query | `DELETE /api/admin/comments` | ✅ Exists |
| Frontend calls | `supabase.from('comments').insert()` | `fetch('/api/comments')` | ❌ Not migrated |

---

### Jobs / Careers

| Aspect | Current | Target | Status |
|--------|---------|--------|--------|
| List active | Direct Supabase query | `GET /api/jobs` | ✅ Exists |
| CRUD (admin) | Direct Supabase query | `/api/admin/jobs` | ✅ Exists |
| Frontend calls | `supabase.from('jobs').select()` | `fetch('/api/jobs')` | ❌ Not migrated |

---

### Contact Form

| Aspect | Current | Target | Status |
|--------|---------|--------|--------|
| Submit | Direct Supabase query | `POST /api/contact` | ✅ Exists |
| List (admin) | Direct Supabase query | `GET /api/admin/contact` | ✅ Exists |
| Frontend calls | `supabase.from('contact_messages').insert()` | `fetch('/api/contact')` | ❌ Not migrated |

---

### Settings

| Aspect | Current | Target | Status |
|--------|---------|--------|--------|
| Get public | Direct Supabase query | `GET /api/settings` | ✅ Exists |
| Update (admin) | Direct Supabase query | `PUT /api/admin/settings` | ✅ Exists |
| Frontend calls | `supabase.from('settings').select()` | `fetch('/api/settings')` | ❌ Not migrated |

---

### Social Links

| Aspect | Current | Target | Status |
|--------|---------|--------|--------|
| Get active | Direct Supabase query | `GET /api/social-links` | ✅ Exists |
| CRUD (admin) | Direct Supabase query | `/api/admin/social-links` | ✅ Exists |
| Frontend calls | `supabase.from('social_links').select()` | `fetch('/api/social-links')` | ❌ Not migrated |

---

### Site Stats

| Aspect | Current | Target | Status |
|--------|---------|--------|--------|
| Get public | Direct Supabase query | `GET /api/site-stats` | ✅ Exists |
| Update (admin) | Direct Supabase query | `PUT /api/admin/site-stats` | ✅ Exists |
| Frontend calls | `supabase.from('settings').select()` | `fetch('/api/site-stats')` | ❌ Not migrated |

---

### Satisfaction Survey

| Aspect | Current | Target | Status |
|--------|---------|--------|--------|
| Submit | Direct Supabase query | `POST /api/satisfaction` | ✅ Exists |
| Validate link | Direct Supabase query | `GET /api/satisfaction/validate-link` | ✅ Exists |
| Generate link (admin) | Direct Supabase query | `POST /api/admin/satisfaction/generate-link` | ✅ Exists |
| Frontend calls | `supabase.from('settings').upsert()` | `fetch('/api/satisfaction')` | ❌ Not migrated |

---

### Authentication

| Aspect | Current | Target | Status |
|--------|---------|--------|--------|
| Login | Direct Supabase auth | `POST /api/auth/login` | ✅ Exists |
| Get current user | Direct Supabase auth | `GET /api/auth/me` | ✅ Exists |
| Logout | Direct Supabase auth | `POST /api/auth/logout` | ✅ Exists |
| Frontend calls | `supabase.auth.signInWithPassword()` | `fetch('/api/auth/login')` | ❌ Not migrated |

---

### AI Chat

| Aspect | Current | Target | Status |
|--------|---------|--------|--------|
| Send message | Direct Supabase + AI APIs | `POST /api/chat` | ✅ Exists |
| Frontend calls | Direct fetch to `/api/chat` | Same | ✅ Already uses API |

---

### Image Upload

| Aspect | Current | Target | Status |
|--------|---------|--------|--------|
| Upload | Direct Cloudinary via server | `POST /api/upload` | ✅ Exists |
| Frontend calls | `fetch('/api/upload')` | Same | ✅ Already uses API |

---

## Frontend Files Requiring Migration

### Direct Supabase Usage (Need to migrate to API calls)

1. **src/pages/Blogs.tsx** - Blog listing
2. **src/pages/BlogDetail.tsx** - Blog detail + comments
3. **src/pages/Careers.tsx** - Job listings
4. **src/pages/FeedbackPage.tsx** - Satisfaction survey
5. **src/components/CommentsSection.tsx** - Comment submission
6. **src/components/ContactSection.tsx** - Contact form
7. **src/components/CommunitySection.tsx** - Site stats
8. **src/components/Footer.tsx** - Social links
9. **src/components/ChatAssistant.tsx** - AI chat (already uses API)

### Already Using API

- ChatAssistant.tsx - Uses `/api/chat`

---

## Migration Priority

### Phase 2 (Immediate)
1. Blogs listing
2. Comments submission
3. Jobs listing
4. Contact form submission
5. Settings retrieval

### Phase 3 (Later)
1. Authentication flow
2. Admin CRUD operations
3. Satisfaction survey
4. Site stats

---

## Migration Pattern

### Before (Direct Supabase)
```typescript
const { data, error } = await supabase
  .from('blogs')
  .select('*')
  .eq('published', true)
```

### After (API Call)
```typescript
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs`)
const data = await response.json()
```

---

## Notes

1. **API Endpoints Exist**: All backend endpoints are already implemented
2. **Frontend Not Updated**: The frontend still uses direct Supabase queries
3. **Gradual Migration**: Can migrate feature by feature without breaking changes
4. **Backward Compatible**: Direct Supabase access still works during migration
