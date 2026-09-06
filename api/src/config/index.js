import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

export const config = {
  port: process.env.PORT || 3000,
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'fira_tech',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: '24h',
  },

  cors: {
    origins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
      : ['http://localhost:5173', 'http://localhost:3001', 'https://firatech.systems', 'https://admin.firatech.systems'],
  },

  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },

  ai: {
    openaiKey: process.env.OPENAI_API_KEY,
    geminiKey: process.env.GEMINI_API_KEY,
    groqKey: process.env.GROQ_API_KEY,
    chatEnableRules: process.env.CHAT_ENABLE_RULES === 'true',
  },

  github: {
    appId: process.env.GITHUB_APP_ID,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
    installationId: process.env.GITHUB_INSTALLATION_ID,
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
    orgName: process.env.GITHUB_ORG_NAME,
    apiVersion: process.env.GITHUB_API_VERSION || '2022-11-28',
  },
}
