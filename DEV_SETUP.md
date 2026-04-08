# Development Setup Instructions

## API Server Setup

The admin panel requires a mock API server to run during development. Follow these steps:

### 1. Start the Development Server
```bash
npm run dev
```

This will start both:
- Mock API server on `http://localhost:3000`
- Vite development server on `http://localhost:8080`

### 2. Admin Login Credentials
- **Email**: `admin@fira.tech`
- **Password**: `admin123`

### 3. Access Admin Panel
Navigate to `http://localhost:8080/admin` to access the admin dashboard.

## API Endpoints

The mock server provides these endpoints:

### Authentication
- `POST /api/auth/login` - Admin login

### Blog Management
- `GET /api/admin/blogs` - Fetch all blogs
- `POST /api/admin/blogs` - Create new blog
- `PUT /api/admin/blogs` - Update blog
- `DELETE /api/admin/blogs` - Delete blog

### Comment Management
- `GET /api/admin/comments` - Fetch all comments
- `PUT /api/admin/comments` - Approve/reject comment
- `DELETE /api/admin/comments` - Delete comment

## Production Deployment

For production deployment on Vercel:
1. The API routes in `/api` directory will automatically work
2. Remove the mock server (`server.js`)
3. Update `package.json` scripts to use only `vite` for dev
4. Configure environment variables in Vercel dashboard

## Environment Variables

Create a `.env` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
OPENAI_API_KEY=your_openai_api_key_here
```
