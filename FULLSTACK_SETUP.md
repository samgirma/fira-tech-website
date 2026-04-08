# Fira Tech Website - Full Stack Setup

## Architecture Overview
This React (Vite) frontend has been evolved into a full-stack application with:

- **Backend**: Vercel Serverless Functions (`/api` directory)
- **Database**: Supabase (PostgreSQL + pgvector)
- **ORM**: Prisma for database schema management
- **AI Assistant**: Vercel AI SDK with OpenAI for RAG functionality

## Database Schema
The Prisma schema includes:
- **User**: Admin users with authentication
- **Blog**: Blog posts with title, content, author relationships
- **Comment**: User comments with approval workflow
- **Role**: User roles (USER/ADMIN)

## API Endpoints
- `GET/POST /api/blogs` - Fetch and create blog posts
- `POST /api/comments` - Create comments (requires admin approval)
- `POST /api/chat` - AI assistant with RAG using blog content

## Environment Variables Required
Update your `.env` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

## Next Steps
1. Set up Supabase project and update environment variables
2. Run `npx prisma db push` to create database tables
3. Implement admin dashboard with authentication
4. Create blog management interface
5. Add AI chat component to frontend
6. Set up comment approval system

## Deployment
The `vercel.json` configuration is ready for Vercel deployment with serverless functions.
