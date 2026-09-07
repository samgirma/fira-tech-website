import nodemailer from 'nodemailer'
import { config } from '../config/index.js'
import { db } from '../config/database.js'
import { logger } from './logger.js'

let transporter = null

function getTransporter() {
  if (transporter) return transporter

  const host = config.email?.host || process.env.SMTP_HOST
  const port = config.email?.port || parseInt(process.env.SMTP_PORT || '587')
  const user = config.email?.user || process.env.SMTP_USER
  const pass = config.email?.pass || process.env.SMTP_PASS
  const secure = config.email?.secure ?? (process.env.SMTP_SECURE === 'true')

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    })
    logger.info({ host, port, user }, 'Nodemailer SMTP transport initialized')
  }

  return transporter
}

/**
 * Builds a luxury Fira Tech styled HTML email template.
 */
function buildHtmlEmail({ recipientName, subject, body }) {
  // Convert newlines in body to paragraphs / linebreaks
  const formattedBody = body
    .split('\n\n')
    .map(p => `<p style="margin: 0 0 16px; line-height: 1.6; color: #334155;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0c1410; padding: 24px 32px; border-bottom: 2px solid #eab308;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">FIRA TECH</span>
                    <span style="display: block; font-size: 11px; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px;">Sovereign Software Architecture</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px 28px; font-size: 15px;">
              ${formattedBody}

              <!-- Signature -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-weight: 700; color: #0f172a;">Samuel Girma</p>
                <p style="margin: 2px 0 0; font-size: 13px; color: #64748b;">Founder & Principal Architect</p>
                <p style="margin: 2px 0 0; font-size: 13px; color: #d97706; font-weight: 600;">Fira Tech Solutions</p>
                <p style="margin: 6px 0 0; font-size: 12px; color: #94a3b8;">
                  <a href="https://firatech.systems" style="color: #64748b; text-decoration: none;">firatech.systems</a> &bull; Adama, Ethiopia
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 16px 32px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0;">
              This message was sent regarding your application at Fira Tech Solutions. Please reply directly to this email to reach us.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Sends a candidate reachout email and audits it in application_emails.
 */
export async function sendCandidateEmail({
  applicationId,
  recipientEmail,
  recipientName,
  subject,
  body,
  template = 'custom',
  sentByUserId = null,
}) {
  if (!recipientEmail || !subject || !body) {
    throw new Error('Recipient email, subject, and body are required')
  }

  const from = config.email?.from || process.env.EMAIL_FROM || 'Fira Tech Solutions <careers@firatech.systems>'
  const mailTransporter = getTransporter()
  const html = buildHtmlEmail({ recipientName, subject, body })

  let messageId = `msg-${Date.now()}`
  let mode = 'simulated'

  if (mailTransporter) {
    try {
      const info = await mailTransporter.sendMail({
        from,
        to: recipientEmail,
        replyTo: process.env.CONTACT_EMAIL || 'contact@firatech.systems',
        subject,
        text: body,
        html,
      })
      messageId = info.messageId
      mode = 'live'
      logger.info({ messageId, to: recipientEmail, subject }, 'Live email sent to candidate')
    } catch (err) {
      logger.error({ err: err.message, to: recipientEmail }, 'Failed to send live email via SMTP; falling back to logged dispatch')
      mode = 'simulated_fallback'
    }
  } else {
    logger.info({ to: recipientEmail, subject, template }, 'Email dispatch simulated (SMTP not configured)')
  }

  // Audit record in database
  let auditRecord = null
  try {
    const result = await db.query(
      `INSERT INTO application_emails 
        (application_id, recipient_email, recipient_name, subject, body, template, sent_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [applicationId || null, recipientEmail, recipientName, subject, body, template, sentByUserId || null, 'sent']
    )
    auditRecord = result.rows[0]
  } catch (dbErr) {
    logger.error({ dbErr: dbErr.message }, 'Failed to record application email in database')
  }

  return {
    success: true,
    messageId,
    mode,
    email: auditRecord,
  }
}
