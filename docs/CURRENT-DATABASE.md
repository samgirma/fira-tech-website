# Current Database Documentation

## Database Technology

- **Provider**: Supabase (Hosted PostgreSQL)
- **URL**: https://dboquayegkmmkyjjsczv.supabase.co
- **Access**: Direct client-side (frontend) + Server-side (API)

---

## Existing Tables

### profiles
User profiles for authentication and authorization.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (matches Supabase Auth user ID) |
| email | TEXT | User email |
| name | TEXT | Display name |
| role | TEXT | User role (e.g., 'ADMIN') |

**Usage**: Admin authentication, blog author references.

---

### blogs
Blog posts and articles.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Blog title |
| content | TEXT | Blog content (likely Markdown/HTML) |
| slug | TEXT | URL-friendly identifier |
| author_id | UUID | Foreign key → profiles.id |
| published | BOOLEAN | Publication status |
| created_at | TIMESTAMP | Creation timestamp |

**Usage**: Public blog listing, admin blog management.

---

### comments
Blog post comments.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| content | TEXT | Comment text |
| author | TEXT | Commenter name |
| email | TEXT | Commenter email |
| blog_id | UUID | Foreign key → blogs.id |
| approved | BOOLEAN | Moderation status |
| created_at | TIMESTAMP | Creation timestamp |

**Usage**: Public comment submission, admin moderation.

---

### jobs
Job listings for careers page.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Job title |
| description | TEXT | Job description |
| department | TEXT | Department |
| location | TEXT | Job location |
| type | TEXT | Employment type |
| experience | TEXT | Experience requirements |
| remote | BOOLEAN | Remote work availability |
| is_active | BOOLEAN | Active status |
| created_at | TIMESTAMP | Creation timestamp |

**Usage**: Public job listings, admin job management.

---

### contact_messages
Contact form submissions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Sender name |
| email | TEXT | Sender email |
| subject | TEXT | Message subject |
| message | TEXT | Message content |
| is_read | BOOLEAN | Read status |
| created_at | TIMESTAMP | Creation timestamp |

**Usage**: Contact form, admin message management.

---

### settings
Key-value configuration store.

| Column | Type | Description |
|--------|------|-------------|
| key | TEXT | Primary key (unique) |
| value | TEXT | JSON-encoded value |

**Known Keys**:
- `site_stats` - Site statistics (JSON array)
- `satisfaction_responses` - Client satisfaction survey responses
- `satisfaction_links` - Generated survey links

**Usage**: Dynamic site configuration, satisfaction surveys.

---

### social_links
Social media links for footer/contact.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| platform | TEXT | Platform name |
| url | TEXT | Profile URL |
| icon | TEXT | Icon identifier |
| label | TEXT | Display label |
| sort_order | INTEGER | Display order |
| is_active | BOOLEAN | Visibility status |

**Usage**: Footer social links, admin link management.

---

### knowledge_base
AI chatbot knowledge base with vector embeddings.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Entry title |
| content | TEXT | Entry content |
| category | TEXT | Category classification |
| embedding | VECTOR(1536) | Gemini embedding vector |

**Usage**: AI chatbot context retrieval via vector search.

---

## Relationships

```
profiles (1) ──→ (many) blogs
blogs (1) ──→ (many) comments
```

---

## Supabase Services Used

### Authentication
- Email/password sign-in
- Session management
- Role-based access (ADMIN role)

### Database
- Direct client queries (frontend)
- Server-side queries (API)
- RPC functions (vector search)

### Row Level Security
- Not explicitly configured in code
- Relies on service role key for admin operations

---

## Migration Strategy

- **Current**: Manual SQL migrations in `supabase/` directory
- **Files**:
  - `add_contact_messages.sql`
  - `add_settings_table.sql`
  - `fix_index.sql`
  - `fix_knowledge_base_unique.sql`
  - `fix_social_link_icons.sql`
  - `seed_knowledge_base.sql`
  - `seed_social_links.sql`
  - `migrations/` (directory)

---

## Notes

1. **No ORM**: Direct Supabase client usage throughout
2. **JSON Storage**: Settings table uses JSON-encoded values for flexible configuration
3. **Vector Search**: knowledge_base table uses pgvector for AI chatbot
4. **Soft Deletion**: No hard deletes visible; records are filtered by status flags
5. **Timestamps**: Most tables have `created_at` but not `updated_at`
