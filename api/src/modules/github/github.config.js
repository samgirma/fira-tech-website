import { config } from '../../config/index.js'

export const githubConfig = {
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
  installationId: process.env.GITHUB_INSTALLATION_ID,
  webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
  orgName: process.env.GITHUB_ORG_NAME,
  apiVersion: process.env.GITHUB_API_VERSION || '2022-11-28',
  baseUrl: 'https://api.github.com',
}
