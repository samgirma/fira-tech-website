import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// API Routes
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

app.use('/api/auth/login', async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      // Mock authentication - in production, verify against database
      if (email === 'admin@fira.tech' && password === 'admin123') {
        const user = {
          id: '1',
          email: 'admin@fira.tech',
          name: 'Admin User',
          role: 'ADMIN'
        };
        
        // Generate JWT token
        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
          },
          JWT_SECRET
        );
        
        // Set secure HTTP-only cookie
        const cookie = `auth-token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`;
        res.setHeader('Set-Cookie', cookie);
        
        return res.status(200).json({
          user,
          message: 'Login successful'
        });
      }
      
      return res.status(401).json({ error: 'Invalid credentials' });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
});

app.use('/api/auth/me', async (req, res) => {
  if (req.method === 'GET') {
    try {
      // Extract token from cookie
      const cookieHeader = req.headers.cookie || '';
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
      }, {});
      
      const token = cookies['auth-token'];
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      
      return res.status(200).json({
        user: {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role
        }
      });
    } catch (error) {
      console.error('Auth me error:', error);
      return res.status(401).json({ error: 'Token verification failed' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
});

app.use('/api/auth/logout', async (req, res) => {
  if (req.method === 'POST') {
    try {
      // Clear the auth cookie
      const cookie = 'auth-token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
      res.setHeader('Set-Cookie', cookie);
      
      return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
});

app.use('/api/blogs', async (req, res) => {
  if (req.method === 'GET') {
    // Mock blogs data
    const mockBlogs = [
      {
        id: '1',
        title: 'Welcome to Fira Tech - Technology Meets Heritage',
        content: 'At Fira Tech, we believe in the power of technology to preserve and celebrate our rich cultural heritage. Our mission is to create innovative digital solutions that connect communities and empower local businesses across Africa and beyond. Through our work, we strive to bridge the gap between traditional values and modern innovation, creating a future where technology serves as a catalyst for cultural preservation and economic growth.',
        slug: 'welcome-to-fira-tech',
        published: true,
        createdAt: new Date().toISOString(),
        author: { name: 'Admin User', email: 'admin@fira.tech' },
        _count: { comments: 5 }
      },
      {
        id: '2',
        title: 'Building Digital Communities in Ethiopia',
        content: 'Digital transformation is reshaping how communities in Ethiopia connect, collaborate, and grow. In this post, we explore the challenges and opportunities of building digital infrastructure that serves local needs while preserving cultural identity. From mobile banking solutions to educational platforms, discover how technology is empowering Ethiopian communities to participate in the global digital economy while maintaining their unique heritage.',
        slug: 'building-digital-communities-ethiopia',
        published: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        author: { name: 'Admin User', email: 'admin@fira.tech' },
        _count: { comments: 3 }
      },
      {
        id: '3',
        title: 'The Future of African Tech Innovation',
        content: 'Africa is rapidly emerging as a hub for technological innovation, with startups and developers creating solutions tailored to local challenges. This blog post examines the current state of tech innovation across the continent, highlighting success stories from Kenya, Nigeria, South Africa, and Ethiopia. We discuss the importance of homegrown solutions and how they differ from imported technologies in addressing African needs.',
        slug: 'future-african-tech-innovation',
        published: true,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        author: { name: 'Admin User', email: 'admin@fira.tech' },
        _count: { comments: 8 }
      }
    ];
    return res.status(200).json(mockBlogs);
  }
  
  if (req.method === 'POST') {
    const { title, content, authorId } = req.body;
    const mockBlog = {
      id: Date.now().toString(),
      title,
      content,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      published: true,
      createdAt: new Date().toISOString(),
      author: { name: 'Admin User', email: 'admin@fira.tech' },
      _count: { comments: 0 }
    };
    return res.status(201).json(mockBlog);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
});

app.use('/api/admin/blogs', async (req, res) => {
  if (req.method === 'GET') {
    // Mock blogs data
    const mockBlogs = [
      {
        id: '1',
        title: 'Welcome to Fira Tech',
        content: 'This is our first blog post about technology and heritage.',
        slug: 'welcome-to-fira-tech',
        published: true,
        createdAt: new Date().toISOString(),
        author: { name: 'Admin User', email: 'admin@fira.tech' },
        _count: { comments: 2 }
      }
    ];
    return res.status(200).json(mockBlogs);
  }
  
  if (req.method === 'POST') {
    const { title, content } = req.body;
    const mockBlog = {
      id: Date.now().toString(),
      title,
      content,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      published: true,
      createdAt: new Date().toISOString(),
      author: { name: 'Admin User', email: 'admin@fira.tech' },
      _count: { comments: 0 }
    };
    return res.status(201).json(mockBlog);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
});

app.use('/api/chat', async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      // Mock AI responses based on keywords
      let response = '';
      
      if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
        response = 'Hello! I\'m your Fira Tech assistant. How can I help you today? I can tell you about our services, technology solutions, or answer questions about digital innovation in Africa.';
      } else if (message.toLowerCase().includes('service') || message.toLowerCase().includes('offer')) {
        response = 'At Fira Tech, we offer comprehensive digital solutions including web development, mobile apps, digital transformation consulting, and community-focused technology platforms. We specialize in creating solutions that blend modern technology with cultural heritage preservation.';
      } else if (message.toLowerCase().includes('blog') || message.toLowerCase().includes('article')) {
        response = 'We have several blog posts about technology and heritage! You can check out our latest posts about "Building Digital Communities in Ethiopia" and "The Future of African Tech Innovation" on our blogs page. Would you like me to tell you more about any specific topic?';
      } else if (message.toLowerCase().includes('contact') || message.toLowerCase().includes('reach')) {
        response = 'You can reach us through our contact form on the website, or email us directly. We\'re based in Adama, Ethiopia and would love to discuss how we can help bring your digital ideas to life!';
      } else if (message.toLowerCase().includes('heritage') || message.toLowerCase().includes('culture')) {
        response = 'Cultural heritage is at the heart of what we do at Fira Tech. We believe technology should enhance and preserve cultural traditions, not replace them. Our projects focus on creating digital platforms that celebrate African heritage while enabling modern innovation.';
      } else if (message.toLowerCase().includes('ethiopia') || message.toLowerCase().includes('africa')) {
        response = 'Ethiopia and Africa are experiencing incredible technological growth! We\'re proud to be part of this transformation, creating solutions that address local challenges while connecting communities to global opportunities. From fintech to edtech, African innovation is leading the way.';
      } else {
        response = 'Thank you for your question! I\'m here to help you learn about Fira Tech and our mission to blend technology with heritage. Feel free to ask me about our services, blog posts, or how we can help with your digital projects. Is there something specific you\'d like to know?';
      }
      
      return res.status(200).json({ response });
    } catch (error) {
      console.error('Chat error:', error);
      return res.status(500).json({ error: 'Failed to process message' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
});

app.use('/api/comments', async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { content, author, email, blogId } = req.body;
      
      if (!content || !author || !blogId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Mock comment creation (in production this would save to database)
      const mockComment = {
        id: Date.now().toString(),
        content,
        author,
        email: email || null,
        approved: false, // Comments require admin approval
        createdAt: new Date().toISOString(),
        blogId
      };
      
      console.log('New comment submitted (pending approval):', mockComment);
      
      return res.status(201).json({
        message: 'Comment submitted successfully! It will be visible after approval.',
        comment: mockComment
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      return res.status(500).json({ error: 'Failed to submit comment' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
});

app.use('/api/admin/comments', async (req, res) => {
  if (req.method === 'GET') {
    // Mock comments data
    const mockComments = [
      {
        id: '1',
        content: 'Great article! Very informative about the intersection of technology and heritage in Africa.',
        author: 'John Doe',
        email: 'john@example.com',
        approved: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        blog: { title: 'Welcome to Fira Tech', slug: 'welcome-to-fira-tech' }
      },
      {
        id: '2',
        content: 'I love how Fira Tech is preserving cultural heritage while embracing modern technology. This is exactly what Africa needs!',
        author: 'Sarah Johnson',
        email: 'sarah@example.com',
        approved: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        blog: { title: 'Building Digital Communities', slug: 'building-digital-communities' }
      },
      {
        id: '3',
        content: 'The work you\'re doing in Ethiopia is inspiring. Keep pushing the boundaries of innovation!',
        author: 'Michael Chen',
        email: 'michael@example.com',
        approved: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        blog: { title: 'Future of African Tech', slug: 'future-african-tech' }
      },
      {
        id: '4',
        content: 'Great article! Very informative.',
        author: 'Jane Smith',
        email: 'jane@example.com',
        approved: false,
        createdAt: new Date().toISOString(),
        blog: { title: 'Welcome to Fira Tech', slug: 'welcome-to-fira-tech' }
      }
    ];
    return res.status(200).json(mockComments);
  }
  
  if (req.method === 'PUT') {
    const { id, approved } = req.body;
    return res.status(200).json({ id, approved, message: 'Comment updated successfully' });
  }
  
  if (req.method === 'DELETE') {
    const { id } = req.query;
    return res.status(200).json({ message: 'Comment deleted successfully' });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on http://localhost:${PORT}`);
  console.log('📝 Mock credentials: admin@fira.tech / admin123');
});
